import { Infer, v } from "convex/values";
import { MutationCtx } from "../_generated/server";
import { shoeOfficialSpecsValidator } from "./helpers";
import { calculateEnrichmentScores } from "./enrichmentScoring";

export const shoeEnrichmentEntryValidator = v.object({
  brand: v.string(),
  name: v.string(),
  officialUrl: v.string(),
  description: v.string(),
  officialSpecs: shoeOfficialSpecsValidator,
  confidence: v.number(),
  reviewStatus: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
  ),
});

export async function applyEnrichmentEntries(
  ctx: MutationCtx,
  entries: Array<Infer<typeof shoeEnrichmentEntryValidator>>,
) {
  const updated: string[] = [];
  const missing: string[] = [];
  const extractedAt = Date.now();

  for (const entry of entries) {
    let shoe = await ctx.db
      .query("shoes")
      .withIndex("by_brand_name", (q) =>
        q.eq("brand", entry.brand).eq("name", entry.name),
      )
      .first();

    if (!shoe) {
      const normalizedName = entry.name.toLowerCase().replace(/^n\/a:\s*/, "").trim();
      const brandShoes = await ctx.db
        .query("shoes")
        .withIndex("by_brand", (q) => q.eq("brand", entry.brand))
        .collect();
      shoe = brandShoes.find(
        (candidate) =>
          candidate.name.toLowerCase().replace(/^n\/a:\s*/, "").trim() === normalizedName,
      ) ?? null;
    }

    if (!shoe) {
      missing.push(`${entry.brand}: ${entry.name}`);
      continue;
    }

    await ctx.db.patch(shoe._id, {
      description: entry.description,
      officialUrl: entry.officialUrl,
      officialSpecs: entry.officialSpecs,
      defaultScores: calculateEnrichmentScores(shoe, entry.officialSpecs),
      enrichment: {
        sourceUrl: entry.officialUrl,
        sourceName: `${entry.brand} official product page`,
        extractedAt,
        confidence: entry.confidence,
        reviewStatus: entry.reviewStatus,
      },
    });
    updated.push(`${entry.brand}: ${entry.name}`);
  }

  return { updated, missing };
}
