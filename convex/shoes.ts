import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { footShapeValidator } from "./schema";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const shoes = await ctx.db.query("shoes").collect();
    
    // Get rubber technology for each shoe
    const shoesWithRubber = await Promise.all(
      shoes.map(async (shoe) => {
        const rubberTechnology = shoe.rubberTechnologyId
          ? await ctx.db.get(shoe.rubberTechnologyId)
          : null;
        return { ...shoe, rubberTechnology };
      })
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
      })
    );
    
    return shoes.filter(Boolean);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    brand: v.string(),
    imageUrl: v.optional(v.string()),
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
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm) {
      return await ctx.db.query("shoes").collect();
    }
    
    return await ctx.db
      .query("shoes")
      .withSearchIndex("search_shoes", (q) => q.search("name", args.searchTerm))
      .collect();
  },
});

export const update = mutation({
  args: { 
    id: v.id("shoes"),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, imageUrl } = args;
    
    // Check if shoe exists before updating
    const shoe = await ctx.db.get(id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }
    
    return await ctx.db.patch(id, { imageUrl });
  },
});
