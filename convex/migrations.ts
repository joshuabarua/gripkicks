import { mutation } from "./_generated/server";

// Migration to add betterAuthId to existing users
export const addBetterAuthIdToExistingUsers = mutation({
  handler: async (ctx) => {
    // Get all users without betterAuthId
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      if (!user.betterAuthId) {
        // Use email as temporary betterAuthId (or you could use _id)
        const betterAuthId = user.email;
        
        await ctx.db.patch(user._id, {
          betterAuthId: betterAuthId,
        });
        
        console.log(`Added betterAuthId to user ${user.email}`);
      }
    }
    
    return { success: true, message: "Migration completed" };
  },
});
