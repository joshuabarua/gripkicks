import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { filterUndefinedValues, subscriptionStatusValidator, subscriptionTierValidator } from "./utils/helpers";

async function findUserByBetterAuthId(ctx: any, betterAuthId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_betterAuthId", (q: any) => q.eq("betterAuthId", betterAuthId))
    .first();
  return user;
}

export const updateSubscription = mutation({
  args: {
    betterAuthId: v.string(),
    subscriptionStatus: v.optional(subscriptionStatusValidator),
    subscriptionTier: v.optional(subscriptionTierValidator),
    polarCustomerId: v.optional(v.string()),
    polarSubscriptionId: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { betterAuthId, ...updates } = args;

    const user = await findUserByBetterAuthId(ctx, betterAuthId);

    if (!user) {
      throw new Error(`User not found with betterAuthId: ${betterAuthId}`);
    }

    const filteredUpdates = filterUndefinedValues(updates);
    await ctx.db.patch(user._id, filteredUpdates);
    return await ctx.db.get(user._id);
  },
});

export const getSubscriptionStatus = query({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    const user = await findUserByBetterAuthId(ctx, args.betterAuthId);

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
    const user = await findUserByBetterAuthId(ctx, args.betterAuthId);

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
    const user = await findUserByBetterAuthId(ctx, args.betterAuthId);

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
    const user = await findUserByBetterAuthId(ctx, args.betterAuthId);

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
