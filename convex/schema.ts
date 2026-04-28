import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { footShapeValidator, backlogStatusValidator, scoreHistoryEntryValidator, subscriptionStatusValidator, subscriptionTierValidator, preferenceProfileValidator, learnedPreferencesValidator, footProfileValidator, genderValidator } from "./utils/helpers";

export { footShapeValidator, backlogStatusValidator };

export default defineSchema({
  // Climbing Shoes
  shoes: defineTable({
    name: v.string(),
    brand: v.string(),
    modelName: v.optional(v.string()),
    variantLabel: v.optional(v.string()),
    parentModelId: v.optional(v.id("shoes")),
    imageUrl: v.optional(v.string()),
    slug: v.optional(v.string()),
    gender: v.optional(genderValidator),
    aggressiveness: v.string(),
    brandAggressiveness: v.optional(v.number()),
    stiffness: v.string(),
    brandStiffness: v.optional(v.number()),
    climbingDiscipline: v.string(),
    volume: v.string(),
    rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
    avgComfortScore: v.optional(v.number()),
    avgPerformanceRating: v.optional(v.number()),
    avgDurabilityRating: v.optional(v.number()),
    totalRatings: v.optional(v.number()),
  })
    .index("by_brand", ["brand"])
    .index("by_name", ["name"])
    .index("by_brand_modelName", ["brand", "modelName"])
    .index("by_parentModelId", ["parentModelId"])
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
    betterAuthId: v.optional(v.string()),
    footShape: v.optional(footShapeValidator),
    footVolume: v.optional(v.string()),
    favoriteShoeId: v.optional(v.id("shoes")),
    // Subscription fields (Polar.sh)
    subscriptionStatus: v.optional(subscriptionStatusValidator),
    subscriptionTier: v.optional(subscriptionTierValidator),
    polarCustomerId: v.optional(v.string()),
    polarSubscriptionId: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),
    subscriptionUpdatedAt: v.optional(v.number()),
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
  })
    .index("by_userId", ["userId"])
    .index("by_provider_accountId", ["providerId", "accountId"]),

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
  })
    .index("by_identifier", ["identifier"])
    .index("by_expiresAt", ["expiresAt"]),

  // User's shoe collection (stash)
  userShoes: defineTable({
    userId: v.id("users"),
    shoeId: v.id("shoes"),
    size: v.optional(v.string()),
    purchaseDate: v.optional(v.string()),
    condition: v.optional(v.string()),
    notes: v.optional(v.string()),
    comfortScore: v.optional(v.number()),
    performanceRating: v.optional(v.number()),
    durabilityRating: v.optional(v.number()),
    perceivedAggressiveness: v.optional(v.number()),
    perceivedStiffness: v.optional(v.number()),
    perceivedVolumeFit: v.optional(v.string()),
    isFavourite: v.optional(v.boolean()),
    // B2B signal enrichment
    fitLongevity: v.optional(v.string()), // e.g. "1-3 months", "3-6 months", "6+ months"
    sizingDeviation: v.optional(v.number()), // e.g. -1.0 means user sized down 1 from standard
  })
    .index("by_userId", ["userId"])
    .index("by_shoeId", ["shoeId"])
    .index("by_userId_shoeId", ["userId", "shoeId"]),

  // Backlog/Task management
  backlogItems: defineTable({
    title: v.string(),
    notes: v.optional(v.string()),
    status: backlogStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // User Score Profiles
  userScoreProfiles: defineTable({
    userId: v.id("users"),
    overallScore: v.number(),
    preferenceProfile: preferenceProfileValidator,
    learnedPreferences: learnedPreferencesValidator,
    footProfile: footProfileValidator,
    lastUpdated: v.number(),
    version: v.number(),
    history: v.array(scoreHistoryEntryValidator),
  })
    .index("by_userId", ["userId"])
    .index("by_overallScore", ["overallScore"]),

  outliers: defineTable({
    shoeId: v.id("shoes"),
    footShape: footShapeValidator,
    footVolume: v.string(),
    signalType: v.string(),
    count: v.number(),
    description: v.string(),
  }).index("by_shoe_profile", ["shoeId", "footShape", "footVolume"]),

  // Shoe Popularity
  popularity: defineTable({
    shoeId: v.id("shoes"),
    count: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_shoeId", ["shoeId"])
    .index("by_count", ["count"]),
});
