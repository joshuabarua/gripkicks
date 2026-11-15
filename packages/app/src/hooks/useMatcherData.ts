import { useEffect, useMemo } from 'react';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import {
  calculateShoeScore,
  calculateUserPreferenceProfile,
  preferencesFromProfile,
  type SoleMateAggregate,
} from 'convex/utils/matchScore';
import { toFivePointScale, toHundredPointScale } from 'convex/utils/scoring';
import type { CommunitySignal, MatchSignals } from '../../../../types/shoe';

// Mobile port of the web Matcher data (packages/web/src/hooks/useShoeScoring.ts,
// useFindMyShoe.ts and MatcherView.tsx). Personal scores come from the same
// shared calculateShoeScore, so the app and website agree on every match.

export type MatcherMode = 'personal' | 'community';

export interface Metrics {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  versatility: number;
}

export interface Breakdown {
  footTypeCompatibility: number;
  volumeCompatibility: number;
  userPreferenceMatch: number;
  communityApproval: number;
  overallRating: number;
  learnedPreferenceBonus: number;
}

export interface DisplayShoe {
  id: string;
  brand: string;
  name: string;
  imageUrl?: string;
  primaryScore: number;
  secondaryLabel: string;
  totalRatings?: number;
  communitySignals?: CommunitySignal[];
  signals?: MatchSignals;
  metrics: Metrics;
  breakdown?: Breakdown;
}

export interface SoleMateShoe {
  shoe: { _id: string; name: string; brand: string; imageUrl?: string };
  matchScore: number;
}

export interface SoleMateClimber {
  user: { _id: string; name?: string; image?: string };
  shoes: SoleMateShoe[];
}

type FootUser = { _id: Doc<'users'>['_id']; footShape?: string; footVolume?: string } | null | undefined;

export function useMatcherData(convexUser: FootUser) {
  const footProfile = useMemo(
    () => (convexUser?.footShape && convexUser?.footVolume ? { shape: convexUser.footShape, volume: convexUser.footVolume } : null),
    [convexUser?.footShape, convexUser?.footVolume],
  );

  // Personal scoring needs the whole catalogue, loaded 100 at a time like the web.
  const { results: shoes, status, loadMore } = usePaginatedQuery(api.shoes.list, {}, { initialNumItems: 100 });
  useEffect(() => {
    if (status === 'CanLoadMore') loadMore(100);
  }, [status, loadMore]);

  const popularity = useQuery(api.popularity.getAllShoesPopularity);
  const stash = useQuery(api.stash.getUserStash, convexUser?._id ? { userId: convexUser._id } : 'skip');
  const soleMateAggregates = useQuery(
    api.stash.getSoleMateAggregates,
    footProfile ? { footShape: footProfile.shape.toLowerCase(), footVolume: footProfile.volume.toLowerCase() } : 'skip',
  );
  const community = useQuery(api.recommendations.getCommunityTopShoes, { limit: 10 });
  const recommendations = useQuery(
    api.recommendations.getShoeRecommendations,
    convexUser?._id && footProfile
      ? ({ userId: convexUser._id, footShape: footProfile.shape, footVolume: footProfile.volume, page: 1, pageSize: 10 } as never)
      : 'skip',
  );

  const preferenceProfile = useMemo(
    () => (stash && stash.length > 0 ? calculateUserPreferenceProfile(stash as never) : null),
    [stash],
  );

  const personal: DisplayShoe[] = useMemo(() => {
    if (!shoes || !popularity) return [];
    const soleMateMap = new Map<string, SoleMateAggregate>(
      Array.isArray(soleMateAggregates) ? soleMateAggregates.map((s) => [s.shoeId, s]) : [],
    );
    const preferences = preferencesFromProfile(preferenceProfile);
    return shoes
      .map((shoe) => calculateShoeScore(shoe, footProfile, preferences, popularity, preferenceProfile, soleMateMap))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
      .map((s) => ({
        id: s.shoe._id,
        brand: s.shoe.brand,
        name: s.shoe.name,
        ...(s.shoe.imageUrl ? { imageUrl: s.shoe.imageUrl } : {}),
        primaryScore: toHundredPointScale(s.totalScore, 5),
        secondaryLabel: 'match',
        metrics: {
          comfort: s.metrics.comfort,
          performance: s.metrics.performance,
          durability: s.metrics.durability,
          aggressiveness: s.metrics.aggressiveness,
          versatility: s.metrics.versatility,
        },
        breakdown: s.breakdown,
        signals: s.signals,
      }));
  }, [shoes, popularity, footProfile, preferenceProfile, soleMateAggregates]);

  const communityShoes: DisplayShoe[] = useMemo(
    () =>
      (community ?? []).map((s) => ({
        id: s._id,
        brand: s.brand,
        name: s.name,
        ...(s.imageUrl ? { imageUrl: s.imageUrl } : {}),
        primaryScore: toHundredPointScale(s.compositeScore, 10),
        secondaryLabel: `${s.totalRatings} ratings`,
        totalRatings: s.totalRatings,
        communitySignals: (s.communitySignals ?? []) as CommunitySignal[],
        metrics: {
          comfort: toFivePointScale(s.avgComfort),
          performance: toFivePointScale(s.avgPerformance),
          durability: toFivePointScale(s.avgDurability),
          aggressiveness: toFivePointScale(s.avgAggressiveness),
          versatility: Math.max(0, 5 - toFivePointScale(s.avgAggressiveness)),
        },
      })),
    [community],
  );

  // Group highly rated shoes by the sole mates who rated them (same as web useFindMyShoe).
  const soleMates: SoleMateClimber[] = useMemo(() => {
    const items = (recommendations as { items?: unknown } | undefined)?.items;
    if (!Array.isArray(items)) return [];
    const grouped = new Map<string, SoleMateClimber>();
    for (const item of items as Array<{
      _id: string;
      name: string;
      brand: string;
      imageUrl?: string;
      matchScore: number;
      isSoleMateMatch?: boolean;
      soleMateUsers?: Array<{ _id: string; name?: string; image?: string }>;
    }>) {
      if (!item.isSoleMateMatch || !item.soleMateUsers?.length) continue;
      const rating: SoleMateShoe = {
        shoe: { _id: item._id, name: item.name, brand: item.brand, ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}) },
        matchScore: item.matchScore,
      };
      for (const user of item.soleMateUsers) {
        const existing = grouped.get(user._id);
        if (existing) existing.shoes.push(rating);
        else grouped.set(user._id, { user, shoes: [rating] });
      }
    }
    return [...grouped.values()]
      .map((m) => ({ ...m, shoes: [...m.shoes].sort((a, b) => b.matchScore - a.matchScore) }))
      .sort((a, b) => b.shoes.length - a.shoes.length);
  }, [recommendations]);

  const fitProfile: Metrics | undefined =
    preferenceProfile && preferenceProfile.sampleSize > 0
      ? {
          comfort: preferenceProfile.comfort,
          performance: preferenceProfile.performance,
          durability: preferenceProfile.durability,
          aggressiveness: preferenceProfile.aggressiveness,
          versatility: preferenceProfile.versatility,
        }
      : undefined;

  return {
    hasProfile: !!footProfile,
    personal,
    personalLoading: status !== 'Exhausted' || popularity === undefined,
    community: communityShoes,
    communityLoading: community === undefined,
    soleMates,
    soleMatesLoading: !!footProfile && recommendations === undefined,
    fitProfile,
    ratedCount: ((stash ?? []) as Array<{ comfortScore?: number }>).filter((s) => s.comfortScore !== undefined).length,
  };
}
