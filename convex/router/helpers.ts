import type { Context } from "hono";
import type { FunctionReturnType } from "convex/server";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

export type HttpContext = Context<{ Bindings: ActionCtx }>;

export type UserResult = NonNullable<
  FunctionReturnType<typeof api.users.findByBetterAuthId>
>;

export async function findUserByBetterAuthId(
  c: HttpContext,
  betterAuthId: string,
) {
  return await c.env.runQuery(api.users.findByBetterAuthId, { betterAuthId });
}

export async function findUserByIdOrBetterAuthId(c: HttpContext, id: string) {
  const byBetterAuthId = await findUserByBetterAuthId(c, id);
  if (byBetterAuthId) return byBetterAuthId;

  try {
    return await c.env.runQuery(api.users.getById, { id: id as Id<"users"> });
  } catch {
    return null;
  }
}

export function handleError(c: HttpContext, error: unknown, context: string) {
  console.error(`Error ${context}:`, error);
  const message = error instanceof Error ? error.message : String(error);
  return c.json({ success: false, message }, 500);
}

export function handleValidationError(c: HttpContext, fieldName: string) {
  return c.json({ success: false, message: `${fieldName} is required` }, 400);
}

export function handleNotFound(c: HttpContext, resourceName: string) {
  return c.json({ success: false, message: `${resourceName} not found` }, 404);
}

async function withUserValidationBase(
  c: HttpContext,
  user: UserResult | null,
  operation: (user: UserResult) => Promise<unknown>,
) {
  if (!user) {
    return handleNotFound(c, "User");
  }

  try {
    const result = await operation(user);
    return c.json({ success: true, data: result });
  } catch (error) {
    return handleError(c, error, "operation");
  }
}

export async function withUserValidation(
  c: HttpContext,
  betterAuthId: string,
  operation: (user: UserResult) => Promise<unknown>,
) {
  if (!betterAuthId) {
    return handleValidationError(c, "BetterAuth ID");
  }

  const user = await findUserByBetterAuthId(c, betterAuthId);
  return withUserValidationBase(c, user, operation);
}

export async function withUserAndShoeValidation(
  c: HttpContext,
  betterAuthId: string,
  shoeId: string,
  operation: (user: UserResult, shoeId: Id<"shoes">) => Promise<unknown>,
) {
  if (!betterAuthId || !shoeId) {
    return c.json(
      { success: false, message: "BetterAuth ID and Shoe ID are required" },
      400,
    );
  }

  const user = await findUserByBetterAuthId(c, betterAuthId);
  return withUserValidationBase(c, user, (u) =>
    operation(u, shoeId as Id<"shoes">),
  );
}

export async function withUserIdValidation(
  c: HttpContext,
  id: string,
  operation: (user: UserResult) => Promise<unknown>,
) {
  if (!id) {
    return handleValidationError(c, "User ID");
  }

  const user = await findUserByIdOrBetterAuthId(c, id);
  return withUserValidationBase(c, user, operation);
}

export async function withIdValidation<T>(
  c: HttpContext,
  id: string,
  idName: string,
  operation: (id: T) => Promise<unknown>,
) {
  if (!id) {
    return handleValidationError(c, idName);
  }

  try {
    const result = await operation(id as T);
    return c.json({ success: true, data: result });
  } catch (error) {
    return handleError(c, error, "operation");
  }
}
