import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUserStash = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userShoes = await ctx.db
      .query("userShoes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get full shoe details for each entry
    const stashWithShoes = await Promise.all(
      userShoes.map(async (entry) => {
        const shoe = await ctx.db.get(entry.shoeId);
        return { ...entry, shoe };
      })
    );

    return stashWithShoes.filter((entry) => entry.shoe !== null);
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

    // Get the current user shoe to get the shoeId
    const userShoe = await ctx.db.get(userShoeId);
    if (!userShoe) {
      throw new Error("User shoe not found");
    }

    // Remove undefined fields
    const fieldsToUpdate: Record<string, any> = {};
    if (updateFields.size !== undefined) fieldsToUpdate.size = updateFields.size;
    if (updateFields.purchaseDate !== undefined) fieldsToUpdate.purchaseDate = updateFields.purchaseDate;
    if (updateFields.condition !== undefined) fieldsToUpdate.condition = updateFields.condition;
    if (updateFields.notes !== undefined) fieldsToUpdate.notes = updateFields.notes;
    // Comfort ranking fields
    if (updateFields.comfortScore !== undefined) fieldsToUpdate.comfortScore = updateFields.comfortScore;
    if (updateFields.performanceRating !== undefined) fieldsToUpdate.performanceRating = updateFields.performanceRating;
    if (updateFields.durabilityRating !== undefined) fieldsToUpdate.durabilityRating = updateFields.durabilityRating;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return null; // No fields to update
    }

    // Update the user shoe
    await ctx.db.patch(userShoeId, fieldsToUpdate);

    // Recalculate average ratings for this shoe
    const allUserRatings = await ctx.db
      .query("userShoes")
      .withIndex("by_shoeId", (q) => q.eq("shoeId", userShoe.shoeId))
      .collect();

    if (allUserRatings.length >= 3) {
      // Only calculate averages if we have 3 or more ratings
      const validComfortRatings = allUserRatings
        .filter(r => r.comfortScore !== undefined)
        .map(r => r.comfortScore!);
      const validPerformanceRatings = allUserRatings
        .filter(r => r.performanceRating !== undefined)
        .map(r => r.performanceRating!);
      const validDurabilityRatings = allUserRatings
        .filter(r => r.durabilityRating !== undefined)
        .map(r => r.durabilityRating!);

      await ctx.db.patch(userShoe.shoeId, {
        avgComfortScore: validComfortRatings.length > 0
          ? validComfortRatings.reduce((a, b) => a + b, 0) / validComfortRatings.length
          : undefined,
        avgPerformanceRating: validPerformanceRatings.length > 0
          ? validPerformanceRatings.reduce((a, b) => a + b, 0) / validPerformanceRatings.length
          : undefined,
        avgDurabilityRating: validDurabilityRatings.length > 0
          ? validDurabilityRatings.reduce((a, b) => a + b, 0) / validDurabilityRatings.length
          : undefined,
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
    const userShoe = await ctx.db.get(args.userShoeId);
    if (!userShoe) {
      throw new Error("User shoe not found");
    }
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
