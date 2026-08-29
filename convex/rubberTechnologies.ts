import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rubbers = await ctx.db.query("rubberTechnologies").collect();
    return rubbers.sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.compound.localeCompare(b.compound);
    });
  },
});

export const createOrGet = internalMutation({
  args: {
    brand: v.string(),
    compound: v.string(),
    stickiness: v.string(),
    durability: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rubberTechnologies")
      .withIndex("by_brand_compound", (q) =>
        q.eq("brand", args.brand).eq("compound", args.compound),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("rubberTechnologies", {
      brand: args.brand,
      compound: args.compound,
      stickiness: args.stickiness,
      durability: args.durability,
    });
  },
});
