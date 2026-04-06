import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { footShapeValidator } from "./schema";

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

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

async function resolveParentModelId(
  ctx: any,
  brand: string,
  modelName: string,
  variantLabel?: string,
  currentId?: string,
) {
  if (!variantLabel) {
    return undefined;
  }

  const candidates = await ctx.db
    .query("shoes")
    .withIndex("by_brand_modelName", (q: any) =>
      q.eq("brand", brand).eq("modelName", modelName),
    )
    .collect();

  return candidates.find((candidate: any) => {
    if (currentId && candidate._id === currentId) {
      return false;
    }
    return !candidate.variantLabel;
  })?._id;
}

async function ensureRubberTechnologyExists(
  ctx: any,
  rubberTechnologyId: string,
) {
  const rubberTechnology = await ctx.db.get(rubberTechnologyId);

  if (!rubberTechnology) {
    throw new Error("Rubber technology not found");
  }

  return rubberTechnology;
}

export const list = query({
  args: {
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PaginatedResult<any>> => {
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, args.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const cursor = args.cursor ? JSON.parse(args.cursor) : null;

    let query = ctx.db.query("shoes").order("asc");

    if (cursor) {
      query = query.filter((q) => q.gt(q.field("_id"), cursor.id));
    }

    const allShoes = await query.collect();
    const totalCount = allShoes.length;
    const paginatedShoes = allShoes.slice(0, pageSize + 1);
    const hasMore = paginatedShoes.length > pageSize;
    const items = hasMore ? paginatedShoes.slice(0, pageSize) : paginatedShoes;

    const shoesWithRubber = await Promise.all(
      items.map(async (shoe) => {
        const rubberTechnology = shoe.rubberTechnologyId
          ? await ctx.db.get(shoe.rubberTechnologyId)
          : null;
        return { ...shoe, rubberTechnology };
      }),
    );

    const sortedItems = shoesWithRubber.sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.name.localeCompare(b.name);
    });

    const lastItem = items[items.length - 1];

    return {
      items: sortedItems,
      totalCount,
      hasMore,
      nextCursor: hasMore && lastItem ? JSON.stringify({ id: lastItem._id }) : null,
    };
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const shoes = await ctx.db.query("shoes").collect();

    const shoesWithRubber = await Promise.all(
      shoes.map(async (shoe) => {
        const rubberTechnology = shoe.rubberTechnologyId
          ? await ctx.db.get(shoe.rubberTechnologyId)
          : null;
        return { ...shoe, rubberTechnology };
      }),
    );

    return shoesWithRubber.sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.name.localeCompare(b.name);
    });
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
    rubberTechnologyId: v.id("rubberTechnologies"),
    footShapeCompat: v.optional(v.array(footShapeValidator)),
  },
  handler: async (ctx, args) => {
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

    // Add foot shape compatibility entries
    if (footShapeCompat) {
      for (const footShape of footShapeCompat) {
        await ctx.db.insert("footShapeCompat", { shoeId, footShape });
      }
    }

    return shoeId;
  },
});

export const search = query({
  args: {
    searchTerm: v.string(),
    cursor: v.optional(v.string()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<PaginatedResult<any>> => {
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, args.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const cursor = args.cursor ? JSON.parse(args.cursor) : null;

    let results;
    if (!args.searchTerm) {
      results = await ctx.db.query("shoes").collect();
    } else {
      results = await ctx.db
        .query("shoes")
        .withSearchIndex("search_shoes", (q) =>
          q.search("name", args.searchTerm),
        )
        .collect();
    }

    const totalCount = results.length;

    let startIndex = 0;
    if (cursor) {
      const idx = results.findIndex((s) => s._id === cursor.id);
      startIndex = idx >= 0 ? idx + 1 : 0;
    }

    const paginatedResults = results.slice(
      startIndex,
      startIndex + pageSize + 1,
    );
    const hasMore = paginatedResults.length > pageSize;
    const items = hasMore
      ? paginatedResults.slice(0, pageSize)
      : paginatedResults;

    const lastItem = items[items.length - 1];

    return {
      items,
      totalCount,
      hasMore,
      nextCursor: hasMore && lastItem ? JSON.stringify({ id: lastItem._id }) : null,
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("shoes"),
    name: v.optional(v.string()),
    brand: v.optional(v.string()),
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
    aggressiveness: v.optional(v.string()),
    stiffness: v.optional(v.string()),
    climbingDiscipline: v.optional(v.string()),
    volume: v.optional(v.string()),
    rubberTechnologyId: v.optional(v.id("rubberTechnologies")),
  },
  handler: async (ctx, args) => {
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
    const shoes = await ctx.db.query("shoes").collect();
    let updatedCount = 0;

    for (const shoe of shoes) {
      const modelName = shoe.modelName || deriveModelName(shoe.name);
      const variantLabel =
        shoe.variantLabel || deriveVariantLabel(shoe.name, shoe.gender);
      const parentModelId =
        shoe.parentModelId ||
        (await resolveParentModelId(
          ctx,
          shoe.brand,
          modelName,
          variantLabel,
          shoe._id,
        ));

      await ctx.db.patch(shoe._id, {
        modelName,
        variantLabel,
        parentModelId,
      });
      updatedCount += 1;
    }

    return { updatedCount };
  },
});

export const getMissingRubberTechnologyReport = query({
  args: {},
  handler: async (ctx) => {
    const shoes = await ctx.db.query("shoes").collect();
    const rubberTechnologies = await ctx.db.query("rubberTechnologies").collect();

    const missingShoes = shoes.filter((shoe) => !shoe.rubberTechnologyId);

    return missingShoes.map((shoe) => {
      const brandMatches = rubberTechnologies.filter(
        (rubberTechnology) =>
          rubberTechnology.brand === (shoe.brand ?? "Unknown brand"),
      );

      return {
        shoeId: shoe._id,
        name: shoe.name ?? "Unknown shoe",
        brand: shoe.brand ?? "Unknown brand",
        modelName: shoe.modelName ?? null,
        brandMatchCount: brandMatches.length,
        brandMatches: brandMatches.map((rubberTechnology) => ({
          id: rubberTechnology._id,
          compound: rubberTechnology.compound ?? "Unknown compound",
        })),
      };
    });
  },
});

export const backfillMissingRubberTechnology = mutation({
  args: {},
  handler: async (ctx) => {
    const shoes = await ctx.db.query("shoes").collect();
    const rubberTechnologies = await ctx.db.query("rubberTechnologies").collect();

    let updatedCount = 0;
    const skipped: Array<{ shoeId: string; reason: string }> = [];

    for (const shoe of shoes) {
      if (shoe.rubberTechnologyId) {
        continue;
      }

      const brandMatches = rubberTechnologies.filter(
        (rubberTechnology) => rubberTechnology.brand === shoe.brand,
      );

      if (brandMatches.length === 1) {
        const match = brandMatches[0];
        if (!match) {
          continue;
        }
        await ctx.db.patch(shoe._id, {
          rubberTechnologyId: match._id,
        });
        updatedCount += 1;
        continue;
      }

      skipped.push({
        shoeId: shoe._id,
        reason:
          brandMatches.length === 0
            ? `No rubber technology found for brand ${shoe.brand}`
            : `Multiple rubber technologies found for brand ${shoe.brand}`,
      });
    }

    return {
      updatedCount,
      skipped,
    };
  },
});

export const remove = mutation({
  args: { id: v.id("shoes") },
  handler: async (ctx, args) => {
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

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
