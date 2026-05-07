import { v } from "convex/values";
import { query } from "./_generated/server";
import { footShapeValidator } from "./schema";
import { ShoeRecommendation } from "../types/shoe";

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function fitLongevityToScore(fitLongevity?: string) {
  if (fitLongevity === "6+ months") return 10;
  if (fitLongevity === "3-6 months") return 7;
  if (fitLongevity === "1-3 months") return 4;
  return null;
}

function sizingDeviationToScore(sizingDeviation?: number) {
  if (sizingDeviation === undefined) return null;
  return Math.max(2, 10 - Math.min(8, Math.abs(sizingDeviation) * 4));
}

function avg(values: number[]) {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
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
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, args.pageSize ?? DEFAULT_PAGE_SIZE),
    );

    const allShoes = await ctx.db.query("shoes").collect();

    const allUserShoes = await ctx.db.query("userShoes").collect();

    const usersWithSameProfile = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("footShape"), args.footShape),
          q.eq(q.field("footVolume"), args.footVolume),
          q.neq(q.field("_id"), args.userId),
        ),
      )
      .collect();

    const soleMateIds = new Set(usersWithSameProfile.map((u) => u._id));
    const currentUserOwnedShoeIds = new Set(
      allUserShoes
        .filter((userShoe) => userShoe.userId === args.userId)
        .map((userShoe) => userShoe.shoeId),
    );

    const shoeRatingsMap = new Map<
      string,
      {
        comfortScores: number[];
        performanceRatings: number[];
        durabilityRatings: number[];
        fitLongevityScores: number[];
        sizingDeviationScores: number[];
        soleMateRatings: number[];
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
        soleMateRatings: [],
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
      const fitLongevityScore = fitLongevityToScore(userShoe.fitLongevity);
      if (fitLongevityScore !== null) {
        existing.fitLongevityScores.push(fitLongevityScore);
      }
      const sizingDeviationScore = sizingDeviationToScore(userShoe.sizingDeviation);
      if (sizingDeviationScore !== null) {
        existing.sizingDeviationScores.push(sizingDeviationScore);
      }

      if (soleMateIds.has(userShoe.userId)) {
        if (userShoe.comfortScore !== undefined) {
          existing.soleMateRatings.push(userShoe.comfortScore);
        }
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
      const avgSoleMateFitLongevity = avg(ratings.soleMateFitLongevityScores);
      const avgSoleMateSizingDeviation = avg(ratings.soleMateSizingDeviationScores);
      const fitLongevitySignal = avgSoleMateFitLongevity ?? avgFitLongevity;
      const enrichedDurability =
        fitLongevitySignal === null
          ? avgDurability
          : avgDurability * 0.85 + fitLongevitySignal * 0.15;
      const sizingSignal = avgSoleMateSizingDeviation ?? avgSizingDeviation;

      const volumeMatch = shoe.volume === args.footVolume ? 15 : 0;
      const soleMateBonus =
        ratings.soleMateRatings.length >= 3
          ? (ratings.soleMateRatings.reduce((a, b) => a + b, 0) /
            ratings.soleMateRatings.length) *
          3
          : 0;
      const sizingSignalBonus = sizingSignal === null ? 0 : sizingSignal;
      const ratingScore = (avgComfort + avgPerformance + enrichedDurability) * 2.35;

      const matchScore = Math.min(
        100,
        Math.round(volumeMatch + soleMateBonus + ratingScore + sizingSignalBonus),
      );

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

    const allShoes = await ctx.db.query("shoes").collect();

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

    const allShoes = await ctx.db.query("shoes").collect();
    const allUserShoes = await ctx.db.query("userShoes").collect();

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
        const avgAggressiveness = avg(bucket.aggressiveness) ?? 0;
        const avgStiffness = avg(bucket.stiffness) ?? 0;
        const avgFitLongevity = avg(bucket.fitLongevity);
        const avgSizingDeviation = avg(bucket.sizingDeviation);
        const enrichedDurability =
          avgFitLongevity === null ? avgDurability : avgDurability * 0.85 + avgFitLongevity * 0.15;
        const sizingSignal = avgSizingDeviation === null ? 0 : avgSizingDeviation * 0.1;
        const compositeScore = ((avgComfort + avgPerformance + enrichedDurability) / 3) + sizingSignal;

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

export const getRecommendationCount = query({
  args: {
    userId: v.id("users"),
    footShape: footShapeValidator,
    footVolume: v.string(),
  },
  handler: async (ctx, _args) => {
    const allShoes = await ctx.db.query("shoes").collect();
    const allUserShoes = await ctx.db.query("userShoes").collect();

    let count = 0;
    for (const shoe of allShoes) {
      const ratings = allUserShoes.filter(
        (us) => us.shoeId === shoe._id && us.comfortScore !== undefined,
      );
      if (ratings.length >= 3) {
        count++;
      }
    }

    return count;
  },
});
