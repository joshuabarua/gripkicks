import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { footShapeValidator } from "./schema";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;

    // Get favorite shoe if set
    const favoriteShoe = user.favoriteShoeId
      ? await ctx.db.get(user.favoriteShoeId)
      : null;

    return { ...user, favoriteShoe };
  },
});

export const create = mutation({
  args: {
    betterAuthId: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      isAdmin: args.isAdmin ?? false,
      onboardingComplete: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    footShape: v.optional(footShapeValidator),
    footVolume: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    footShape: footShapeValidator,
    footVolume: v.optional(v.string()),
    favoriteShoeId: v.optional(v.id("shoes")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      footShape: args.footShape,
      footVolume: args.footVolume,
      favoriteShoeId: args.favoriteShoeId,
      onboardingComplete: true,
    });
    return await ctx.db.get(args.userId);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Create or update user from Better Auth
export const createOrUpdateFromBetterAuth = mutation({
  args: {
    betterAuthId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.string(),
    emailVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists with this Better Auth ID
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        image: args.image,
        emailVerified: args.emailVerified,
      });
      
      console.log("Convex: Updated existing user:", existingUser._id);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        betterAuthId: args.betterAuthId,
        email: args.email,
        name: args.name,
        image: args.image,
        emailVerified: args.emailVerified,
        isAdmin: false,
        onboardingComplete: false,
      });
      
      console.log("Convex: Created new user:", userId);
      return userId;
    }
  },
});

export const findByBetterAuthId = query({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by their Better Auth ID using the index
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();
    
    return user;
  },
});
