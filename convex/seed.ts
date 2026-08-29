import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { deriveModelName, deriveVariantLabel } from "./utils/helpers";
import { findParentModel } from "./shoeHelpers";
import seedShoes from "./data/seedShoes.json";

const climbingShoes = seedShoes;

type FootShape = "egyptian" | "roman" | "greek" | "germanic" | "celtic";

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingShoes = await ctx.db.query("shoes").first();
    if (existingShoes) {
      return { success: false, message: "Database already seeded" };
    }

    let shoesCreated = 0;
    let rubberTechsCreated = 0;

    for (const shoeData of climbingShoes) {
      // Find or create rubber technology
      let rubberTechId = await ctx.db
        .query("rubberTechnologies")
        .withIndex("by_brand_compound", (q) =>
          q.eq("brand", shoeData.rubber.brand).eq("compound", shoeData.rubber.compound)
        )
        .first()
        .then((r) => r?._id);

      if (!rubberTechId) {
        rubberTechId = await ctx.db.insert("rubberTechnologies", {
          brand: shoeData.rubber.brand,
          compound: shoeData.rubber.compound,
          stickiness: shoeData.rubber.stickiness,
          durability: shoeData.rubber.durability,
        });
        rubberTechsCreated++;
      }

      const modelName = deriveModelName(shoeData.name);
      const variantLabel = deriveVariantLabel(shoeData.name);
      const parentModel = await findParentModel(ctx, shoeData.brand, modelName);

      const shoeId = await ctx.db.insert("shoes", {
        name: shoeData.name,
        brand: shoeData.brand,
        modelName,
        ...(variantLabel !== undefined ? { variantLabel } : {}),
        ...(parentModel?._id !== undefined ? { parentModelId: parentModel._id } : {}),
        aggressiveness: shoeData.aggressiveness,
        stiffness: shoeData.stiffness,
        climbingDiscipline: shoeData.climbingDiscipline,
        volume: shoeData.volume,
        rubberTechnologyId: rubberTechId,
      });
      shoesCreated++;

      // Add foot shape compatibility
      for (const footShape of shoeData.footShapeCompat) {
        await ctx.db.insert("footShapeCompat", {
          shoeId,
          footShape: footShape as FootShape,
        });
      }
    }

    return {
      success: true,
      message: `Seeded ${shoesCreated} shoes and ${rubberTechsCreated} rubber technologies`,
    };
  },
});

export const deleteShoeByName = internalMutation({
  args: {
    name: v.string(),
    brand: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the shoe by name and brand
    const shoe = await ctx.db
      .query("shoes")
      .withIndex("by_brand", (q) => q.eq("brand", args.brand))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (!shoe) {
      return { success: false, message: "Shoe not found" };
    }

    // Delete related foot shape compatibilities
    const footShapeComps = await ctx.db
      .query("footShapeCompat")
      .withIndex("by_shoe", (q) => q.eq("shoeId", shoe._id))
      .collect();

    for (const compat of footShapeComps) {
      await ctx.db.delete(compat._id);
    }

    // Delete related user shoes (stashed items)
    const userShoes = await ctx.db
      .query("userShoes")
      .filter((q) => q.eq(q.field("shoeId"), shoe._id))
      .collect();

    for (const userShoe of userShoes) {
      await ctx.db.delete(userShoe._id);
    }

    // Delete the shoe itself
    await ctx.db.delete(shoe._id);

    return {
      success: true,
      message: `Deleted ${args.name} by ${args.brand} and related data`,
      deletedFootShapeComps: footShapeComps.length,
      deletedUserShoes: userShoes.length
    };
  },
});

export const updateShoeImageUrl = internalMutation({
  args: {
    id: v.id("shoes"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const shoe = await ctx.db.get(args.id);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    await ctx.db.patch(args.id, { imageUrl: args.imageUrl });
    return await ctx.db.get(args.id);
  },
});

export const clearDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all data (use with caution!)
    const tables = ["footShapeCompat", "comfortRankings", "userShoes", "shoes", "rubberTechnologies"] as const;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    return { success: true, message: "Database cleared" };
  },
});
