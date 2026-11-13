import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { footShapeValidator, backlogStatusValidator, scoreHistoryEntryValidator, preferenceProfileValidator, learnedPreferencesValidator, footProfileValidator, accountFieldsValidator, commonShoeFieldsValidator, subscriptionFieldsValidator, userShoeFieldsValidator } from "./utils/helpers";

export { footShapeValidator, backlogStatusValidator };

export default defineSchema({
  // Climbing Shoes
  shoes: defineTable({
    ...commonShoeFieldsValidator,
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
    .index("by_brand_name", ["brand", "name"])
    .index("by_gender_name", ["gender", "name"])
    .index("by_brand_gender_name", ["brand", "gender", "name"])
    .index("by_brand_modelName", ["brand", "modelName"])
    .index("by_parentModelId", ["parentModelId"])
    .searchIndex("search_shoes", {
      searchField: "name",
      filterFields: ["brand", "gender"],
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
    climbingExperience: v.optional(v.string()),
    favoriteShoeId: v.optional(v.id("shoes")),
    ...subscriptionFieldsValidator,
  })
    .index("by_email", ["email"])
    .index("by_betterAuthId", ["betterAuthId"]),

  // Accounts (for Better Auth)
  accounts: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("users"),
    ...accountFieldsValidator,
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

  jwks: defineTable({
    publicKey: v.string(),
    privateKey: v.string(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    alg: v.optional(v.string()),
    crv: v.optional(v.string()),
  }).index("by_createdAt", ["createdAt"]),

  // User's shoe collection (stash)
  userShoes: defineTable({
    userId: v.id("users"),
    shoeId: v.id("shoes"),
    ...userShoeFieldsValidator,
    perceivedAggressiveness: v.optional(v.number()),
    perceivedStiffness: v.optional(v.number()),
    perceivedVolumeFit: v.optional(v.string()),
    isFavourite: v.optional(v.boolean()),
    // B2B signal enrichment
    fitLongevity: v.optional(v.string()),
    sizingDeviation: v.optional(v.number()),
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
