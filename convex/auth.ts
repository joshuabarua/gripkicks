import { query, action } from "./_generated/server";
import { v } from "convex/values";

// Validate session with Better Auth
export const validateSession = action({
  args: {
    token: v.string(),
  },
  handler: async (_ctx, args) => {
    // Get Better Auth URL from environment
    const authUrl = process.env["BETTER_AUTH_URL"] || 'http://localhost:3001';

    try {
      // Make HTTP request to Better Auth's session endpoint
      const response = await fetch(`${authUrl}/api/auth/get-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${args.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Session is invalid or expired
        return null;
      }

      const sessionData = await response.json();

      if (!sessionData || !sessionData.session || !sessionData.user) {
        return null;
      }

      return {
        session: {
          id: sessionData.session.id,
          userId: sessionData.session.userId,
          expiresAt: sessionData.session.expiresAt,
        },
        user: {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          image: sessionData.user.image,
        },
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  },
});

// ============ OWNERSHIP VERIFICATION ============

// Query to check if a userShoe belongs to a user
export const verifyUserShoeOwnership = query({
  args: {
    userShoeId: v.id("userShoes"),
    betterAuthUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the userShoe document
    const userShoe = await ctx.db.get(args.userShoeId);
    if (!userShoe) {
      return { owned: false, reason: "User shoe not found" };
    }

    // Get the user document to verify Better Auth ID match
    const user = await ctx.db.get(userShoe.userId);
    if (!user) {
      return { owned: false, reason: "User not found" };
    }

    // Check if the Better Auth ID matches
    if (user.betterAuthId !== args.betterAuthUserId) {
      return { owned: false, reason: "Access denied" };
    }

    return { owned: true, userShoe, user };
  },
});

// Query to check if a user owns a specific shoe in their stash
export const verifyShoeOwnership = query({
  args: {
    shoeId: v.id("shoes"),
    betterAuthUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // First find the user by Better Auth ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthUserId))
      .first();

    if (!user) {
      return { owned: false, reason: "User not found" };
    }

    // Check if the user has this shoe in their stash
    const userShoe = await ctx.db
      .query("userShoes")
      .withIndex("by_userId_shoeId", (q) =>
        q.eq("userId", user._id).eq("shoeId", args.shoeId)
      )
      .first();

    if (!userShoe) {
      return { owned: false, reason: "Shoe not in user's stash" };
    }

    return { owned: true, userShoe, user };
  },
});
