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
  return cleanupModelName(
    name
      .replace(/\blow\s*volume\b/gi, " ")
      .replace(/\blv\b/gi, " ")
      .replace(/\bhigh\s*volume\b/gi, " ")
      .replace(/\bhv\b/gi, " ")
      .replace(/\bmid\s*volume\b/gi, " ")
      .replace(/\bmv\b/gi, " ")
      .replace(/\bwomen'?s\b/gi, " ")
      .replace(/\bwomens\b/gi, " ")
      .replace(/\bwomen\b/gi, " ")
      .replace(/\bw\b$/gi, " ")
      .replace(/\bmen'?s\b/gi, " ")
      .replace(/\bmens\b/gi, " ")
      .replace(/\bmen\b/gi, " ")
      .replace(/\bm\b$/gi, " ")
      .replace(/\bkids\b/gi, " ")
      .replace(/\bkid\b/gi, " ")
      .replace(/\byouth\b/gi, " ")
      .replace(/\bjunior\b/gi, " ")
      .replace(/\bjr\b/gi, " "),
  );
}

function deriveVariantLabel(
  name: string,
  gender?: "men" | "women" | "kids" | "unisex",
) {
  const labels = new Set<string>();

  if (/\blow\s*volume\b|\blv\b/i.test(name)) labels.add("LV");
  if (/\bhigh\s*volume\b|\bhv\b/i.test(name)) labels.add("HV");
  if (/\bmid\s*volume\b|\bmv\b/i.test(name)) labels.add("MV");
  if (/\bwomen'?s\b|\bwomens\b|\bwomen\b|\bw\b$/i.test(name) || gender === "women") labels.add("Women");
  if (/\bmen'?s\b|\bmens\b|\bmen\b|\bm\b$/i.test(name) || gender === "men") labels.add("Men");
  if (/\bkids\b|\bkid\b|\byouth\b|\bjunior\b|\bjr\b/i.test(name) || gender === "kids") labels.add("Kids");

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
