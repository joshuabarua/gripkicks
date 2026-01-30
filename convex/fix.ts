import { mutation } from "./_generated/server";

// Delete all users without betterAuthId
export const deleteUsersWithoutBetterAuthId = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      if (!user.betterAuthId) {
        await ctx.db.delete(user._id);
        console.log(`Deleted user without betterAuthId: ${user.email}`);
      }
    }
    
    return { deleted: users.filter(u => !u.betterAuthId).length };
  },
});
