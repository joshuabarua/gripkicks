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

    return {
      items: sortedItems,
      totalCount,
      hasMore,
      nextCursor:
        hasMore && items.length > 0
          ? JSON.stringify({ id: items[items.length - 1]._id })
          : null,
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
    footShapeCompat: v.optional(v.array(footShapeValidator)),
  },
  handler: async (ctx, args) => {
    const { footShapeCompat, ...shoeData } = args;

    const shoeId = await ctx.db.insert("shoes", shoeData);

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

    return {
      items,
      totalCount,
      hasMore,
      nextCursor:
        hasMore && items.length > 0
          ? JSON.stringify({ id: items[items.length - 1]._id })
          : null,
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("shoes"),
    name: v.optional(v.string()),
    brand: v.optional(v.string()),
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
    const { id, ...updates } = args;

    const shoe = await ctx.db.get(id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );

    return await ctx.db.patch(id, filteredUpdates);
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
