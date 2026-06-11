import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { footShapeValidator, deriveModelName, deriveVariantLabel, ensureRubberTechnologyExists, commonShoeFieldsValidator, optionalShoeFieldsValidator } from "./utils/helpers";
import { findParentModel } from "./shoeHelpers";

interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const paginationQueryArgs = {
  cursor: v.optional(v.string()),
  pageSize: v.optional(v.number()),
};

function calculatePageSize(pageSize?: number): number {
  return Math.min(MAX_PAGE_SIZE, Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE));
}

function paginateResults<T extends { _id: any }>(results: T[], pageSize: number, cursor?: string | null): { items: T[]; hasMore: boolean; nextCursor: string | null } {
  let startIndex = 0;
  if (cursor) {
    const idx = results.findIndex((s) => s._id === JSON.parse(cursor).id);
    startIndex = idx >= 0 ? idx + 1 : 0;
  }

  const paginatedResults = results.slice(startIndex, startIndex + pageSize + 1);
  const hasMore = paginatedResults.length > pageSize;
  const items = hasMore ? paginatedResults.slice(0, pageSize) : paginatedResults;

  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem ? JSON.stringify({ id: lastItem._id }) : null;

  return { items, hasMore, nextCursor };
}

async function enrichShoesWithRubber(ctx: any, shoes: any[]) {
  return await Promise.all(
    shoes.map(async (shoe) => {
      const rubberTechnology = shoe.rubberTechnologyId
        ? await ctx.db.get(shoe.rubberTechnologyId)
        : null;
      return { ...shoe, rubberTechnology };
    }),
  );
}

function sortShoesByName(shoes: any[]) {
  return shoes.sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand);
    if (brandCompare !== 0) return brandCompare;
    return a.name.localeCompare(b.name);
  });
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

export const list = query({
  args: paginationQueryArgs,
  handler: async (ctx, args): Promise<PaginatedResult<any>> => {
    const pageSize = calculatePageSize(args.pageSize);
    const cursor = args.cursor;

    let query = ctx.db.query("shoes").order("asc");

    if (cursor) {
      query = query.filter((q) => q.gt(q.field("_id"), JSON.parse(cursor).id));
    }

    const allShoes = await query.collect();
    const totalCount = allShoes.length;
    const { items, hasMore, nextCursor } = paginateResults(allShoes, pageSize, cursor);

    const shoesWithRubber = await enrichShoesWithRubber(ctx, items);
    const sortedItems = sortShoesByName(shoesWithRubber);

    return {
      items: sortedItems,
      totalCount,
      hasMore,
      nextCursor,
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

const CATALOG_SEARCH_LIMIT = 100;

export const searchCatalog = query({
  args: {
    searchTerm: v.optional(v.string()),
    brand: v.optional(v.string()),
    gender: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(200, Math.max(1, args.limit ?? CATALOG_SEARCH_LIMIT));
    const searchTerm = args.searchTerm?.trim();

    let results;
    if (searchTerm) {
      results = await ctx.db
        .query("shoes")
        .withSearchIndex("search_shoes", (q) => q.search("name", searchTerm))
        .take(500);
    } else if (args.brand) {
      results = await ctx.db
        .query("shoes")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand!))
        .collect();
    } else {
      results = await ctx.db.query("shoes").collect();
    }

    let filtered = results;
    if (args.brand) {
      filtered = filtered.filter((shoe) => shoe.brand === args.brand);
    }
    if (args.gender) {
      filtered = filtered.filter(
        (shoe) => (shoe.gender ?? "").toLowerCase() === args.gender,
      );
    }

    return sortShoesByName(filtered).slice(0, limit);
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
    ...paginationQueryArgs,
  },
  handler: async (ctx, args): Promise<PaginatedResult<any>> => {
    const pageSize = calculatePageSize(args.pageSize);
    const cursor = args.cursor;

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
    const { items, hasMore, nextCursor } = paginateResults(results, pageSize, cursor);

    return {
      items,
      totalCount,
      hasMore,
      nextCursor,
    };
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
      const modelName = deriveModelName(shoe.name);
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

export const bulkUpsertByBrand = mutation({
  args: {
    brand: v.string(),
    shoes: v.array(
      v.object({
        name: v.string(),
        imageUrl: v.optional(v.string()),
        aggressiveness: v.optional(v.string()),
        stiffness: v.optional(v.string()),
        climbingDiscipline: v.optional(v.string()),
        volume: v.optional(v.string()),
        gender: v.optional(v.union(
          v.literal("men"),
          v.literal("women"),
          v.literal("kids"),
          v.literal("unisex"),
        )),
        footShapeCompat: v.optional(v.array(footShapeValidator)),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const updated: string[] = [];
    const created: string[] = [];

    for (const shoeData of args.shoes) {
      const existing = await ctx.db
        .query("shoes")
        .withIndex("by_brand", (q) => q.eq("brand", args.brand))
        .filter((q) => q.eq(q.field("name"), shoeData.name))
        .first();

      if (existing) {
        const patch: Record<string, unknown> = {};
        if (shoeData.imageUrl !== undefined) patch['imageUrl'] = shoeData.imageUrl;
        if (shoeData.aggressiveness !== undefined) patch['aggressiveness'] = shoeData.aggressiveness;
        if (shoeData.stiffness !== undefined) patch['stiffness'] = shoeData.stiffness;
        if (shoeData.climbingDiscipline !== undefined) patch['climbingDiscipline'] = shoeData.climbingDiscipline;
        if (shoeData.volume !== undefined) patch['volume'] = shoeData.volume;
        if (shoeData.gender !== undefined) patch['gender'] = shoeData.gender;

        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(existing._id, patch);
        }
        updated.push(shoeData.name);
        continue;
      }

      const modelName = deriveModelName(shoeData.name);
      const variantLabel = deriveVariantLabel(shoeData.name, shoeData.gender);
      const parentModel = await findParentModel(ctx, args.brand, modelName);

      const shoeId = await ctx.db.insert("shoes", {
        name: shoeData.name,
        brand: args.brand,
        modelName,
        ...(variantLabel !== undefined ? { variantLabel } : {}),
        ...(parentModel?._id !== undefined ? { parentModelId: parentModel._id } : {}),
        aggressiveness: shoeData.aggressiveness ?? "moderate",
        stiffness: shoeData.stiffness ?? "medium",
        climbingDiscipline: shoeData.climbingDiscipline ?? "sport",
        volume: shoeData.volume ?? "medium",
        ...(shoeData.imageUrl !== undefined ? { imageUrl: shoeData.imageUrl } : {}),
        ...(shoeData.gender !== undefined ? { gender: shoeData.gender } : {}),
      });

      if (shoeData.footShapeCompat) {
        for (const footShape of shoeData.footShapeCompat) {
          await ctx.db.insert("footShapeCompat", { shoeId, footShape });
        }
      }
      created.push(shoeData.name);
    }

    return {
      success: true,
      updatedCount: updated.length,
      createdCount: created.length,
      updated,
      created,
    };
  },
});
