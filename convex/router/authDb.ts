import type { HonoWithConvex } from "convex-helpers/server/hono";
import type { FunctionArgs } from "convex/server";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { HttpContext } from "./helpers";

type AuthDbBody = Record<string, unknown> & {
  id?: string;
  data?: Record<string, unknown>;
};

async function handleUserOperation(
  c: HttpContext,
  operation: string,
  body: AuthDbBody,
): Promise<unknown> {
  if (operation === "create") {
    return await c.env.runMutation(
      api.authDb.createUser,
      body as unknown as FunctionArgs<typeof api.authDb.createUser>,
    );
  }
  if (operation === "update") {
    return await c.env.runMutation(api.authDb.updateUser, {
      id: body.id as Id<"users">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(api.authDb.deleteUser, {
      id: body.id as Id<"users">,
    });
    return { success: true };
  }
  if (operation === "findById") {
    return await c.env.runQuery(api.authDb.findUserById, {
      id: body.id as Id<"users">,
    });
  }
  if (operation === "findByEmail") {
    return await c.env.runQuery(api.authDb.findUserByEmail, {
      email: body["email"] as string,
    });
  }
  return null;
}

async function handleSessionOperation(
  c: HttpContext,
  operation: string,
  body: AuthDbBody,
): Promise<unknown> {
  if (operation === "create") {
    return await c.env.runMutation(api.authDb.createSession, {
      ...body,
      userId: body["userId"] as Id<"users">,
    } as unknown as FunctionArgs<typeof api.authDb.createSession>);
  }
  if (operation === "update") {
    return await c.env.runMutation(api.authDb.updateSession, {
      id: body.id as Id<"sessions">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(api.authDb.deleteSession, {
      id: body.id as Id<"sessions">,
    });
    return { success: true };
  }
  if (operation === "deleteByToken") {
    await c.env.runMutation(api.authDb.deleteSessionByToken, {
      token: body["token"] as string,
    });
    return { success: true };
  }
  if (operation === "deleteByUserId") {
    const count = await c.env.runMutation(api.authDb.deleteSessionsByUserId, {
      userId: body["userId"] as Id<"users">,
    });
    return { success: true, count };
  }
  if (operation === "findById") {
    return await c.env.runQuery(api.authDb.findSessionById, {
      id: body.id as Id<"sessions">,
    });
  }
  if (operation === "findByToken") {
    return await c.env.runQuery(api.authDb.findSessionByToken, {
      token: body["token"] as string,
    });
  }
  if (operation === "findByUserId") {
    return await c.env.runQuery(api.authDb.findSessionsByUserId, {
      userId: body["userId"] as Id<"users">,
    });
  }
  return null;
}

async function handleAccountOperation(
  c: HttpContext,
  operation: string,
  body: AuthDbBody,
): Promise<unknown> {
  if (operation === "create") {
    return await c.env.runMutation(api.authDb.createAccount, {
      ...body,
      userId: body["userId"] as Id<"users">,
    } as unknown as FunctionArgs<typeof api.authDb.createAccount>);
  }
  if (operation === "update") {
    return await c.env.runMutation(api.authDb.updateAccount, {
      id: body.id as Id<"accounts">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(api.authDb.deleteAccount, {
      id: body.id as Id<"accounts">,
    });
    return { success: true };
  }
  if (operation === "findById") {
    return await c.env.runQuery(api.authDb.findAccountById, {
      id: body.id as Id<"accounts">,
    });
  }
  if (operation === "findByUserId") {
    return await c.env.runQuery(api.authDb.findAccountByUserId, {
      userId: body["userId"] as Id<"users">,
    });
  }
  if (operation === "findByProviderAccountId") {
    return await c.env.runQuery(api.authDb.findAccountByProviderAndAccountId, {
      providerId: body["providerId"] as string,
      accountId: body["accountId"] as string,
    });
  }
  return null;
}

async function handleVerificationOperation(
  c: HttpContext,
  operation: string,
  body: AuthDbBody,
): Promise<unknown> {
  if (operation === "create") {
    const { id, createdAt, updatedAt, ...rest } = body as Record<
      string,
      unknown
    >;
    const validFields = {
      ...rest,
      expiresAt:
        typeof body["expiresAt"] === "string"
          ? new Date(body["expiresAt"]).getTime()
          : body["expiresAt"],
    };
    return await c.env.runMutation(
      api.authDb.createVerification,
      validFields as unknown as FunctionArgs<
        typeof api.authDb.createVerification
      >,
    );
  }
  if (operation === "update") {
    return await c.env.runMutation(api.authDb.updateVerification, {
      id: body.id as Id<"verifications">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(api.authDb.deleteVerification, {
      id: body.id as Id<"verifications">,
    });
    return { success: true };
  }
  if (operation === "findByIdentifier") {
    return await c.env.runQuery(api.authDb.findVerificationByIdentifier, {
      identifier: body["identifier"] as string,
    });
  }
  return null;
}

const modelHandlers: Record<
  string,
  (c: HttpContext, operation: string, body: AuthDbBody) => Promise<unknown>
> = {
  user: handleUserOperation,
  session: handleSessionOperation,
  account: handleAccountOperation,
  verification: handleVerificationOperation,
};

export function registerAuthDbRoutes(app: HonoWithConvex<ActionCtx>) {
  app.post("/api/auth-db/:model/:operation", async (c) => {
    try {
      const model = c.req.param("model");
      const operation = c.req.param("operation");
      const body: AuthDbBody = await c.req.json();

      const handler = modelHandlers[model];
      const result = handler ? await handler(c, operation, body) : null;

      return c.json({ success: true, data: result });
    } catch (error) {
      console.error("Convex AuthDB Error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ success: false, error: message }, 500);
    }
  });
}
