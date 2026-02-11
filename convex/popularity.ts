import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getShoePopularity = query({
  args: { shoeId: v.id("shoes") },
  handler: async (ctx, args) => {
    // Count how many users have this shoe in their stash
    const userShoes = await ctx.db
      .query("userShoes")
      .withIndex("by_shoeId", (q) => q.eq("shoeId", args.shoeId))
      .collect();

    const popularityCount = userShoes.length;

    // Get total number of shoes in all stashes for percentage calculation
    const allUserShoes = await ctx.db.query("userShoes").collect();
    const totalShoesInDatabase = allUserShoes.length;

    return {
      popularityCount,
      totalShoesInDatabase,
    };
  },
});

export const getAllShoesPopularity = query({
  handler: async (ctx) => {
    // Get all user shoes and group by shoeId
    const allUserShoes = await ctx.db.query("userShoes").collect();

    const popularityMap = new Map<string, number>();

    allUserShoes.forEach((userShoe) => {
      const shoeId = userShoe.shoeId;
      popularityMap.set(shoeId, (popularityMap.get(shoeId) || 0) + 1);
    });

    // Convert to array and sort by popularity
    const popularityArray = Array.from(popularityMap.entries()).map(([shoeId, count]) => ({
      shoeId,
      count,
    }));

    popularityArray.sort((a, b) => b.count - a.count);

    return popularityArray;
  },
});

export const list = query({
  handler: async (ctx) => {
    // Get all user shoes
    return await ctx.db.query("userShoes").collect();
  },
});
