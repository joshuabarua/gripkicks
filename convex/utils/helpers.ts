import { v } from "convex/values";
import { shoeVariantPatterns } from "./shoeVariants";

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

export const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("canceled"),
  v.literal("past_due"),
  v.literal("founder"),
);

export const subscriptionTierValidator = v.union(
  v.literal("monthly"),
  v.literal("yearly"),
  v.literal("lifetime"),
  v.literal("founder"),
);

function cleanupModelName(name: string) {
  return name
    .replace(/[()]/g, " ")
    .replace(/\s+-\s+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function deriveModelName(name: string) {
  let baseName = name;
  for (const { pattern } of shoeVariantPatterns) {
    baseName = baseName.replace(pattern, " ");
  }
  return cleanupModelName(baseName);
}

function deriveVariantLabel(
  name: string,
  gender?: "men" | "women" | "kids" | "unisex",
) {
  const labels = new Set<string>();

  for (const { testPattern, label } of shoeVariantPatterns) {
    if (testPattern.test(name)) labels.add(label);
  }
  if (gender === "women") labels.add("Women");
  if (gender === "men") labels.add("Men");
  if (gender === "kids") labels.add("Kids");

  const variantLabel = Array.from(labels).join(" ").trim();
  return variantLabel || undefined;
}

export function filterUndefinedValues<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, val]) => val !== undefined)
  );
}

export function formatEntityWithId<T extends { _id: any; _creationTime: any }>(entity: T | null) {
  return entity ? {
    ...entity,
    id: entity._id,
    createdAt: entity._creationTime,
  } : null;
}

export async function ensureRubberTechnologyExists(ctx: any, rubberTechnologyId: string) {
  const rubberTechnology = await ctx.db.get(rubberTechnologyId);

  if (!rubberTechnology) {
    throw new Error("Rubber technology not found");
  }

  return rubberTechnology;
}

export async function findOrCreateRubberTechnology(
  ctx: any,
  rubber: {
    brand: string;
    compound: string;
    stickiness?: string;
    durability?: string;
  },
) {
  const existing = await ctx.db
    .query("rubberTechnologies")
    .withIndex("by_brand_compound", (q: any) =>
      q.eq("brand", rubber.brand).eq("compound", rubber.compound),
    )
    .first();

  if (existing) {
    return existing._id;
  }

  if (!rubber.stickiness || !rubber.durability) {
    return undefined;
  }

  return await ctx.db.insert("rubberTechnologies", {
    brand: rubber.brand,
    compound: rubber.compound,
    stickiness: rubber.stickiness,
    durability: rubber.durability,
  });
}

export const scoreHistoryEntryValidator = v.object({
  timestamp: v.number(),
  previousScore: v.number(),
  newScore: v.number(),
  changeReason: v.union(
    v.literal('shoe_added'),
    v.literal('shoe_updated'),
    v.literal('shoe_removed'),
    v.literal('profile_updated'),
    v.literal('recalculation')
  ),
  affectedShoes: v.array(v.string()),
});

export const preferenceProfileValidator = v.object({
  comfort: v.number(),
  performance: v.number(),
  durability: v.number(),
  aggressiveness: v.number(),
  versatility: v.number(),
});

export const learnedPreferencesValidator = v.object({
  preferredBrands: v.array(v.string()),
  preferredVolumes: v.array(v.string()),
  preferredDisciplines: v.array(v.string()),
  confidence: v.number(),
  sampleSize: v.number(),
});

export const footProfileValidator = v.optional(
  v.object({
    shape: v.string(),
    volume: v.string(),
  })
);

export const genderValidator = v.union(
  v.literal("men"),
  v.literal("women"),
  v.literal("kids"),
  v.literal("unisex"),
);

export const accountFieldsValidator = {
  accessToken: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  idToken: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  password: v.optional(v.string()),
  accessTokenExpiresAt: v.optional(v.number()),
  refreshTokenExpiresAt: v.optional(v.number()),
  scope: v.optional(v.string()),
};

export const subscriptionFieldsValidator = {
  subscriptionStatus: v.optional(subscriptionStatusValidator),
  subscriptionTier: v.optional(subscriptionTierValidator),
  polarCustomerId: v.optional(v.string()),
  polarSubscriptionId: v.optional(v.string()),
  subscriptionExpiresAt: v.optional(v.number()),
  subscriptionUpdatedAt: v.optional(v.number()),
};

export const userShoeFieldsValidator = {
  size: v.optional(v.string()),
  purchaseDate: v.optional(v.string()),
  condition: v.optional(v.string()),
  notes: v.optional(v.string()),
  comfortScore: v.optional(v.number()),
  performanceRating: v.optional(v.number()),
  durabilityRating: v.optional(v.number()),
  fitLongevity: v.optional(v.string()),
  sizingDeviation: v.optional(v.number()),
};

export const shoeDefaultScoresValidator = v.object({
  comfort: v.number(),
  performance: v.number(),
  durability: v.number(),
  sensitivity: v.optional(v.number()),
  edging: v.optional(v.number()),
  smearing: v.optional(v.number()),
  toeHooking: v.optional(v.number()),
  heelHooking: v.optional(v.number()),
});

export const shoeOfficialSpecsValidator = v.object({
  closure: v.optional(v.string()),
  upper: v.optional(v.string()),
  lining: v.optional(v.string()),
  midsole: v.optional(v.string()),
  sole: v.optional(v.string()),
  weight: v.optional(v.string()),
  sensitivity: v.optional(v.string()),
  rigidity: v.optional(v.string()),
});

export const shoeMetricsValidator = v.object({
  aggressiveness: v.optional(
    v.union(
      v.literal("flat"),
      v.literal("moderate"),
      v.literal("aggressive"),
    ),
  ),
  climbingDiscipline: v.optional(
    v.union(
      v.literal("bouldering"),
      v.literal("competition"),
      v.literal("gym"),
      v.literal("sport"),
      v.literal("trad"),
    ),
  ),
  stiffness: v.optional(
    v.union(
      v.literal("soft"),
      v.literal("medium"),
      v.literal("stiff"),
    ),
  ),
  volume: v.optional(
    v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
  ),
  brandAggressiveness: v.optional(v.number()),
  brandStiffness: v.optional(v.number()),
  rubber: v.optional(
    v.object({
      brand: v.string(),
      compound: v.string(),
      stickiness: v.optional(v.string()),
      durability: v.optional(v.string()),
    }),
  ),
});

export const shoeEnrichmentValidator = v.object({
  sourceUrl: v.string(),
  sourceName: v.string(),
  extractedAt: v.number(),
  confidence: v.number(),
  reviewStatus: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
  ),
  metrics: v.optional(shoeMetricsValidator),
});

const baseShoeFieldsValidator = {
  modelName: v.optional(v.string()),
  variantLabel: v.optional(v.string()),
  parentModelId: v.optional(v.id("shoes")),
  imageUrl: v.optional(v.string()),
  slug: v.optional(v.string()),
  gender: v.optional(genderValidator),
  description: v.optional(v.string()),
  officialUrl: v.optional(v.string()),
  officialSpecs: v.optional(shoeOfficialSpecsValidator),
  defaultScores: v.optional(shoeDefaultScoresValidator),
  enrichment: v.optional(shoeEnrichmentValidator),
  perceivedAggressiveness: v.optional(v.number()),
};

export const commonShoeFieldsValidator = {
  ...baseShoeFieldsValidator,
  name: v.string(),
  brand: v.string(),
  aggressiveness: v.string(),
};

export const optionalShoeFieldsValidator = {
  ...baseShoeFieldsValidator,
  name: v.optional(v.string()),
  brand: v.optional(v.string()),
  aggressiveness: v.optional(v.string()),
};

export { cleanupModelName, deriveModelName, deriveVariantLabel };
