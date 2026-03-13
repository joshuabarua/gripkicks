import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const updateSubscription = mutation({
  args: {
    betterAuthId: v.string(),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("canceled"), v.literal("past_due"), v.literal("founder"))),
    subscriptionTier: v.optional(v.union(v.literal("monthly"), v.literal("yearly"), v.literal("lifetime"), v.literal("founder"))),
    polarCustomerId: v.optional(v.string()),
    polarSubscriptionId: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { betterAuthId, ...updates } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
      .first();

    if (!user) {
      throw new Error(`User not found with betterAuthId: ${betterAuthId}`);
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(user._id, filteredUpdates);
    return await ctx.db.get(user._id);
  },
});

export const getSubscriptionStatus = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) {
      return null;
    }

    const isPremium = user.subscriptionStatus === "active" || user.subscriptionStatus === "founder";

    return {
      subscriptionStatus: user.subscriptionStatus ?? null,
      subscriptionTier: user.subscriptionTier ?? null,
      polarCustomerId: user.polarCustomerId ?? null,
      polarSubscriptionId: user.polarSubscriptionId ?? null,
      subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
      isPremium,
      isFounder: user.subscriptionStatus === "founder",
    };
  },
});

export const grantFounderStatus = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) {
      throw new Error(`User not found with betterAuthId: ${args.betterAuthId}`);
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: "founder",
      subscriptionTier: "founder",
    });

    return await ctx.db.get(user._id);
  },
});

export const revokeFounderStatus = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) {
      throw new Error(`User not found with betterAuthId: ${args.betterAuthId}`);
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: undefined,
      subscriptionTier: undefined,
    });

    return await ctx.db.get(user._id);
  },
});

export const isPremium = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (!user) return false;
    return user.subscriptionStatus === "active" || user.subscriptionStatus === "founder";
  },
});

export const getUserCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});
