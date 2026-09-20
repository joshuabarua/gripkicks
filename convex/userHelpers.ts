import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export async function findUserByAuthSubject(
  ctx: Pick<QueryCtx | MutationCtx, "db">,
  subject: string,
): Promise<Doc<"users"> | null> {
  const userId = ctx.db.normalizeId("users", subject);
  if (userId) {
    const user = await ctx.db.get(userId);
    if (user) return user;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", subject))
    .first();
}

export async function findOrLinkUserByAuth(
  ctx: MutationCtx,
  betterAuthId: string,
  email: string,
): Promise<Doc<"users"> | null> {
  const byAuthId = await ctx.db
    .query("users")
    .withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
    .first();
  if (byAuthId) return byAuthId;

  const byEmail = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();

  if (byEmail && !byEmail.betterAuthId) {
    await ctx.db.patch(byEmail._id, { betterAuthId });
    return { ...byEmail, betterAuthId };
  }

  return byEmail;
}
