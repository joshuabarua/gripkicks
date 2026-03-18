import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const footShapeValidator = v.union(
  v.literal("egyptian"),
  v.literal("roman"),
  v.literal("greek"),
  v.literal("germanic"),
  v.literal("celtic"),
);

export const backlogStatusValidator = v.union(
  v.literal("not_started"),
  v.literal("in_progress"),
  v.literal("done"),
);

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
    gender: v.optional(
      v.union(
        v.literal("men"),
        v.literal("women"),
        v.literal("kids"),
        v.literal("unisex"),
      ),
    ),
    aggressiveness: v.string(),
    stiffness: v.string(),
    climbingDiscipline: v.string(),
    volume: v.string(),
    rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
    brandAggressiveness: v.optional(v.number()),
    brandStiffness: v.optional(v.number()),
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
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("canceled"),
        v.literal("past_due"),
        v.literal("founder"),
      ),
    ),
    subscriptionTier: v.optional(
      v.union(
        v.literal("monthly"),
        v.literal("yearly"),
        v.literal("lifetime"),
        v.literal("founder"),
      ),
    ),
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
    isFavourite: v.optional(v.boolean()),
    perceivedAggressiveness: v.optional(v.number()),
    perceivedStiffness: v.optional(v.number()),
    perceivedVolumeFit: v.optional(v.string()),
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
    preferenceProfile: v.object({
      comfort: v.number(),
      performance: v.number(),
      durability: v.number(),
      aggressiveness: v.number(),
      versatility: v.number(),
    }),
    learnedPreferences: v.object({
      preferredBrands: v.array(v.string()),
      preferredVolumes: v.array(v.string()),
      preferredDisciplines: v.array(v.string()),
      confidence: v.number(),
      sampleSize: v.number(),
    }),
    footProfile: v.optional(
      v.object({
        shape: v.string(),
        volume: v.string(),
      }),
    ),
    lastUpdated: v.number(),
    version: v.number(),
    history: v.array(
      v.object({
        timestamp: v.number(),
        previousScore: v.number(),
        newScore: v.number(),
        changeReason: v.union(
          v.literal("shoe_added"),
          v.literal("shoe_updated"),
          v.literal("shoe_removed"),
          v.literal("profile_updated"),
          v.literal("recalculation"),
        ),
        affectedShoes: v.array(v.string()),
      }),
    ),
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
