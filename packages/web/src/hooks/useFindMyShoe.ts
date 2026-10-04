import { useMemo, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "./useCurrentUser";
import type { CommunitySignal, ShoeRecommendation } from "@/types/shoe";

export interface AggregatedRating {
  shoe: {
    _id: string;
    name: string;
    brand: string;
    imageUrl?: string | undefined;
    slug?: string | undefined;
    gender?: string | undefined;
    aggressiveness: string;
    stiffness: string;
    climbingDiscipline: string;
    volume: string;
  };
  avgComfortScore: number;
  avgPerformanceRating: number;
  avgDurabilityRating: number;
  totalRatings: number;
  matchScore: number;
  isSoleMateMatch: boolean;
  communitySignals: CommunitySignal[];
  soleMateUsers: {
    _id: string;
    name?: string | undefined;
    image?: string | undefined;
  }[];
}

export interface SoleMateClimberMatch {
  user: {
    _id: string;
    name?: string | undefined;
    image?: string | undefined;
  };
  shoes: AggregatedRating[];
}

interface PaginatedResult {
  items: ShoeRecommendation[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

interface UseFindMyShoeReturn {
  recommendations: AggregatedRating[];
  soleMateMatches: SoleMateClimberMatch[];
  isLoading: boolean;
  hasProfile: boolean;
  hasShoes: boolean;
  userShoeCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
    pageSize: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
  };
}

const DEFAULT_PAGE_SIZE = 20;

export function useFindMyShoe(
  pageSize: number = DEFAULT_PAGE_SIZE,
): UseFindMyShoeReturn {
  const { convexUser, isLoading: userLoading } = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);

  const userStash = useQuery(
    api.stash.getUserStash,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  const recommendationsQuery =
    "recommendations:getShoeRecommendations" as unknown as Parameters<
      typeof useQuery
    >[0];
  const recommendationsArgs = (convexUser?.footShape && convexUser?.footVolume
    ? {
      userId: convexUser._id,
      footShape: convexUser.footShape,
      footVolume: convexUser.footVolume,
      page: currentPage,
      pageSize,
    }
    : "skip") as unknown as Parameters<typeof useQuery>[1];

  const paginatedResult = useQuery(recommendationsQuery, recommendationsArgs);

  const hasProfile = useMemo(() => {
    return !!(convexUser?.footShape && convexUser?.footVolume);
  }, [convexUser]);

  const isLoading =
    userLoading || userStash === undefined || (hasProfile && paginatedResult === undefined);

  const hasShoes = useMemo(() => {
    return (userStash?.length ?? 0) > 0;
  }, [userStash]);

  const userShoeCount = userStash?.length ?? 0;

  const formattedRecommendations: AggregatedRating[] = useMemo(() => {
    const items = (paginatedResult as unknown as PaginatedResult | undefined)?.items;
    if (!Array.isArray(items)) {
      if (items !== undefined) {
        console.error("Invalid recommendation response: items must be an array");
      }
      return [];
    }

    return items.map((shoe) => ({
        shoe: {
          _id: shoe._id,
          name: shoe.name,
          brand: shoe.brand,
          imageUrl: shoe.imageUrl,
          slug: shoe.slug,
          gender: shoe.gender,
          aggressiveness: shoe.aggressiveness,
          stiffness: shoe.stiffness,
          climbingDiscipline: shoe.climbingDiscipline,
          volume: shoe.volume,
        },
        avgComfortScore: shoe.avgComfortScore ?? 0,
        avgPerformanceRating: shoe.avgPerformanceRating ?? 0,
        avgDurabilityRating: shoe.avgDurabilityRating ?? 0,
        totalRatings: shoe.totalRatings,
        matchScore: shoe.matchScore,
        isSoleMateMatch: shoe.isSoleMateMatch,
        communitySignals: shoe.communitySignals ?? [],
        soleMateUsers: shoe.soleMateUsers ?? [],
      }),
    );
  }, [paginatedResult]);

  const soleMateMatches = useMemo(() => {
    const groupedMatches = new Map<string, SoleMateClimberMatch>();

    for (const rating of formattedRecommendations) {
      if (!rating.isSoleMateMatch || rating.soleMateUsers.length === 0) {
        continue;
      }

      for (const user of rating.soleMateUsers) {
        const existing = groupedMatches.get(user._id);

        if (existing) {
          existing.shoes.push(rating);
          continue;
        }

        groupedMatches.set(user._id, {
          user,
          shoes: [rating],
        });
      }
    }

    return Array.from(groupedMatches.values())
      .map((match) => ({
        ...match,
        shoes: [...match.shoes].sort((a, b) => b.matchScore - a.matchScore),
      }))
      .sort((a, b) => b.shoes.length - a.shoes.length);
  }, [formattedRecommendations]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    if ((paginatedResult as unknown as PaginatedResult | undefined)?.hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginatedResult]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const pagination = useMemo(
    () => ({
      currentPage:
        (paginatedResult as unknown as PaginatedResult | undefined)
          ?.currentPage ?? 1,
      totalPages:
        (paginatedResult as unknown as PaginatedResult | undefined)
          ?.totalPages ?? 0,
      totalCount:
        (paginatedResult as unknown as PaginatedResult | undefined)
          ?.totalCount ?? 0,
      hasMore:
        (paginatedResult as unknown as PaginatedResult | undefined)?.hasMore ??
        false,
      pageSize,
      goToPage,
      nextPage,
      prevPage,
    }),
    [paginatedResult, pageSize, goToPage, nextPage, prevPage],
  );

  return {
    recommendations: formattedRecommendations,
    soleMateMatches,
    isLoading,
    hasProfile,
    hasShoes,
    userShoeCount,
    pagination,
  };
}
