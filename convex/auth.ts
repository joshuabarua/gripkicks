import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current user from Better Auth session
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    
    return await ctx.db.get(userId);
  },
});

// Create or update user from Better Auth
export const createOrUpdateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    onboardingComplete: v.optional(v.boolean()),
    footShape: v.optional(v.union(
      v.literal("egyptian"),
      v.literal("roman"),
      v.literal("greek"),
      v.literal("germanic"),
      v.literal("celtic")
    )),
    favoriteShoeId: v.optional(v.id("shoes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Check if user exists
    const existingUser = await ctx.db.get(userId);
    
    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(userId, args);
    } else {
      // Create new user
      return await ctx.db.insert("users", args);
    }
  },
});

// Complete user onboarding
export const completeOnboarding = mutation({
  args: {
    footShape: v.union(
      v.literal("egyptian"),
      v.literal("roman"),
      v.literal("greek"),
      v.literal("germanic"),
      v.literal("celtic")
    ),
    favoriteShoeId: v.optional(v.id("shoes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(userId, {
      footShape: args.footShape,
      favoriteShoeId: args.favoriteShoeId,
      onboardingComplete: true,
    });
  },
});

// Get user's shoe collection (stash)
export const getUserStash = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const userShoes = await ctx.db
      .query("userShoes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get full shoe details
    const shoes = await Promise.all(
      userShoes.map(async (userShoe) => {
        const shoe = await ctx.db.get(userShoe.shoeId);
        return shoe ? { ...shoe, userShoeId: userShoe._id } : null;
      })
    );

    return shoes.filter(Boolean);
  },
});

// Add shoe to user's stash
export const addToStash = mutation({
  args: {
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Check if already in stash
    const existing = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) => 
        q.eq("userId", userId).eq("shoeId", args.shoeId)
      )
      .first();

    if (existing) {
      return existing; // Already in stash
    }

    // Add to stash
    return await ctx.db.insert("userShoes", {
      userId,
      shoeId: args.shoeId,
    });
  },
});

// Remove shoe from user's stash
export const removeFromStash = mutation({
  args: {
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) => 
        q.eq("userId", userId).eq("shoeId", args.shoeId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }

    return false;
  },
});

// Check if shoe is in user's stash
export const isShoeInStash = query({
  args: {
    shoeId: v.id("shoes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return false;
    }

    const existing = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) => 
        q.eq("userId", userId).eq("shoeId", args.shoeId)
      )
      .first();

    return !!existing;
  },
});
