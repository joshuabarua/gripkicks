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
      .replace(/\bmen'?s\b/gi, " ")
      .replace(/\bmens\b/gi, " ")
      .replace(/\bmen\b/gi, " ")
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
  if (/\bwomen'?s\b|\bwomens\b|\bwomen\b/i.test(name) || gender === "women") labels.add("Women");
  if (/\bmen'?s\b|\bmens\b|\bmen\b/i.test(name) || gender === "men") labels.add("Men");
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

export { cleanupModelName, deriveModelName, deriveVariantLabel };
