import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateImageUrl = mutation({
  args: {
    shoeId: v.id("shoes"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const shoe = await ctx.db.get(args.shoeId);
    if (!shoe) {
      throw new Error("Shoe not found");
    }

    await ctx.db.patch(args.shoeId, {
      imageUrl: args.imageUrl,
    });

    return { success: true, updatedId: args.shoeId };
  },
});
