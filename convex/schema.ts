import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const footShapeValidator = v.union(
  v.literal("egyptian"),
  v.literal("roman"),
  v.literal("greek"),
  v.literal("germanic"),
  v.literal("celtic")
);

export default defineSchema({
  // Climbing Shoes
  shoes: defineTable({
    name: v.string(),
    brand: v.string(),
    imageUrl: v.optional(v.string()),
    aggressiveness: v.string(),
    stiffness: v.string(),
    climbingDiscipline: v.string(),
    volume: v.string(),
    rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
  })
    .index("by_brand", ["brand"])
    .index("by_name", ["name"])
    .searchIndex("search_shoes", {
      searchField: "name",
      filterFields: ["brand"],
    }),

  // Rubber Technologies
  rubberTechnologies: defineTable({
    brand: v.string(),
    compound: v.string(),
    stickiness: v.string(),
    durability: v.string(),
  }).index("by_brand_compound", ["brand", "compound"]),

  // Comfort Rankings
  comfortRankings: defineTable({
    shoeId: v.id("shoes"),
    footShape: footShapeValidator,
    volume: v.string(),
    score: v.number(),
  }).index("by_shoe", ["shoeId"]),

  // Foot Shape Compatibility
  footShapeCompat: defineTable({
    shoeId: v.id("shoes"),
    footShape: footShapeValidator,
  })
    .index("by_shoe", ["shoeId"])
    .index("by_footShape", ["footShape"]),

  // Users (for Better Auth)
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    onboardingComplete: v.boolean(),
    betterAuthId: v.string(),
    footShape: v.optional(footShapeValidator),
    footVolume: v.optional(v.string()),
    favoriteShoeId: v.optional(v.id("shoes")),
  })
    .index("by_email", ["email"])
    .index("by_betterAuthId", ["betterAuthId"]),

  // Accounts (for Better Auth)
  accounts: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("users"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    password: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Sessions (for Better Auth)
  sessions: defineTable({
    expiresAt: v.number(),
    token: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.id("users"),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  // Verification tokens (for Better Auth)
  verifications: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
  }).index("by_identifier", ["identifier"]),

  // User's shoe collection (stash)
  userShoes: defineTable({
    userId: v.id("users"),
    shoeId: v.id("shoes"),
    // User's custom stats for this shoe
    size: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    condition: v.optional(v.string()),
    notes: v.optional(v.string()),
    // Comfort ranking fields
    comfortScore: v.optional(v.number()), // 1-10 comfort rating
    performanceRating: v.optional(v.number()), // 1-10 performance rating
    durabilityRating: v.optional(v.number()), // 1-10 durability rating
  })
    .index("by_userId", ["userId"])
    .index("by_shoeId", ["shoeId"])
    .index("by_userId_shoeId", ["userId", "shoeId"])
});
