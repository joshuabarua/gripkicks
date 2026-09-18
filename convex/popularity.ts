import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { internalMutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireAdmin } from "./authorization";

export const getShoePopularity = query({
  args: { shoeId: v.id("shoes") },
  handler: async (ctx, args) => {
    const popularity = await ctx.db
      .query("popularity")
      .withIndex("by_shoeId", (q) => q.eq("shoeId", args.shoeId))
      .unique();

    const allPopularity = await ctx.db.query("popularity").collect();
    const totalShoesInDatabase = allPopularity.reduce(
      (total, row) => total + row.count,
      0,
    );

    return {
      popularityCount: popularity?.count ?? 0,
      totalShoesInDatabase,
    };
  },
});

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

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.query("userShoes").paginate(args.paginationOpts);
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
