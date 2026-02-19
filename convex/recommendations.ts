import { v } from "convex/values";
import { query } from "./_generated/server";
import { footShapeValidator } from "./schema";

interface AggregatedShoeRating {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  slug?: string;
  gender?: string;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  avgComfortScore?: number;
  avgPerformanceRating?: number;
  avgDurabilityRating?: number;
  totalRatings: number;
  matchScore: number;
  isSoleSibling: boolean;
}

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

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
  ): Promise<PaginatedResult<AggregatedShoeRating>> => {
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

    const soleSiblingIds = new Set(usersWithSameProfile.map((u) => u._id));

    const shoeRatingsMap = new Map<
      string,
      {
        comfortScores: number[];
        performanceRatings: number[];
        durabilityRatings: number[];
        soleSiblingRatings: number[];
      }
    >();

    for (const userShoe of allUserShoes) {
      const shoeId = userShoe.shoeId;
      const existing = shoeRatingsMap.get(shoeId) || {
        comfortScores: [],
        performanceRatings: [],
        durabilityRatings: [],
        soleSiblingRatings: [],
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

      if (soleSiblingIds.has(userShoe.userId)) {
        if (userShoe.comfortScore !== undefined) {
          existing.soleSiblingRatings.push(userShoe.comfortScore);
        }
      }

      shoeRatingsMap.set(shoeId, existing);
    }

    const recommendations: AggregatedShoeRating[] = [];

    for (const shoe of allShoes) {
      const ratings = shoeRatingsMap.get(shoe._id);

      if (!ratings || ratings.comfortScores.length < 3) {
        continue;
      }

      const avgComfort =
        ratings.comfortScores.reduce((a, b) => a + b, 0) /
        ratings.comfortScores.length;
      const avgPerformance =
        ratings.performanceRatings.reduce((a, b) => a + b, 0) /
        ratings.performanceRatings.length;
      const avgDurability =
        ratings.durabilityRatings.reduce((a, b) => a + b, 0) /
        ratings.durabilityRatings.length;

      const volumeMatch = shoe.volume === args.footVolume ? 15 : 0;
      const soleSiblingBonus =
        ratings.soleSiblingRatings.length >= 3
          ? (ratings.soleSiblingRatings.reduce((a, b) => a + b, 0) /
              ratings.soleSiblingRatings.length) *
            3
          : 0;
      const ratingScore = (avgComfort + avgPerformance + avgDurability) * 2.5;

      const matchScore = Math.min(
        100,
        Math.round(volumeMatch + soleSiblingBonus + ratingScore),
      );

      const isSoleSibling =
        ratings.soleSiblingRatings.length >= 3 &&
        ratings.soleSiblingRatings.reduce((a, b) => a + b, 0) /
          ratings.soleSiblingRatings.length >=
          7;

      recommendations.push({
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
        avgComfortScore: avgComfort,
        avgPerformanceRating: avgPerformance,
        avgDurabilityRating: avgDurability,
        totalRatings: ratings.comfortScores.length,
        matchScore,
        isSoleSibling,
      });
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

export const getSoleSiblings = query({
  args: {
    userId: v.id("users"),
    footShape: footShapeValidator,
    footVolume: v.string(),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PaginatedResult<any>> => {
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, args.pageSize ?? DEFAULT_PAGE_SIZE),
    );

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

    if (usersWithSameProfile.length === 0) {
      return {
        items: [],
        totalCount: 0,
        hasMore: false,
        currentPage: page,
        totalPages: 0,
      };
    }

    const userIds = usersWithSameProfile.map((u) => u._id);

    const allUserShoes = await ctx.db.query("userShoes").collect();

    const soleSiblingShoes = allUserShoes.filter((us) =>
      userIds.includes(us.userId),
    );

    interface ShoeRatingAccumulator {
      totalRatings: number;
      comfortSum: number;
      performanceSum: number;
      durabilitySum: number;
      raterCount: number;
    }

    const shoeRatingsMap = new Map<string, ShoeRatingAccumulator>();

    for (const userShoe of soleSiblingShoes) {
      const shoeId = userShoe.shoeId;
      const existing = shoeRatingsMap.get(shoeId) || {
        totalRatings: 0,
        comfortSum: 0,
        performanceSum: 0,
        durabilitySum: 0,
        raterCount: 0,
      };

      existing.raterCount++;
      if (userShoe.comfortScore !== undefined) {
        existing.comfortSum =
          (existing.comfortSum || 0) + userShoe.comfortScore;
        existing.totalRatings++;
      }
      if (userShoe.performanceRating !== undefined) {
        existing.performanceSum =
          (existing.performanceSum || 0) + userShoe.performanceRating;
      }
      if (userShoe.durabilityRating !== undefined) {
        existing.durabilitySum =
          (existing.durabilitySum || 0) + userShoe.durabilityRating;
      }

      shoeRatingsMap.set(shoeId, existing);
    }

    const soleSiblingRecommendations = [];
    for (const [shoeId, data] of shoeRatingsMap) {
      if (data.raterCount >= 3 && data.totalRatings >= 3) {
        const shoe = await ctx.db.get(shoeId as any);
        if (shoe) {
          soleSiblingRecommendations.push({
            shoe,
            avgComfort: data.comfortSum / data.totalRatings,
            avgPerformance: data.performanceSum / data.raterCount,
            avgDurability: data.durabilitySum / data.raterCount,
            totalRatings: data.totalRatings,
            raterCount: data.raterCount,
          });
        }
      }
    }

    soleSiblingRecommendations.sort((a, b) => b.avgComfort - a.avgComfort);

    const totalCount = soleSiblingRecommendations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = soleSiblingRecommendations.slice(
      startIndex,
      endIndex,
    );

    return {
      items: paginatedItems,
      totalCount,
      hasMore: endIndex < totalCount,
      currentPage: page,
      totalPages,
    };
  },
});

export const getRecommendationCount = query({
  args: {
    userId: v.id("users"),
    footShape: footShapeValidator,
    footVolume: v.string(),
  },
  handler: async (ctx, args) => {
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
