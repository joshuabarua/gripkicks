import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { findOrCreateRubberTechnology } from "./utils/helpers";

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
    return await findOrCreateRubberTechnology(ctx, args);
  },
});
