import { query } from "./_generated/server";

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
