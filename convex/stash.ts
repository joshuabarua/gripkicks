import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { filterUndefinedValues, userShoeFieldsValidator } from "./utils/helpers";
import { requireUserAccess, requireUserShoeAccess } from "./authorization";
import { addUserShoe, findUserShoe, removeUserShoe } from "./userShoes";
import { aggregateSoleMateRatings } from "./utils/matchScore";

async function getUserShoesByUserId(ctx: any, userId: any) {
  return await ctx.db
    .query("userShoes")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect();
}

const userShoeMutationArgs = {
  userId: v.id("users"),
  shoeId: v.id("shoes"),
};

async function findUsersByFootProfile(ctx: any, footShape: string, footVolume: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_footProfile", (q: any) =>
      q.eq("footShape", footShape).eq("footVolume", footVolume),
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

export async function hydrateUserStash(ctx: any, userId: any) {
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
    return await addUserShoe(ctx, args.userId, args.shoeId);
  },
});

export const removeFromStash = mutation({
  args: userShoeMutationArgs,
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    const existing = await findUserShoe(ctx, args.userId, args.shoeId);
    if (!existing) return false;
    await removeUserShoe(ctx, existing);
    return true;
  },
});

export const isInStash = query({
  args: {
    userId: v.id("users"),
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    const existing = await findUserShoe(ctx, args.userId, args.shoeId);
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
    const userShoe = await requireUserShoeAccess(ctx, args.userShoeId);
    // Delete the userShoe document
    await removeUserShoe(ctx, userShoe);
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

    const userShoes = await Promise.all(matchingUsers.map((user: { _id: string }) => getUserShoesByUserId(ctx, user._id)));
    return aggregateSoleMateRatings(userShoes.flat());
  },
});
