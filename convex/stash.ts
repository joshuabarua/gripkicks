import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { filterUndefinedValues } from "./utils/helpers";

async function getUserShoe(ctx: any, userShoeId: any) {
  const userShoe = await ctx.db.get(userShoeId);
  if (!userShoe) {
    throw new Error("User shoe not found");
  }
  return userShoe;
}

async function getUserShoesByUserId(ctx: any, userId: any) {
  return await ctx.db
    .query("userShoes")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
}

function calculateRatingAverages(allUserRatings: any[]) {
  const validComfortRatings = allUserRatings
    .filter(r => r.comfortScore !== undefined)
    .map(r => r.comfortScore!);
  const validPerformanceRatings = allUserRatings
    .filter(r => r.performanceRating !== undefined)
    .map(r => r.performanceRating!);
  const validDurabilityRatings = allUserRatings
    .filter(r => r.durabilityRating !== undefined)
    .map(r => r.durabilityRating!);

  return {
    avgComfortScore: validComfortRatings.length > 0
      ? validComfortRatings.reduce((a, b) => a + b, 0) / validComfortRatings.length
      : undefined,
    avgPerformanceRating: validPerformanceRatings.length > 0
      ? validPerformanceRatings.reduce((a, b) => a + b, 0) / validPerformanceRatings.length
      : undefined,
    avgDurabilityRating: validDurabilityRatings.length > 0
      ? validDurabilityRatings.reduce((a, b) => a + b, 0) / validDurabilityRatings.length
      : undefined,
  };
}

export const getUserStash = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userShoes = await getUserShoesByUserId(ctx, args.userId);

    if (userShoes.length === 0) {
      return [];
    }

    // Collect all shoe IDs and fetch them in a single batch
    const shoeIds = userShoes.map((entry: any) => entry.shoeId);
    const shoes = await Promise.all(
      shoeIds.map((shoeId: any) => ctx.db.get(shoeId))
    );

    // Create a map for O(1) lookup instead of array search
    const shoeMap = new Map(
      shoes.filter(shoe => shoe !== null).map(shoe => [shoe!._id, shoe!])
    );

    // Combine userShoes with their corresponding shoe data
    return userShoes
      .map((entry: any) => ({
        ...entry,
        shoe: shoeMap.get(entry.shoeId) || null
      }))
      .filter((entry: any) => entry.shoe !== null);
  },
});

export const addToStash = mutation({
  args: {
    userId: v.id("users"),
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    // Check if already in stash
    const existing = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) =>
        q.eq("userId", args.userId).eq("shoeId", args.shoeId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("userShoes", {
      userId: args.userId,
      shoeId: args.shoeId,
    });
  },
});

export const removeFromStash = mutation({
  args: {
    userId: v.id("users"),
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) =>
        q.eq("userId", args.userId).eq("shoeId", args.shoeId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});

export const isInStash = query({
  args: {
    userId: v.id("users"),
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) =>
        q.eq("userId", args.userId).eq("shoeId", args.shoeId)
      )
      .first();

    return existing !== null;
  },
});

export const updateUserShoeStats = mutation({
  args: {
    userShoeId: v.id("userShoes"),
    size: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    condition: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Comfort ranking fields
    comfortScore: v.optional(v.number()),
    performanceRating: v.optional(v.number()),
    durabilityRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userShoeId, ...updateFields } = args;

    const userShoe = await getUserShoe(ctx, userShoeId);

    const fieldsToUpdate = filterUndefinedValues(updateFields);

    if (Object.keys(fieldsToUpdate).length === 0) {
      return null;
    }

    // Update the user shoe
    await ctx.db.patch(userShoeId, fieldsToUpdate);

    // Recalculate average ratings for this shoe
    const allUserRatings = await ctx.db
      .query("userShoes")
      .withIndex("by_shoeId", (q) => q.eq("shoeId", userShoe.shoeId))
      .collect();

    if (allUserRatings.length >= 3) {
      const averages = calculateRatingAverages(allUserRatings);
      await ctx.db.patch(userShoe.shoeId, {
        ...averages,
        totalRatings: allUserRatings.length,
      });
    } else if (allUserRatings.length < 3) {
      // Clear averages if less than 3 ratings
      await ctx.db.patch(userShoe.shoeId, {
        avgComfortScore: undefined,
        avgPerformanceRating: undefined,
        avgDurabilityRating: undefined,
        totalRatings: allUserRatings.length,
      });
    }

    return await ctx.db.get(userShoeId);
  },
});

export const toggleFavourite = mutation({
  args: {
    userShoeId: v.id("userShoes"),
  },
  handler: async (ctx, args) => {
    const userShoe = await getUserShoe(ctx, args.userShoeId);
    await ctx.db.patch(args.userShoeId, {
      isFavourite: !userShoe.isFavourite,
    });
    return await ctx.db.get(args.userShoeId);
  },
});

export const deleteUserShoe = mutation({
  args: {
    userShoeId: v.id("userShoes"),
  },
  handler: async (ctx, args) => {
    // Delete the userShoe document
    await ctx.db.delete(args.userShoeId);
  },
});

export const getSoleMateUserCount = query({
  args: {
    footShape: v.string(),
    footVolume: v.string(),
  },
  handler: async (ctx, args) => {
    const matchingUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("footShape"), args.footShape),
          q.eq(q.field("footVolume"), args.footVolume),
        ),
      )
      .collect();
    return matchingUsers.length;
  },
});

export const getOutliersForShoe = query({
  args: {
    shoeId: v.id("shoes"),
    footShape: v.string(),
    footVolume: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("outliers")
      .withIndex("by_shoe_profile", (q) =>
        q
          .eq("shoeId", args.shoeId)
          .eq("footShape", args.footShape as "egyptian" | "roman" | "greek" | "germanic" | "celtic")
          .eq("footVolume", args.footVolume),
      )
      .collect();
  },
});

export const getSoleMateAggregates = query({
  args: {
    footShape: v.string(),
    footVolume: v.string(),
  },
  handler: async (ctx, args) => {
    const matchingUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("footShape"), args.footShape),
          q.eq(q.field("footVolume"), args.footVolume),
        ),
      )
      .collect();

    if (matchingUsers.length === 0) return [];

    const aggregates = new Map<
      string,
      {
        comfortTotal: number;
        comfortCount: number;
        performanceTotal: number;
        performanceCount: number;
        durabilityTotal: number;
        durabilityCount: number;
        ownerCount: number;
      }
    >();

    for (const user of matchingUsers) {
      const userShoes = await getUserShoesByUserId(ctx, user._id);

      for (const userShoe of userShoes) {
        const key = userShoe.shoeId as string;
        const agg = aggregates.get(key) ?? {
          comfortTotal: 0,
          comfortCount: 0,
          performanceTotal: 0,
          performanceCount: 0,
          durabilityTotal: 0,
          durabilityCount: 0,
          ownerCount: 0,
        };
        agg.ownerCount += 1;
        if (userShoe.comfortScore !== undefined) {
          agg.comfortTotal += userShoe.comfortScore;
          agg.comfortCount += 1;
        }
        if (userShoe.performanceRating !== undefined) {
          agg.performanceTotal += userShoe.performanceRating;
          agg.performanceCount += 1;
        }
        if (userShoe.durabilityRating !== undefined) {
          agg.durabilityTotal += userShoe.durabilityRating;
          agg.durabilityCount += 1;
        }
        aggregates.set(key, agg);
      }
    }

    return Array.from(aggregates.entries()).map(([shoeId, agg]) => ({
      shoeId,
      ownerCount: agg.ownerCount,
      avgComfort: agg.comfortCount > 0 ? agg.comfortTotal / agg.comfortCount : null,
      avgPerformance:
        agg.performanceCount > 0 ? agg.performanceTotal / agg.performanceCount : null,
      avgDurability:
        agg.durabilityCount > 0 ? agg.durabilityTotal / agg.durabilityCount : null,
    }));
  },
});
