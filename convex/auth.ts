import { query, action } from "./_generated/server";
import { v } from "convex/values";

// Minimal no-op implementations to satisfy Convex typecheck while Better Auth is handled in Hono.
// Replace with real Convex auth logic if/when needed.

export const currentUser = query({
  args: {},
  handler: async () => null,
});

export const createOrUpdateUser = query({
  args: {},
  handler: async () => null,
});

export const completeOnboarding = query({
  args: {},
  handler: async () => null,
});

export const getUserStash = query({
  args: {},
  handler: async () => [],
});

export const addToStash = query({
  args: {},
  handler: async () => null,
});

export const removeFromStash = query({
  args: {},
  handler: async () => null,
});

export const isShoeInStash = query({
  args: {},
  handler: async () => false,
});

// Validate session with Better Auth
export const validateSession = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // This is a placeholder - in a real implementation, you would
    // validate the session with Better Auth's session management
    // For now, we'll return a mock session structure
    // TODO: Implement proper session validation with Better Auth
    
    // You could make an HTTP request to Better Auth's session endpoint here
    // or use Better Auth's server-side helpers if available
    
    return {
      session: {
        id: "mock-session-id",
        userId: "mock-user-id",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      user: {
        id: "mock-user-id",
        email: "user@example.com",
        name: "Mock User",
      },
    };
  },
});
