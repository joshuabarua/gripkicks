import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, query, mutation, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { footShapeValidator, genderValidator, deriveModelName, deriveVariantLabel, ensureRubberTechnologyExists, commonShoeFieldsValidator, optionalShoeFieldsValidator } from "./utils/helpers";
import { enrichShoesWithRubber, insertFootShapeCompat, resolveParentModelId, sortShoesByName } from "./shoeHelpers";
import { applyEnrichmentEntries, buildApprovedMetricsPatch, shoeEnrichmentEntryValidator } from "./utils/enrichment";
import {
  buildMissingRubberTechnologyReport,
  runBackfillMissingRubberTechnology,
  runBackfillVariantMetadata,
} from "./utils/backfills";
import { bulkUpsertShoesByBrand, bulkUpsertShoeValidator } from "./utils/bulkUpsert";
import { deleteUserShoesForShoe } from "./userShoes";
import { requireAdmin } from "./authorization";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("shoes")
      .withIndex("by_brand_name")
      .order("asc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: await enrichShoesWithRubber(ctx, result.page),
    };
  },
});

export const listAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const shoes = await ctx.db.query("shoes").collect();
    const shoesWithRubber = await enrichShoesWithRubber(ctx, shoes);
    const sorted = sortShoesByName(shoesWithRubber);
    return args.limit ? sorted.slice(0, args.limit) : sorted;
  },
});

export const listBrands = query({
  args: {},
  handler: async (ctx) => {
    const shoes = await ctx.db.query("shoes").collect();
    return [...new Set(shoes.map((shoe) => shoe.brand))].sort();
  },
});

export const searchCatalog = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    brand: v.optional(v.string()),
    gender: v.optional(genderValidator),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm?.trim();
    let result;

    if (searchTerm) {
      result = await ctx.db
        .query("shoes")
        .withSearchIndex("search_shoes", (q) => {
          let search = q.search("name", searchTerm);
          if (args.brand) search = search.eq("brand", args.brand);
          if (args.gender) search = search.eq("gender", args.gender);
          return search;
        })
        .paginate(args.paginationOpts);
    } else if (args.brand && args.gender) {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_brand_gender_name", (q) =>
          q.eq("brand", args.brand!).eq("gender", args.gender!),
        )
        .order("asc")
        .paginate(args.paginationOpts);
    } else if (args.brand) {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_brand_name", (q) => q.eq("brand", args.brand!))
        .order("asc")
        .paginate(args.paginationOpts);
    } else if (args.gender) {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_gender_name", (q) => q.eq("gender", args.gender!))
        .order("asc")
        .paginate(args.paginationOpts);
    } else {
      result = await ctx.db
        .query("shoes")
        .withIndex("by_brand_name")
        .order("asc")
        .paginate(args.paginationOpts);
    }

    return {
      ...result,
      page: await enrichShoesWithRubber(ctx, result.page),
    };
  },
});

export const getById = query({
  args: { id: v.id("shoes") },
  handler: async (ctx, args) => {
    const shoe = await ctx.db.get(args.id);
    if (!shoe) return null;

    const rubberTechnology = shoe.rubberTechnologyId
      ? await ctx.db.get(shoe.rubberTechnologyId)
      : null;

    const footShapeCompat = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_shoe", (q) => q.eq("shoeId", args.id))
      .collect();

    return { ...shoe, rubberTechnology, footShapeCompat };
  },
});

export const getByBrand = query({
  args: { brand: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shoes")
      .withIndex("by_brand", (q) => q.eq("brand", args.brand))
      .collect();
  },
});

export const getCompatibleWithFootShape = query({
  args: { footShape: footShapeValidator },
  handler: async (ctx, args) => {
    const compatEntries = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_footShape", (q) => q.eq("footShape", args.footShape))
      .collect();

    const shoes = await Promise.all(
      compatEntries.map(async (entry) => {
        return await ctx.db.get(entry.shoeId);
      }),
    );

    return shoes.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    ...commonShoeFieldsValidator,
    stiffness: v.string(),
    climbingDiscipline: v.string(),
    volume: v.string(),
    rubberTechnologyId: v.id("rubberTechnologies"),
    footShapeCompat: v.optional(v.array(footShapeValidator)),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const {
      footShapeCompat,
      modelName,
      variantLabel,
      parentModelId,
      ...shoeData
    } = args;
    const normalizedModelName = modelName?.trim() || deriveModelName(args.name);
    const normalizedVariantLabel =
      variantLabel?.trim() || deriveVariantLabel(args.name, args.gender);
    const normalizedParentModelId =
      parentModelId ||
      (await resolveParentModelId(
        ctx,
        args.brand,
        normalizedModelName,
        normalizedVariantLabel,
      ));

    await ensureRubberTechnologyExists(ctx, args.rubberTechnologyId);

    const shoeId = await ctx.db.insert("shoes", {
      ...shoeData,
      modelName: normalizedModelName,
      ...(normalizedVariantLabel !== undefined ? { variantLabel: normalizedVariantLabel } : {}),
      ...(normalizedParentModelId !== undefined ? { parentModelId: normalizedParentModelId } : {}),
    });

    if (footShapeCompat) {
      await insertFootShapeCompat(ctx, shoeId, footShapeCompat);
    }

    return shoeId;
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db
        .query("shoes")
        .withIndex("by_brand_name")
        .order("asc")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("shoes")
      .withSearchIndex("search_shoes", (q) =>
        q.search("name", args.searchTerm.trim()),
      )
      .paginate(args.paginationOpts);
  },
});

export const applyEnrichment = mutation({
  args: { entries: v.array(shoeEnrichmentEntryValidator) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await applyEnrichmentEntries(ctx, args.entries);
  },
});

export const serviceApplyEnrichment = internalMutation({
  args: { entries: v.array(shoeEnrichmentEntryValidator) },
  handler: async (ctx, args) => await applyEnrichmentEntries(ctx, args.entries),
});

const reviewStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

async function applyEnrichmentReview(
  ctx: MutationCtx,
  id: Id<"shoes">,
  reviewStatus: "pending" | "approved" | "rejected",
) {
  const shoe = await ctx.db.get(id);
  if (!shoe?.enrichment) throw new Error("Shoe enrichment not found");
  const metricsPatch =
    reviewStatus === "approved" && shoe.enrichment.metrics
      ? await buildApprovedMetricsPatch(
          ctx,
          shoe,
          shoe.enrichment.metrics,
          shoe.officialSpecs,
        )
      : {};
  await ctx.db.patch(id, {
    ...metricsPatch,
    enrichment: { ...shoe.enrichment, reviewStatus },
  });
  return id;
}

export const reviewEnrichment = mutation({
  args: {
    id: v.id("shoes"),
    reviewStatus: reviewStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await applyEnrichmentReview(ctx, args.id, args.reviewStatus);
  },
});

export const serviceReviewEnrichment = internalMutation({
  args: {
    id: v.id("shoes"),
    reviewStatus: reviewStatusValidator,
  },
  handler: async (ctx, args) => {
    return await applyEnrichmentReview(ctx, args.id, args.reviewStatus);
  },
});

export const update = mutation({
  args: {
    id: v.id("shoes"),
    ...optionalShoeFieldsValidator,
    modelName: v.optional(v.string()),
    variantLabel: v.optional(v.string()),
    parentModelId: v.optional(v.id("shoes")),
    stiffness: v.optional(v.string()),
    climbingDiscipline: v.optional(v.string()),
    volume: v.optional(v.string()),
    rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, modelName, variantLabel, parentModelId, ...updates } = args;

    const shoe = await ctx.db.get(id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    const nextName = updates.name ?? shoe.name;
    const nextBrand = updates.brand ?? shoe.brand;
    const nextGender = updates.gender ?? shoe.gender;
    const nextModelName =
      modelName !== undefined
        ? modelName.trim() || deriveModelName(nextName)
        : shoe.modelName || deriveModelName(nextName);
    const nextVariantLabel =
      variantLabel !== undefined
        ? variantLabel.trim() || undefined
        : shoe.variantLabel || deriveVariantLabel(nextName, nextGender);
    const nextParentModelId =
      parentModelId !== undefined
        ? parentModelId
        : await resolveParentModelId(
          ctx,
          nextBrand,
          nextModelName,
          nextVariantLabel,
          id,
        );
    const nextRubberTechnologyId = updates.rubberTechnologyId ?? shoe.rubberTechnologyId;

    if (!nextRubberTechnologyId) {
      throw new Error("Rubber technology is required for every shoe");
    }

    await ensureRubberTechnologyExists(ctx, nextRubberTechnologyId);

    return await ctx.db.patch(id, {
      ...Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined),
      ),
      modelName: nextModelName,
      variantLabel: nextVariantLabel,
      parentModelId: nextParentModelId,
    });
  },
});

export const backfillVariantMetadata = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await runBackfillVariantMetadata(ctx);
  },
});

export const getMissingRubberTechnologyReport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await buildMissingRubberTechnologyReport(ctx);
  },
});

export const backfillMissingRubberTechnology = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await runBackfillMissingRubberTechnology(ctx);
  },
});

export const remove = mutation({
  args: { id: v.id("shoes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const shoe = await ctx.db.get(args.id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    const footShapeCompat = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_shoe", (q) => q.eq("shoeId", args.id))
      .collect();

    for (const compat of footShapeCompat) {
      await ctx.db.delete(compat._id);
    }

    await deleteUserShoesForShoe(ctx, args.id);

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const serviceBulkUpsertByBrand = internalMutation({
  args: {
    brand: v.string(),
    shoes: v.array(bulkUpsertShoeValidator),
  },
  handler: async (ctx, args) => {
    return await bulkUpsertShoesByBrand(ctx, args.brand, args.shoes);
  },
});
