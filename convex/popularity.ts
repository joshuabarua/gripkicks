import { internalMutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getAllShoesPopularity = query({
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("popularity")
      .withIndex("by_count")
      .order("desc")
      .collect();

    return rows.map((row) => ({ shoeId: row.shoeId, count: row.count }));
  },
});

export const backfillPopularity = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allUserShoes = await ctx.db.query("userShoes").collect();

    const counts = new Map<Id<"shoes">, number>();
    for (const userShoe of allUserShoes) {
      counts.set(userShoe.shoeId, (counts.get(userShoe.shoeId) ?? 0) + 1);
    }

    const existingRows = await ctx.db.query("popularity").collect();
    const existingByShoeId = new Map(
      existingRows.map((row) => [row.shoeId, row]),
    );

    const now = Date.now();
    let upserted = 0;
    for (const [shoeId, count] of counts) {
      const existing = existingByShoeId.get(shoeId);
      if (existing) {
        await ctx.db.patch(existing._id, { count, lastUpdated: now });
      } else {
        await ctx.db.insert("popularity", {
          shoeId,
          count,
          lastUpdated: now,
        });
      }
      upserted++;
    }

    let removed = 0;
    for (const row of existingRows) {
      if (!counts.has(row.shoeId)) {
        await ctx.db.delete(row._id);
        removed++;
      }
    }

    return { upserted, removed };
  },
});
