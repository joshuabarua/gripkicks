import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rubbers = await ctx.db.query("rubberTechnologies").collect();
    return rubbers.sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;
      return a.compound.localeCompare(b.compound);
    });
  },
});
