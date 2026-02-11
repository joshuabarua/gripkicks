import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// ============ USERS ============

export const createUser = mutation({
  args: {
    id: v.optional(v.string()),
    betterAuthId: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    createdAt: v.optional(v.any()),
    updatedAt: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      // Return existing user in Better Auth format
      return {
        id: existing._id,
        name: existing.name,
        email: existing.email,
        emailVerified: existing.emailVerified,
        image: existing.image || null,
        createdAt: new Date(existing._creationTime).toISOString(),
        updatedAt: new Date(existing._creationTime).toISOString(),
      };
    }
    
    const userId = await ctx.db.insert("users", {
      betterAuthId: args.betterAuthId,
      name: args.name,
      email: args.email,
      emailVerified: args.emailVerified,
      image: args.image,
      isAdmin: false,
      onboardingComplete: false,
    });
    
    const user = await ctx.db.get(userId);
    const now = new Date().toISOString();
    
    // Return in Better Auth expected format
    return {
      id: userId,
      name: user?.name || args.name,
      email: user?.email || args.email,
      emailVerified: user?.emailVerified ?? args.emailVerified,
      image: user?.image || null,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    const user = await ctx.db.get(id);
    return user ? {
      ...user,
      id: user._id,
      createdAt: user._creationTime,
      updatedAt: Date.now(),
    } : null;
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const findUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user ? {
      ...user,
      id: user._id,
      createdAt: user._creationTime,
      updatedAt: user._creationTime,
    } : null;
  },
});

export const findUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user ? {
      ...user,
      id: user._id,
      createdAt: user._creationTime,
      updatedAt: user._creationTime,
    } : null;
  },
});

// ============ SESSIONS ============

export const createSession = mutation({
  args: {
    id: v.optional(v.string()),
    token: v.string(),
    userId: v.string(), // Accept string, will be cast to Id<"users">
    expiresAt: v.any(), // Accept Date, string, or number
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.optional(v.any()),
    updatedAt: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Convert expiresAt to timestamp if it's a Date string
    let expiresAtTimestamp: number;
    if (typeof args.expiresAt === 'string') {
      expiresAtTimestamp = new Date(args.expiresAt).getTime();
    } else if (typeof args.expiresAt === 'number') {
      expiresAtTimestamp = args.expiresAt;
    } else {
      expiresAtTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }
    
    const sessionId = await ctx.db.insert("sessions", {
      token: args.token,
      userId: args.userId as Id<"users">,
      expiresAt: expiresAtTimestamp,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });
    
    const session = await ctx.db.get(sessionId);
    const now = new Date().toISOString();
    
    return {
      id: sessionId,
      token: session?.token || args.token,
      userId: session?.userId || args.userId,
      expiresAt: new Date(session?.expiresAt || expiresAtTimestamp).toISOString(),
      ipAddress: session?.ipAddress || null,
      userAgent: session?.userAgent || null,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const updateSession = mutation({
  args: {
    id: v.id("sessions"),
    token: v.optional(v.string()),
    expiresAt: v.optional(v.union(v.number(), v.string())),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    updatedAt: v.optional(v.any()), // Allow updatedAt but don't store it
  },
  handler: async (ctx, args) => {
    const { id, updatedAt, ...updates } = args;
    
    // Convert expiresAt to number if it's a string
    if (updates.expiresAt && typeof updates.expiresAt === 'string') {
      updates.expiresAt = new Date(updates.expiresAt).getTime();
    }
    
    // Filter out undefined values and updatedAt (we don't store updatedAt)
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    
    await ctx.db.patch(id, filteredUpdates);
    const session = await ctx.db.get(id);
    return session ? {
      ...session,
      id: session._id,
      createdAt: session._creationTime,
      updatedAt: Date.now(),
    } : null;
  },
});

export const deleteSession = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const deleteSessionByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const deleteSessionsByUserId = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    return sessions.length;
  },
});

export const findSessionById = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    return session ? {
      ...session,
      id: session._id,
      createdAt: session._creationTime,
      updatedAt: session._creationTime,
    } : null;
  },
});

export const findSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    return session ? {
      ...session,
      id: session._id,
      createdAt: session._creationTime,
      updatedAt: session._creationTime,
    } : null;
  },
});

export const findSessionsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return sessions.map(session => ({
      ...session,
      id: session._id,
      createdAt: session._creationTime,
      updatedAt: session._creationTime,
    }));
  },
});

// ============ ACCOUNTS ============

export const createAccount = mutation({
  args: {
    id: v.optional(v.string()),
    accountId: v.string(),
    providerId: v.string(),
    userId: v.string(), // Accept string, will be cast to Id<"users">
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    expiresAt: v.optional(v.any()),
    password: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.any()),
    refreshTokenExpiresAt: v.optional(v.any()),
    scope: v.optional(v.string()),
    createdAt: v.optional(v.any()),
    updatedAt: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, createdAt, updatedAt, ...rest } = args;
    
    // Convert any date fields to numbers
    const data = {
      ...rest,
      userId: rest.userId as Id<"users">,
      expiresAt: rest.expiresAt ? (typeof rest.expiresAt === 'string' ? new Date(rest.expiresAt).getTime() : rest.expiresAt) : undefined,
      accessTokenExpiresAt: rest.accessTokenExpiresAt ? (typeof rest.accessTokenExpiresAt === 'string' ? new Date(rest.accessTokenExpiresAt).getTime() : rest.accessTokenExpiresAt) : undefined,
      refreshTokenExpiresAt: rest.refreshTokenExpiresAt ? (typeof rest.refreshTokenExpiresAt === 'string' ? new Date(rest.refreshTokenExpiresAt).getTime() : rest.refreshTokenExpiresAt) : undefined,
    };
    
    const accountId = await ctx.db.insert("accounts", data);
    const account = await ctx.db.get(accountId);
    const now = new Date().toISOString();
    
    return {
      id: accountId,
      accountId: account?.accountId || args.accountId,
      providerId: account?.providerId || args.providerId,
      userId: account?.userId || args.userId,
      accessToken: account?.accessToken || null,
      refreshToken: account?.refreshToken || null,
      idToken: account?.idToken || null,
      expiresAt: account?.expiresAt ? new Date(account.expiresAt).toISOString() : null,
      password: account?.password || null,
      accessTokenExpiresAt: account?.accessTokenExpiresAt ? new Date(account.accessTokenExpiresAt).toISOString() : null,
      refreshTokenExpiresAt: account?.refreshTokenExpiresAt ? new Date(account.refreshTokenExpiresAt).toISOString() : null,
      scope: account?.scope || null,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const updateAccount = mutation({
  args: {
    id: v.id("accounts"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    password: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    const account = await ctx.db.get(id);
    return account ? {
      ...account,
      id: account._id,
      createdAt: account._creationTime,
      updatedAt: Date.now(),
    } : null;
  },
});

export const deleteAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const findAccountById = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.id);
    return account ? {
      ...account,
      id: account._id,
      createdAt: account._creationTime,
      updatedAt: account._creationTime,
    } : null;
  },
});

export const findAccountByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return accounts.map(account => ({
      ...account,
      id: account._id,
      createdAt: account._creationTime,
      updatedAt: account._creationTime,
    }));
  },
});

export const findAccountByProviderAndAccountId = query({
  args: { providerId: v.string(), accountId: v.string() },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("accounts")
      .filter((q) => 
        q.and(
          q.eq(q.field("providerId"), args.providerId),
          q.eq(q.field("accountId"), args.accountId)
        )
      )
      .first();
    return accounts ? {
      ...accounts,
      id: accounts._id,
      createdAt: accounts._creationTime,
      updatedAt: accounts._creationTime,
    } : null;
  },
});

// ============ VERIFICATIONS ============

export const createVerification = mutation({
  args: {
    id: v.optional(v.string()),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    const verificationId = await ctx.db.insert("verifications", data);
    
    const verification = await ctx.db.get(verificationId);
    return verification ? {
      ...verification,
      id: verificationId,
      createdAt: verification._creationTime,
      updatedAt: verification._creationTime,
    } : null;
  },
});

export const updateVerification = mutation({
  args: {
    id: v.id("verifications"),
    identifier: v.optional(v.string()),
    value: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    const verification = await ctx.db.get(id);
    return verification ? {
      ...verification,
      id: verification._id,
      createdAt: verification._creationTime,
      updatedAt: Date.now(),
    } : null;
  },
});

export const deleteExpired = mutation({
  args: {
    expiresBefore: v.number(),
  },
  handler: async (ctx, args) => {
    const { expiresBefore } = args;
    const now = Date.now();
    
    console.log('[deleteExpired] Called with expiresBefore:', new Date(expiresBefore), 'current time:', new Date(now));
    
    // Find all expired verifications (only those actually expired)
    const expiredVerifications = await ctx.db
      .query("verifications")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", expiresBefore))
      .collect();
    
    console.log('[deleteExpired] Found', expiredVerifications.length, 'potentially expired verifications');
    
    // Only delete verifications that are actually expired (add a larger safety buffer)
    let deletedCount = 0;
    for (const verification of expiredVerifications) {
      const timeDiff = now - verification.expiresAt;
      console.log('[deleteExpired] Verification expiresAt:', new Date(verification.expiresAt), 'timeDiff:', timeDiff + 'ms');
      
      // Double-check that this verification is actually expired with a 30-second buffer
      if (verification.expiresAt < now - 30000) { // 30 second buffer
        console.log('[deleteExpired] Deleting verification:', verification.identifier);
        await ctx.db.delete(verification._id);
        deletedCount++;
      } else {
        console.log('[deleteExpired] Skipping verification (within buffer):', verification.identifier);
      }
    }
    
    console.log('[deleteExpired] Deleted', deletedCount, 'verifications');
    return { count: deletedCount };
  },
});

export const deleteVerification = mutation({
  args: {
    id: v.id("verifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const findVerificationByIdentifier = query({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();
    return verification ? {
      ...verification,
      id: verification._id,
      createdAt: verification._creationTime,
      updatedAt: verification._creationTime,
    } : null;
  },
});
