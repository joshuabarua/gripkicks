import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export async function findParentModel(
  ctx: QueryCtx,
  brand: string,
  modelName: string,
  excludeId?: Id<"shoes">,
) {
  const siblingModels = await ctx.db
    .query("shoes")
    .withIndex("by_brand_modelName", (q) =>
      q.eq("brand", brand).eq("modelName", modelName),
    )
    .collect();
  return siblingModels.find(
    (candidate) => !candidate.variantLabel && candidate._id !== excludeId,
  );
}

export async function resolveParentModelId(
  ctx: QueryCtx,
  brand: string,
  modelName: string,
  variantLabel: string | undefined,
  excludeId?: Id<"shoes">,
) {
  if (!variantLabel) {
    return undefined;
  }
  return (await findParentModel(ctx, brand, modelName, excludeId))?._id;
}

export async function enrichShoesWithRubber(ctx: QueryCtx, shoes: Doc<"shoes">[]) {
  return await Promise.all(
    shoes.map(async (shoe) => {
      const rubberTechnology = shoe.rubberTechnologyId
        ? await ctx.db.get(shoe.rubberTechnologyId)
        : null;
      return { ...shoe, rubberTechnology };
    }),
  );
}

export function sortShoesByName(shoes: Doc<"shoes">[]) {
  return shoes.sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand);
    if (brandCompare !== 0) return brandCompare;
    return a.name.localeCompare(b.name);
  });
}

export async function insertFootShapeCompat(
  ctx: MutationCtx,
  shoeId: Id<"shoes">,
  footShapes: Array<Doc<"footShapeCompat">["footShape"]>,
) {
  for (const footShape of footShapes) {
    await ctx.db.insert("footShapeCompat", { shoeId, footShape });
  }
}
