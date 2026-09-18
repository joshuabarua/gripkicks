import { MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

export async function adjustShoePopularity(
  ctx: MutationCtx,
  shoeId: Id<"shoes">,
  delta: number,
): Promise<void> {
  const existing = await ctx.db
    .query("popularity")
    .withIndex("by_shoeId", (q) => q.eq("shoeId", shoeId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      count: Math.max(0, existing.count + delta),
      lastUpdated: Date.now(),
    });
    return;
  }

  if (delta > 0) {
    await ctx.db.insert("popularity", {
      shoeId,
      count: delta,
      lastUpdated: Date.now(),
    });
  }
}
