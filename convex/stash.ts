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

    await ctx.db.patch(userShoeId, fieldsToUpdate);
    return await ctx.db.get(userShoeId);
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
