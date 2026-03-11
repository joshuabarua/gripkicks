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
  isSoleMateMatch: boolean;
  soleMateUsers?: {
    _id: string;
    name?: string;
    image?: string;
  }[];
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
        soleMateRatings: number[];
        soleMateUsers: Set<string>;
      }
    >();

    for (const userShoe of allUserShoes) {
      const shoeId = userShoe.shoeId;
      const existing = shoeRatingsMap.get(shoeId) || {
        comfortScores: [],
        performanceRatings: [],
        durabilityRatings: [],
        soleMateRatings: [],
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

      if (soleMateIds.has(userShoe.userId)) {
        if (userShoe.comfortScore !== undefined) {
          existing.soleMateRatings.push(userShoe.comfortScore);
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
      const soleMateBonus =
        ratings.soleMateRatings.length >= 3
          ? (ratings.soleMateRatings.reduce((a, b) => a + b, 0) /
            ratings.soleMateRatings.length) *
          3
          : 0;
      const ratingScore = (avgComfort + avgPerformance + avgDurability) * 2.5;

      const matchScore = Math.min(
        100,
        Math.round(volumeMatch + soleMateBonus + ratingScore),
      );

      const isSoleMateMatch =
        ratings.soleMateUsers.size > 0;

      const soleMateUsers = usersWithSameProfile
        .filter((user) => ratings.soleMateUsers.has(user._id))
        .map((user) => ({
          _id: user._id,
          name: user.name,
          image: user.image,
        }));

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
        isSoleMateMatch,
        soleMateUsers,
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
