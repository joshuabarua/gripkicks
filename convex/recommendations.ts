import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { footShapeValidator } from "./schema";
import type { CommunitySignal, ShoeRecommendation } from "../types/shoe";
import { requireUserAccess } from "./authorization";
import { fitLongevityToScore, sizingDeviationToScore, toHundredPointScale } from "./utils/scoring";
import { aggregateSoleMateRatings, calculateShoeScore, calculateUserPreferenceProfile, preferencesFromProfile } from "./utils/matchScore";
import { hydrateUserStash } from "./stash";

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

// Popularity counts owners per shoe, and a shoe cannot have more ratings than
// owners, so this narrows reads to shoes that can meet a rating threshold.
async function loadShoesWithOwners(ctx: QueryCtx, minOwners: number) {
  const popular = await ctx.db
    .query("popularity")
    .withIndex("by_count", (q) => q.gte("count", minOwners))
    .collect();

  const entries = await Promise.all(
    popular.map(async ({ shoeId, count }) => {
      const shoe = await ctx.db.get(shoeId);
      if (!shoe) return null;
      const userShoes = await ctx.db
        .query("userShoes")
        .withIndex("by_shoeId", (q) => q.eq("shoeId", shoeId))
        .collect();
      return { shoe, userShoes, count };
    }),
  );

  return entries.filter(
    (entry): entry is { shoe: Doc<"shoes">; userShoes: Doc<"userShoes">[]; count: number } => entry !== null,
  );
}

function avg(values: number[]) {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

function formatSignedDecimal(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function buildCommunitySignals(args: {
  avgComfort: number;
  avgPerformance: number;
  avgDurability: number;
  avgFitLongevity: number | null;
  avgSizingDeviationScore: number | null;
  avgRawSizingDeviation: number | null;
  avgAggressiveness: number | null;
  avgStiffness: number | null;
  brandAggressiveness?: number;
  brandStiffness?: number;
  totalRatings: number;
}): CommunitySignal[] {
  const signals: CommunitySignal[] = [];

  if (args.avgComfort >= 8.5) {
    signals.push({
      label: "Comfort favorite",
      value: `${args.avgComfort.toFixed(1)}/10`,
      detail: "Community comfort average is elite",
      tone: "good",
    });
  }

  if (args.avgPerformance >= 8.5) {
    signals.push({
      label: "High output",
      value: `${args.avgPerformance.toFixed(1)}/10`,
      detail: "Strong performance consensus",
      tone: "good",
    });
  }

  if (args.avgFitLongevity !== null && args.avgFitLongevity >= 7) {
    signals.push({
      label: "Holds fit",
      value: `${args.avgDurability.toFixed(1)}/10`,
      detail: "Fit longevity is trending strong",
      tone: "good",
    });
  }

  if (args.avgSizingDeviationScore !== null) {
    const isTrueToSize = args.avgSizingDeviationScore >= 8.5;
    signals.push({
      label: isTrueToSize ? "True fit" : "Size shift",
      value:
        args.avgRawSizingDeviation === null
          ? `${args.avgSizingDeviationScore.toFixed(1)}/10`
          : formatSignedDecimal(args.avgRawSizingDeviation),
      detail: isTrueToSize ? "Most climbers stay close to standard size" : "Community reports sizing deviation",
      tone: isTrueToSize ? "good" : "warn",
    });
  }

  if (
    args.brandAggressiveness !== undefined &&
    args.avgAggressiveness !== null &&
    Math.abs(args.brandAggressiveness - args.avgAggressiveness) >= 1
  ) {
    const softer = args.avgAggressiveness < args.brandAggressiveness;
    signals.push({
      label: "Reality check",
      value: softer ? "Less aggressive" : "More aggressive",
      detail: "Community feel differs from brand positioning",
      tone: "neutral",
    });
  }

  if (
    args.brandStiffness !== undefined &&
    args.avgStiffness !== null &&
    Math.abs(args.brandStiffness - args.avgStiffness) >= 1
  ) {
    const softer = args.avgStiffness < args.brandStiffness;
    signals.push({
      label: "Flex truth",
      value: softer ? "Softer" : "Stiffer",
      detail: "Community stiffness differs from brand claim",
      tone: "neutral",
    });
  }

  if (signals.length === 0 && args.totalRatings >= 5) {
    signals.push({
      label: "Stable consensus",
      value: `${args.totalRatings} ratings`,
      detail: "Enough community data for a steady baseline",
      tone: "neutral",
    });
  }

  return signals.slice(0, 3);
}

export const getShoeRecommendations = query({
  args: {
    userId: v.id("users"),
    footShape: footShapeValidator,
    footVolume: v.string(),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<PaginatedResult<ShoeRecommendation>> => {
    await requireUserAccess(ctx, args.userId);
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, args.pageSize ?? DEFAULT_PAGE_SIZE),
    );

    const ratedShoes = await loadShoesWithOwners(ctx, 3);
    const allShoes = ratedShoes.map((entry) => entry.shoe);
    const allUserShoes = ratedShoes.flatMap((entry) => entry.userShoes);

    const usersWithSameProfile = (
      await ctx.db
        .query("users")
        .withIndex("by_footProfile", (q) =>
          q.eq("footShape", args.footShape).eq("footVolume", args.footVolume),
        )
        .collect()
    ).filter((user) => user._id !== args.userId);

    const soleMateIds = new Set(usersWithSameProfile.map((u) => u._id));
    const currentUserOwnedShoeIds = new Set(
      (
        await ctx.db
          .query("userShoes")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .collect()
      ).map((userShoe) => userShoe.shoeId),
    );

    // Score with the same model as the client Matcher so both tabs agree.
    const footProfile = { shape: args.footShape, volume: args.footVolume };
    const learnedProfile = calculateUserPreferenceProfile(await hydrateUserStash(ctx, args.userId));
    const popularityData = ratedShoes.map((entry) => ({ shoeId: entry.shoe._id as string, count: entry.count }));
    const soleMateMap = new Map(
      aggregateSoleMateRatings(
        allUserShoes.filter((userShoe) => userShoe.userId === args.userId || soleMateIds.has(userShoe.userId)),
      ).map((aggregate) => [aggregate.shoeId, aggregate]),
    );
    const compatByShoe = new Map(
      await Promise.all(
        allShoes.map(async (shoe) => {
          const compat = await ctx.db
            .query("footShapeCompat")
            .withIndex("by_shoe", (q) => q.eq("shoeId", shoe._id))
            .collect();
          return [shoe._id as string, compat.map((entry) => entry.footShape)] as const;
        }),
      ),
    );

    const shoeRatingsMap = new Map<
      string,
      {
        comfortScores: number[];
        performanceRatings: number[];
        durabilityRatings: number[];
        fitLongevityScores: number[];
        sizingDeviationScores: number[];
        rawSizingDeviations: number[];
        aggressivenessRatings: number[];
        stiffnessRatings: number[];
        soleMateFitLongevityScores: number[];
        soleMateSizingDeviationScores: number[];
        soleMateUsers: Set<string>;
      }
    >();

    for (const userShoe of allUserShoes) {
      const shoeId = userShoe.shoeId;
      const existing = shoeRatingsMap.get(shoeId) || {
        comfortScores: [],
        performanceRatings: [],
        durabilityRatings: [],
        fitLongevityScores: [],
        sizingDeviationScores: [],
        rawSizingDeviations: [],
        aggressivenessRatings: [],
        stiffnessRatings: [],
        soleMateFitLongevityScores: [],
        soleMateSizingDeviationScores: [],
        soleMateUsers: new Set<string>(),
      };

      if (userShoe.comfortScore !== undefined) {
        existing.comfortScores.push(userShoe.comfortScore);
      }
      if (userShoe.performanceRating !== undefined) {
        existing.performanceRatings.push(userShoe.performanceRating);
      }
      if (userShoe.durabilityRating !== undefined) {
        existing.durabilityRatings.push(userShoe.durabilityRating);
      }
      if (userShoe.perceivedAggressiveness !== undefined) {
        existing.aggressivenessRatings.push(userShoe.perceivedAggressiveness);
      }
      if (userShoe.perceivedStiffness !== undefined) {
        existing.stiffnessRatings.push(userShoe.perceivedStiffness);
      }
      const fitLongevityScore = fitLongevityToScore(userShoe.fitLongevity);
      if (fitLongevityScore !== null) {
        existing.fitLongevityScores.push(fitLongevityScore);
      }
      const sizingDeviationScore = sizingDeviationToScore(userShoe.sizingDeviation);
      if (sizingDeviationScore !== null) {
        existing.sizingDeviationScores.push(sizingDeviationScore);
      }
      if (userShoe.sizingDeviation !== undefined) {
        existing.rawSizingDeviations.push(userShoe.sizingDeviation);
      }

      if (soleMateIds.has(userShoe.userId)) {
        if (fitLongevityScore !== null) {
          existing.soleMateFitLongevityScores.push(fitLongevityScore);
        }
        if (sizingDeviationScore !== null) {
          existing.soleMateSizingDeviationScores.push(sizingDeviationScore);
        }
        if (
          userShoe.comfortScore !== undefined &&
          userShoe.performanceRating !== undefined &&
          userShoe.durabilityRating !== undefined
        ) {
          const soleMateAverage =
            (userShoe.comfortScore +
              userShoe.performanceRating +
              userShoe.durabilityRating) /
            3;

          if (
            soleMateAverage > 8.5 &&
            !currentUserOwnedShoeIds.has(userShoe.shoeId)
          ) {
            existing.soleMateUsers.add(userShoe.userId);
          }
        }
      }

      shoeRatingsMap.set(shoeId, existing);
    }

    const recommendations: ShoeRecommendation[] = [];

    for (const shoe of allShoes) {
      const ratings = shoeRatingsMap.get(shoe._id);

      if (!ratings || ratings.comfortScores.length < 3) {
        continue;
      }

      const avgComfort = avg(ratings.comfortScores) ?? 0;
      const avgPerformance = avg(ratings.performanceRatings) ?? 0;
      const avgDurability = avg(ratings.durabilityRatings) ?? 0;
      const avgFitLongevity = avg(ratings.fitLongevityScores);
      const avgSizingDeviation = avg(ratings.sizingDeviationScores);
      const avgRawSizingDeviation = avg(ratings.rawSizingDeviations);
      const avgAggressiveness = avg(ratings.aggressivenessRatings);
      const avgStiffness = avg(ratings.stiffnessRatings);
      const avgSoleMateFitLongevity = avg(ratings.soleMateFitLongevityScores);
      const avgSoleMateSizingDeviation = avg(ratings.soleMateSizingDeviationScores);
      const fitLongevitySignal = avgSoleMateFitLongevity ?? avgFitLongevity;
      const enrichedDurability =
        fitLongevitySignal === null
          ? avgDurability
          : avgDurability * 0.85 + fitLongevitySignal * 0.15;
      const sizingSignal = avgSoleMateSizingDeviation ?? avgSizingDeviation;

      const { totalScore } = calculateShoeScore(
        { ...shoe, footShapeCompat: compatByShoe.get(shoe._id) ?? [] },
        footProfile,
        preferencesFromProfile(learnedProfile),
        popularityData,
        learnedProfile,
        soleMateMap,
      );
      const matchScore = toHundredPointScale(totalScore, 5);

      const isSoleMateMatch =
        ratings.soleMateUsers.size > 0;

      const soleMateUsers = usersWithSameProfile
        .filter((user) => ratings.soleMateUsers.has(user._id))
        .map((user) => ({
          _id: user._id,
          ...(user.name !== undefined ? { name: user.name } : {}),
          ...(user.image !== undefined ? { image: user.image } : {}),
        }));

      const recommendation: ShoeRecommendation = {
        _id: shoe._id,
        name: shoe.name,
        brand: shoe.brand,
        aggressiveness: shoe.aggressiveness,
        stiffness: shoe.stiffness,
        climbingDiscipline: shoe.climbingDiscipline,
        volume: shoe.volume,
        totalRatings: ratings.comfortScores.length,
        matchScore,
        isSoleMateMatch,
        communitySignals: buildCommunitySignals({
          avgComfort,
          avgPerformance,
          avgDurability: enrichedDurability,
          avgFitLongevity: fitLongevitySignal,
          avgSizingDeviationScore: sizingSignal,
          avgRawSizingDeviation,
          avgAggressiveness,
          avgStiffness,
          ...(shoe.brandAggressiveness !== undefined ? { brandAggressiveness: shoe.brandAggressiveness } : {}),
          ...(shoe.brandStiffness !== undefined ? { brandStiffness: shoe.brandStiffness } : {}),
          totalRatings: ratings.comfortScores.length,
        }),
      };

      if (shoe.imageUrl !== undefined) {
        recommendation.imageUrl = shoe.imageUrl;
      }

      if (shoe.slug !== undefined) {
        recommendation.slug = shoe.slug;
      }

      if (shoe.gender !== undefined) {
        recommendation.gender = shoe.gender;
      }

      recommendation.avgComfortScore = avgComfort;
      recommendation.avgPerformanceRating = avgPerformance;
      recommendation.avgDurabilityRating = enrichedDurability;

      if (soleMateUsers.length > 0) {
        recommendation.soleMateUsers = soleMateUsers;
      }

      recommendations.push(recommendation);
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    const totalCount = recommendations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = recommendations.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalCount,
      hasMore: endIndex < totalCount,
      currentPage: page,
      totalPages,
    };
  },
});

export const getTopShoesForFootShape = query({
  args: {
    footShape: footShapeValidator,
    footVolume: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(50, Math.max(1, args.limit ?? 20));
    const cursor = args.cursor ?? 0;

    const allShoes = (await loadShoesWithOwners(ctx, 3)).map((entry) => entry.shoe);

    const shoesWithRatings = allShoes
      .filter(
        (shoe) =>
          shoe.avgComfortScore !== undefined &&
          shoe.totalRatings !== undefined &&
          shoe.totalRatings >= 3,
      )
      .map((shoe) => {
        const volumeMatch = shoe.volume === args.footVolume ? 1.2 : 1;
        const overallRating =
          ((shoe.avgComfortScore || 0) +
            (shoe.avgPerformanceRating || 0) +
            (shoe.avgDurabilityRating || 0)) /
          3;

        return {
          ...shoe,
          weightedScore: overallRating * volumeMatch,
        };
      })
      .sort((a, b) => b.weightedScore - a.weightedScore);

    const totalCount = shoesWithRatings.length;
    const paginatedItems = shoesWithRatings.slice(cursor, cursor + limit);
    const hasMore = cursor + limit < totalCount;

    return {
      items: paginatedItems,
      totalCount,
      hasMore,
      nextCursor: hasMore ? cursor + limit : null,
    };
  },
});


export const getCommunityTopShoes = query({
  args: {
    limit: v.optional(v.number()),
    minRatings: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const minRatings = args.minRatings ?? 3;

    const ratedShoes = await loadShoesWithOwners(ctx, minRatings);
    const allShoes = ratedShoes.map((entry) => entry.shoe);
    const allUserShoes = ratedShoes.flatMap((entry) => entry.userShoes);

    const ratingsByShoe = new Map<
      string,
      {
        comfort: number[];
        performance: number[];
        durability: number[];
        aggressiveness: number[];
        stiffness: number[];
        fitLongevity: number[];
        sizingDeviation: number[];
        rawSizingDeviation: number[];
      }
    >();

    for (const userShoe of allUserShoes) {
      const bucket = ratingsByShoe.get(userShoe.shoeId) ?? {
        comfort: [],
        performance: [],
        durability: [],
        aggressiveness: [],
        stiffness: [],
        fitLongevity: [],
        sizingDeviation: [],
        rawSizingDeviation: [],
      };
      if (userShoe.comfortScore !== undefined) bucket.comfort.push(userShoe.comfortScore);
      if (userShoe.performanceRating !== undefined) bucket.performance.push(userShoe.performanceRating);
      if (userShoe.durabilityRating !== undefined) bucket.durability.push(userShoe.durabilityRating);
      if (userShoe.perceivedAggressiveness !== undefined) bucket.aggressiveness.push(userShoe.perceivedAggressiveness);
      if (userShoe.perceivedStiffness !== undefined) bucket.stiffness.push(userShoe.perceivedStiffness);
      const fitLongevityScore = fitLongevityToScore(userShoe.fitLongevity);
      if (fitLongevityScore !== null) bucket.fitLongevity.push(fitLongevityScore);
      const sizingDeviationScore = sizingDeviationToScore(userShoe.sizingDeviation);
      if (sizingDeviationScore !== null) bucket.sizingDeviation.push(sizingDeviationScore);
      if (userShoe.sizingDeviation !== undefined) bucket.rawSizingDeviation.push(userShoe.sizingDeviation);
      ratingsByShoe.set(userShoe.shoeId, bucket);
    }

    const ranked = allShoes
      .map((shoe) => {
        const bucket = ratingsByShoe.get(shoe._id);
        const sampleSize = bucket?.comfort.length ?? 0;
        if (!bucket || sampleSize < minRatings) return null;

        const avgComfort = avg(bucket.comfort) ?? 0;
        const avgPerformance = avg(bucket.performance) ?? 0;
        const avgDurability = avg(bucket.durability) ?? 0;
        const communityAggressiveness = avg(bucket.aggressiveness);
        const communityStiffness = avg(bucket.stiffness);
        const avgAggressiveness = communityAggressiveness ?? 0;
        const avgStiffness = communityStiffness ?? 0;
        const avgFitLongevity = avg(bucket.fitLongevity);
        const avgSizingDeviation = avg(bucket.sizingDeviation);
        const avgRawSizingDeviation = avg(bucket.rawSizingDeviation);
        const enrichedDurability =
          avgFitLongevity === null ? avgDurability : avgDurability * 0.85 + avgFitLongevity * 0.15;
        const ratingAverage = (avgComfort + avgPerformance + enrichedDurability) / 3;
        const compositeScore = avgSizingDeviation === null ? ratingAverage : ratingAverage * 0.9 + avgSizingDeviation * 0.1;

        return {
          _id: shoe._id,
          brand: shoe.brand,
          name: shoe.name,
          imageUrl: shoe.imageUrl,
          aggressiveness: shoe.aggressiveness,
          stiffness: shoe.stiffness,
          brandAggressiveness: shoe.brandAggressiveness,
          brandStiffness: shoe.brandStiffness,
          climbingDiscipline: shoe.climbingDiscipline,
          volume: shoe.volume,
          avgComfort,
          avgPerformance,
          avgDurability: enrichedDurability,
          avgAggressiveness,
          avgStiffness,
          avgFitLongevity,
          avgSizingDeviation,
          avgRawSizingDeviation,
          communitySignals: buildCommunitySignals({
            avgComfort,
            avgPerformance,
            avgDurability: enrichedDurability,
            avgFitLongevity,
            avgSizingDeviationScore: avgSizingDeviation,
            avgRawSizingDeviation,
            avgAggressiveness: communityAggressiveness,
            avgStiffness: communityStiffness,
            ...(shoe.brandAggressiveness !== undefined ? { brandAggressiveness: shoe.brandAggressiveness } : {}),
            ...(shoe.brandStiffness !== undefined ? { brandStiffness: shoe.brandStiffness } : {}),
            totalRatings: sampleSize,
          }),
          compositeScore,
          totalRatings: sampleSize,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    ranked.sort((a, b) => {
      if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
      return b.totalRatings - a.totalRatings;
    });

    return ranked.slice(0, limit);
  },
});

