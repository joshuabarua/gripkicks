import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { filterUndefinedValues, userShoeFieldsValidator } from "./utils/helpers";
import { requireUserAccess, requireUserShoeAccess } from "./authorization";

async function getServiceUserShoe(
  ctx: any,
  userShoeId: any,
  betterAuthUserId: string,
) {
  const userShoe = await ctx.db.get(userShoeId);
  if (!userShoe) return null;
  const user = await ctx.db.get(userShoe.userId);
  if (!user) return null;
  const owned =
    user._id === betterAuthUserId || user.betterAuthId === betterAuthUserId;
  return owned ? { userShoe, user } : null;
}

async function requireServiceUserShoe(
  ctx: any,
  userShoeId: any,
  betterAuthUserId: string,
) {
  const ownership = await getServiceUserShoe(
    ctx,
    userShoeId,
    betterAuthUserId,
  );
  if (!ownership) throw new Error("Access denied");
  return ownership.userShoe;
}

async function getUserShoesByUserId(ctx: any, userId: any) {
  return await ctx.db
    .query("userShoes")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
}

async function findExistingUserShoe(ctx: any, userId: any, shoeId: any) {
  return await ctx.db
    .query("userShoes")
    .withIndex("by_userId_shoeId", (q: any) =>
      q.eq("userId", userId).eq("shoeId", shoeId)
    )
    .first();
}

async function withExistingUserShoe<T>(
  ctx: any,
  userId: string,
  shoeId: string,
  onExists: (existing: any) => Promise<T>,
  onNotExists: () => Promise<T>,
): Promise<T> {
  const existing = await findExistingUserShoe(ctx, userId, shoeId);

  if (existing) {
    return await onExists(existing);
  }

  return await onNotExists();
}

const userShoeMutationArgs = {
  userId: v.id("users"),
  shoeId: v.id("shoes"),
};

async function findUsersByFootProfile(ctx: any, footShape: string, footVolume: string) {
  return await ctx.db
    .query("users")
    .filter((q: any) =>
      q.and(
        q.eq(q.field("footShape"), footShape),
        q.eq(q.field("footVolume"), footVolume),
      ),
    )
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

function fitLongevityToScore(fitLongevity?: string) {
  if (fitLongevity === "6+ months") return 5;
  if (fitLongevity === "3-6 months") return 3.5;
  if (fitLongevity === "1-3 months") return 2;
  return null;
}

function sizingDeviationToScore(sizingDeviation?: number) {
  if (sizingDeviation === undefined) return null;
  return Math.max(1, 5 - Math.min(4, Math.abs(sizingDeviation) * 2));
}

async function updateShoeRatingAverages(ctx: any, shoeId: any) {
  const allUserRatings = await ctx.db
    .query("userShoes")
    .withIndex("by_shoeId", (q: any) => q.eq("shoeId", shoeId))
    .collect();

  if (allUserRatings.length >= 3) {
    const averages = calculateRatingAverages(allUserRatings);
    await ctx.db.patch(shoeId, {
      ...averages,
      totalRatings: allUserRatings.length,
    });
  } else {
    await ctx.db.patch(shoeId, {
      avgComfortScore: undefined,
      avgPerformanceRating: undefined,
      avgDurabilityRating: undefined,
      totalRatings: allUserRatings.length,
    });
  }
}

async function hydrateUserStash(ctx: any, userId: any) {
  const userShoes = await getUserShoesByUserId(ctx, userId);

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
}

export const getUserStash = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    return await hydrateUserStash(ctx, args.userId);
  },
});

export const addToStash = mutation({
  args: userShoeMutationArgs,
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    return await withExistingUserShoe(
      ctx,
      args.userId,
      args.shoeId,
      async (existing) => existing._id,
      async () => ctx.db.insert("userShoes", {
        userId: args.userId,
        shoeId: args.shoeId,
      }),
    );
  },
});

export const removeFromStash = mutation({
  args: userShoeMutationArgs,
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    return await withExistingUserShoe(
      ctx,
      args.userId,
      args.shoeId,
      async (existing) => {
        await ctx.db.delete(existing._id);
        return true;
      },
      async () => false,
    );
  },
});

export const isInStash = query({
  args: {
    userId: v.id("users"),
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    const existing = await findExistingUserShoe(ctx, args.userId, args.shoeId);
    return existing !== null;
  },
});

export const updateUserShoeStats = mutation({
  args: {
    userShoeId: v.id("userShoes"),
    ...userShoeFieldsValidator,
  },
  handler: async (ctx, args) => {
    const { userShoeId, ...updateFields } = args;

    const userShoe = await requireUserShoeAccess(ctx, userShoeId);

    const fieldsToUpdate = filterUndefinedValues(updateFields);

    if (Object.keys(fieldsToUpdate).length === 0) {
      return null;
    }

    await ctx.db.patch(userShoeId, fieldsToUpdate);
    await updateShoeRatingAverages(ctx, userShoe.shoeId);

    return await ctx.db.get(userShoeId);
  },
});

export const toggleFavourite = mutation({
  args: {
    userShoeId: v.id("userShoes"),
  },
  handler: async (ctx, args) => {
    const userShoe = await requireUserShoeAccess(ctx, args.userShoeId);
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
    await requireUserShoeAccess(ctx, args.userShoeId);
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
    const matchingUsers = await findUsersByFootProfile(ctx, args.footShape, args.footVolume);
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
    const matchingUsers = await findUsersByFootProfile(ctx, args.footShape, args.footVolume);

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
        fitLongevityTotal: number;
        fitLongevityCount: number;
        sizingDeviationTotal: number;
        sizingDeviationCount: number;
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
          fitLongevityTotal: 0,
          fitLongevityCount: 0,
          sizingDeviationTotal: 0,
          sizingDeviationCount: 0,
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
        const fitLongevityScore = fitLongevityToScore(userShoe.fitLongevity);
        if (fitLongevityScore !== null) {
          agg.fitLongevityTotal += fitLongevityScore;
          agg.fitLongevityCount += 1;
        }
        const sizingDeviationScore = sizingDeviationToScore(userShoe.sizingDeviation);
        if (sizingDeviationScore !== null) {
          agg.sizingDeviationTotal += sizingDeviationScore;
          agg.sizingDeviationCount += 1;
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
      avgFitLongevityScore:
        agg.fitLongevityCount > 0 ? agg.fitLongevityTotal / agg.fitLongevityCount : null,
      avgSizingDeviationScore:
        agg.sizingDeviationCount > 0 ? agg.sizingDeviationTotal / agg.sizingDeviationCount : null,
    }));
  },
});

export const serviceGetUserStash = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => await hydrateUserStash(ctx, args.userId),
});

export const serviceAddToStash = internalMutation({
  args: userShoeMutationArgs,
  handler: async (ctx, args) => {
    return await withExistingUserShoe(
      ctx,
      args.userId,
      args.shoeId,
      async (existing) => existing._id,
      async () => ctx.db.insert("userShoes", args),
    );
  },
});

export const serviceRemoveFromStash = internalMutation({
  args: userShoeMutationArgs,
  handler: async (ctx, args) => {
    return await withExistingUserShoe(
      ctx,
      args.userId,
      args.shoeId,
      async (existing) => {
        await ctx.db.delete(existing._id);
        return true;
      },
      async () => false,
    );
  },
});

export const serviceUpdateUserShoeStats = internalMutation({
  args: {
    userShoeId: v.id("userShoes"),
    betterAuthUserId: v.string(),
    ...userShoeFieldsValidator,
  },
  handler: async (ctx, args) => {
    const { userShoeId, betterAuthUserId, ...updateFields } = args;
    const userShoe = await requireServiceUserShoe(
      ctx,
      userShoeId,
      betterAuthUserId,
    );
    const fieldsToUpdate = filterUndefinedValues(updateFields);
    if (Object.keys(fieldsToUpdate).length === 0) return null;
    await ctx.db.patch(userShoeId, fieldsToUpdate);
    await updateShoeRatingAverages(ctx, userShoe.shoeId);
    return await ctx.db.get(userShoeId);
  },
});

export const serviceToggleFavourite = internalMutation({
  args: {
    userShoeId: v.id("userShoes"),
    betterAuthUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userShoe = await requireServiceUserShoe(
      ctx,
      args.userShoeId,
      args.betterAuthUserId,
    );
    await ctx.db.patch(args.userShoeId, {
      isFavourite: !userShoe.isFavourite,
    });
    return await ctx.db.get(args.userShoeId);
  },
});

export const serviceDeleteUserShoe = internalMutation({
  args: {
    userShoeId: v.id("userShoes"),
    betterAuthUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireServiceUserShoe(
      ctx,
      args.userShoeId,
      args.betterAuthUserId,
    );
    await ctx.db.delete(args.userShoeId);
  },
});

export const serviceVerifyUserShoeOwnership = internalQuery({
  args: {
    userShoeId: v.id("userShoes"),
    betterAuthUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownership = await getServiceUserShoe(
      ctx,
      args.userShoeId,
      args.betterAuthUserId,
    );
    return ownership
      ? { owned: true, ...ownership }
      : { owned: false, reason: "Access denied" };
  },
});
