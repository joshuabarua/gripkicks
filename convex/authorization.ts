import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { findUserByAuthSubject } from "./userHelpers";

type AuthorizationContext = Pick<QueryCtx | MutationCtx, "auth" | "db">;

export async function requireCurrentUser(
  ctx: AuthorizationContext,
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authentication required" });
  }

  const user = await findUserByAuthSubject(ctx, identity.subject);
  if (!user) {
    throw new ConvexError({ code: "UNAUTHENTICATED", message: "Authenticated user not found" });
  }

  return user;
}

export async function requireUserAccess(
  ctx: AuthorizationContext,
  userId: Id<"users">,
): Promise<Doc<"users">> {
  const user = await requireCurrentUser(ctx);
  if (user._id !== userId && !user.isAdmin) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Access denied" });
  }
  return user;
}

export async function requireUserShoeAccess(
  ctx: AuthorizationContext,
  userShoeId: Id<"userShoes">,
): Promise<Doc<"userShoes">> {
  const userShoe = await ctx.db.get(userShoeId);
  if (!userShoe) {
    throw new ConvexError({ code: "NOT_FOUND", message: "User shoe not found" });
  }

  await requireUserAccess(ctx, userShoe.userId);
  return userShoe;
}

export async function requireAdmin(
  ctx: AuthorizationContext,
): Promise<Doc<"users">> {
  const user = await requireCurrentUser(ctx);
  if (!user.isAdmin) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return user;
}
