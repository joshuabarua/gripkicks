import { Infer, v } from "convex/values";
import { MutationCtx } from "../_generated/server";
import {
  deriveModelName,
  deriveVariantLabel,
  footShapeValidator,
} from "./helpers";
import { findParentModel, insertFootShapeCompat } from "../shoeHelpers";

export const bulkUpsertShoeValidator = v.object({
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
});

export async function bulkUpsertShoesByBrand(
  ctx: MutationCtx,
  brand: string,
  shoes: Array<Infer<typeof bulkUpsertShoeValidator>>,
) {
  const updated: string[] = [];
  const created: string[] = [];

  for (const shoeData of shoes) {
    const existing = await ctx.db
      .query("shoes")
      .withIndex("by_brand", (q) => q.eq("brand", brand))
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
    const parentModel = await findParentModel(ctx, brand, modelName);

    const shoeId = await ctx.db.insert("shoes", {
      name: shoeData.name,
      brand,
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
      await insertFootShapeCompat(ctx, shoeId, shoeData.footShapeCompat);
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
}
