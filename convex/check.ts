import { query } from "./_generated/server";

// Check all users
export const checkUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    return users.map(u => ({
      email: u.email,
      hasBetterAuthId: !!u.betterAuthId,
      betterAuthId: u.betterAuthId,
      _id: u._id
    }));
  },
});
