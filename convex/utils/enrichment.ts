import { Infer, v } from "convex/values";
import { MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import {
  filterUndefinedValues,
  findOrCreateRubberTechnology,
  shoeMetricsValidator,
  shoeOfficialSpecsValidator,
} from "./helpers";
import { calculateEnrichmentScores } from "./enrichmentScoring";

export { shoeMetricsValidator };

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
  metrics: v.optional(shoeMetricsValidator),
});

export async function buildApprovedMetricsPatch(
  ctx: MutationCtx,
  shoe: Doc<"shoes">,
  metrics: Infer<typeof shoeMetricsValidator>,
  officialSpecs?: Infer<typeof shoeOfficialSpecsValidator>,
) {
  const appliedFields = filterUndefinedValues({
    aggressiveness: metrics.aggressiveness,
    climbingDiscipline: metrics.climbingDiscipline,
    stiffness: metrics.stiffness,
    volume: metrics.volume,
    brandAggressiveness: metrics.brandAggressiveness,
    brandStiffness: metrics.brandStiffness,
  });

  const rubberTechnologyId = metrics.rubber
    ? await findOrCreateRubberTechnology(ctx, metrics.rubber)
    : undefined;
  if (rubberTechnologyId !== undefined) {
    appliedFields.rubberTechnologyId = rubberTechnologyId;
  }

  return {
    ...appliedFields,
    defaultScores: calculateEnrichmentScores(
      { ...shoe, ...appliedFields },
      officialSpecs,
    ),
  };
}

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

    const metricsPatch =
      entry.reviewStatus === "approved" && entry.metrics
        ? await buildApprovedMetricsPatch(
            ctx,
            shoe,
            entry.metrics,
            entry.officialSpecs,
          )
        : { defaultScores: calculateEnrichmentScores(shoe, entry.officialSpecs) };

    await ctx.db.patch(shoe._id, {
      description: entry.description,
      officialUrl: entry.officialUrl,
      officialSpecs: entry.officialSpecs,
      ...metricsPatch,
      enrichment: {
        sourceUrl: entry.officialUrl,
        sourceName: `${entry.brand} official product page`,
        extractedAt,
        confidence: entry.confidence,
        reviewStatus: entry.reviewStatus,
        ...(entry.metrics !== undefined ? { metrics: entry.metrics } : {}),
      },
    });
    updated.push(`${entry.brand}: ${entry.name}`);
  }

  return { updated, missing };
}
