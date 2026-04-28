import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { filterUndefinedValues, subscriptionFieldsValidator } from "./utils/helpers";

async function findUserByBetterAuthId(ctx: any, betterAuthId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_betterAuthId", (q: any) => q.eq("betterAuthId", betterAuthId))
    .first();
  return user;
}

async function findUserOrThrow(ctx: any, betterAuthId: string) {
  const user = await findUserByBetterAuthId(ctx, betterAuthId);
  if (!user) {
    throw new Error(`User not found with betterAuthId: ${betterAuthId}`);
  }
  return user;
}

export const updateSubscription = mutation({
  args: {
    betterAuthId: v.string(),
    ...subscriptionFieldsValidator,
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

async function updateSubscriptionStatus(ctx: any, betterAuthId: string, status: "founder" | undefined, tier: "founder" | undefined) {
  const user = await findUserOrThrow(ctx, betterAuthId);
  await ctx.db.patch(user._id, {
    subscriptionStatus: status,
    subscriptionTier: tier,
  });
  return await ctx.db.get(user._id);
}

export const grantFounderStatus = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    return await updateSubscriptionStatus(ctx, args.betterAuthId, "founder", "founder");
  },
});

export const revokeFounderStatus = mutation({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    return await updateSubscriptionStatus(ctx, args.betterAuthId, undefined, undefined);
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
