import { MutationCtx, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

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

export async function findUserShoe(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  shoeId: Id<"shoes">,
): Promise<Doc<"userShoes"> | null> {
  return await ctx.db
    .query("userShoes")
    .withIndex("by_userId_shoeId", (q) =>
      q.eq("userId", userId).eq("shoeId", shoeId),
    )
    .first();
}

export async function addUserShoe(
  ctx: MutationCtx,
  userId: Id<"users">,
  shoeId: Id<"shoes">,
  fields?: Record<string, unknown>,
): Promise<Id<"userShoes">> {
  const existing = await findUserShoe(ctx, userId, shoeId);
  if (existing) {
    return existing._id;
  }

  const id = await ctx.db.insert("userShoes", {
    userId,
    shoeId,
    ...(fields ?? {}),
  });
  await adjustShoePopularity(ctx, shoeId, 1);
  return id;
}

export async function removeUserShoe(
  ctx: MutationCtx,
  userShoe: Doc<"userShoes">,
): Promise<void> {
  await ctx.db.delete(userShoe._id);
  await adjustShoePopularity(ctx, userShoe.shoeId, -1);
}

export async function deleteUserShoesForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<number> {
  const userShoes = await ctx.db
    .query("userShoes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  for (const userShoe of userShoes) {
    await removeUserShoe(ctx, userShoe);
  }

  return userShoes.length;
}

export async function deleteUserShoesForShoe(
  ctx: MutationCtx,
  shoeId: Id<"shoes">,
): Promise<number> {
  const userShoes = await ctx.db
    .query("userShoes")
    .withIndex("by_shoeId", (q) => q.eq("shoeId", shoeId))
    .collect();

  for (const userShoe of userShoes) {
    await ctx.db.delete(userShoe._id);
  }

  const popularityRow = await ctx.db
    .query("popularity")
    .withIndex("by_shoeId", (q) => q.eq("shoeId", shoeId))
    .unique();
  if (popularityRow) {
    await ctx.db.delete(popularityRow._id);
  }

  return userShoes.length;
}
