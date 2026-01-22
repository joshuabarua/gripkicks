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
