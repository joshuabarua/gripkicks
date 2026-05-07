import { QueryCtx } from "./_generated/server";

export async function findParentModel(
  ctx: QueryCtx,
  brand: string,
  modelName: string,
) {
  const siblingModels = await ctx.db
    .query("shoes")
    .withIndex("by_brand_modelName", (q) =>
      q.eq("brand", brand).eq("modelName", modelName),
    )
    .collect();
  return siblingModels.find((candidate) => !candidate.variantLabel);
}
