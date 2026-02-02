import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Migration to add average rating fields to existing shoes
export const migrate = mutation({
  handler: async (ctx) => {
    // Get all shoes and process them
    const shoes = await ctx.db.query("shoes").collect();

    // Process this batch
    for (const shoe of shoes) {
      // Calculate averages from existing user ratings
      const userRatings = await ctx.db
        .query("userShoes")
        .withIndex("by_shoeId", (q) => q.eq("shoeId", shoe._id))
        .collect();

      if (userRatings.length > 0) {
        const validComfortRatings = userRatings
          .filter(r => r.comfortScore !== undefined)
          .map(r => r.comfortScore!);
        const validPerformanceRatings = userRatings
          .filter(r => r.performanceRating !== undefined)
          .map(r => r.performanceRating!);
        const validDurabilityRatings = userRatings
          .filter(r => r.durabilityRating !== undefined)
          .map(r => r.durabilityRating!);

        await ctx.db.patch(shoe._id, {
          avgComfortScore: validComfortRatings.length > 0
            ? validComfortRatings.reduce((a, b) => a + b, 0) / validComfortRatings.length
            : undefined,
          avgPerformanceRating: validPerformanceRatings.length > 0
            ? validPerformanceRatings.reduce((a, b) => a + b, 0) / validPerformanceRatings.length
            : undefined,
          avgDurabilityRating: validDurabilityRatings.length > 0
            ? validDurabilityRatings.reduce((a, b) => a + b, 0) / validDurabilityRatings.length
            : undefined,
          totalRatings: userRatings.length,
        });
      }
    }
  },
});
