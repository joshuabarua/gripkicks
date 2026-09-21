import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { footShapeValidator } from "./schema";
import { requireAdmin, requireUserAccess } from "./authorization";
import { findOrLinkUserByAuth, findUserByAuthSubject } from "./userHelpers";
import { addUserShoe, removeUserShoe } from "./userShoes";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.id);
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
    await requireAdmin(ctx);
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
    favoriteShoeId: v.optional(v.union(v.id("shoes"), v.null())),
  },
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.id);
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
    footShape: v.optional(footShapeValidator),
    footVolume: v.optional(v.string()),
    favoriteShoeId: v.optional(v.id("shoes")),
  },
  handler: async (ctx, args) => {
    await requireUserAccess(ctx, args.userId);
    const updates = Object.fromEntries(
      Object.entries({
        footShape: args.footShape,
        footVolume: args.footVolume,
        favoriteShoeId: args.favoriteShoeId,
        onboardingComplete: true,
      }).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(args.userId, updates);
    return await ctx.db.get(args.userId);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").paginate(args.paginationOpts);
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return { count: users.length };
  },
});

// Create or update user from Better Auth
export const createOrUpdateFromBetterAuth = internalMutation({
  args: {
    betterAuthId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.string(),
    emailVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. Check if user already exists with this Better Auth ID, falling back
    //    to email and linking when the row has no betterAuthId
    const existingUser = await findOrLinkUserByAuth(
      ctx,
      args.betterAuthId,
      args.email,
      args.emailVerified,
    );

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        image: args.image,
        emailVerified: args.emailVerified,
      });

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

      return userId;
    }
  },
});

export const findByBetterAuthId = query({
  args: {
    betterAuthId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await findUserByAuthSubject(ctx, args.betterAuthId);
    if (user) await requireUserAccess(ctx, user._id);
    return user;
  },
});

// Enhanced user sync with deduplication
export const syncUserDeduplicated = internalMutation({
  args: {
    betterAuthId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthId))
      .first();

    if (existingUser) {
      // Update existing user if needed
      const updates: any = {};
      if (existingUser.email !== args.email) updates.email = args.email;
      if (args.name && existingUser.name !== args.name) updates.name = args.name;
      if (args.image !== undefined && existingUser.image !== args.image) updates.image = args.image;
      if (existingUser.emailVerified !== args.emailVerified) updates.emailVerified = args.emailVerified;

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }

      return existingUser._id;
    }

    // Create new user
    const emailPrefix = args.email.split("@")[0] ?? args.email;
    const name = args.name?.trim() || emailPrefix;
    const userId = await ctx.db.insert("users", {
      betterAuthId: args.betterAuthId,
      email: args.email,
      name,
      ...(args.image !== undefined ? { image: args.image } : {}),
      emailVerified: args.emailVerified,
      onboardingComplete: false,
    });

    return userId;
  },
});

// Backfill migration for existing users who might have null or empty names
export const backfillUserNames = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const results = {
      totalUsers: 0,
      usersUpdated: 0,
    };

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    results.totalUsers = allUsers.length;

    for (const user of allUsers) {
      // Update if name is undefined, null, or empty string
      if (!user.name || user.name.trim() === "") {
        const generatedName = user.email.split("@")[0];

        await ctx.db.patch(user._id, {
          name: generatedName,
        });

        results.usersUpdated++;
      }
    }

    return results;
  },
});

// Migration to remove indoorOutdoor field from userShoes
export const removeIndoorOutdoorField = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const results = {
      totalDocuments: 0,
      documentsUpdated: 0,
      errors: [] as string[],
    };

    try {
      // Get all userShoes documents
      const allUserShoes = await ctx.db.query("userShoes").collect();
      results.totalDocuments = allUserShoes.length;

      for (const userShoe of allUserShoes) {
        try {
          // Check if the document has the indoorOutdoor field
          if ("indoorOutdoor" in userShoe) {
            // Extract all fields except indoorOutdoor and system fields
            const {
              indoorOutdoor,
              _id,
              _creationTime,
              ...fieldsToKeep
            } = userShoe as any;

            // Delete the old document
            await removeUserShoe(ctx, userShoe);

            // Create a new document without the indoorOutdoor field
            await addUserShoe(ctx, userShoe.userId, userShoe.shoeId, fieldsToKeep);

            results.documentsUpdated++;
          }
        } catch (error) {
          const errorMsg = `Failed to update userShoe ${userShoe._id}: ${error}`;
          results.errors.push(errorMsg);
        }
      }

      return results;
    } catch (error) {
      results.errors.push(`Migration failed: ${error}`);
      return results;
    }
  },
});

export const serviceGetByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (query) => query.eq("email", args.email))
      .first();
  },
});

export const serviceGetById = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    const favoriteShoe = user.favoriteShoeId
      ? await ctx.db.get(user.favoriteShoeId)
      : null;
    return { ...user, favoriteShoe };
  },
});

export const serviceFindByBetterAuthId = internalQuery({
  args: { betterAuthId: v.string() },
  handler: async (ctx, args) => {
    return await findUserByAuthSubject(ctx, args.betterAuthId);
  },
});

export const serviceList = internalQuery({
  args: {},
  handler: async (ctx) => await ctx.db.query("users").collect(),
});

export const serviceUpdate = internalMutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    footShape: v.optional(footShapeValidator),
    footVolume: v.optional(v.string()),
    favoriteShoeId: v.optional(v.union(v.id("shoes"), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const serviceCompleteOnboarding = internalMutation({
  args: {
    userId: v.id("users"),
    footShape: v.optional(footShapeValidator),
    footVolume: v.optional(v.string()),
    favoriteShoeId: v.optional(v.id("shoes")),
  },
  handler: async (ctx, args) => {
    const updates = Object.fromEntries(
      Object.entries({
        footShape: args.footShape,
        footVolume: args.footVolume,
        favoriteShoeId: args.favoriteShoeId,
        onboardingComplete: true,
      }).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch(args.userId, updates);
    return await ctx.db.get(args.userId);
  },
});
