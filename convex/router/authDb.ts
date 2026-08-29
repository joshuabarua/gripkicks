import type { HonoWithConvex } from "convex-helpers/server/hono";
import type { FunctionArgs } from "convex/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { requireServiceToken, type HttpContext } from "./helpers";

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
      internal.authDb.createUser,
      body as unknown as FunctionArgs<typeof internal.authDb.createUser>,
    );
  }
  if (operation === "update") {
    return await c.env.runMutation(internal.authDb.updateUser, {
      id: body.id as Id<"users">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(internal.authDb.deleteUser, {
      id: body.id as Id<"users">,
    });
    return { success: true };
  }
  if (operation === "findById") {
    return await c.env.runQuery(internal.authDb.findUserById, {
      id: body.id as Id<"users">,
    });
  }
  if (operation === "findByEmail") {
    return await c.env.runQuery(internal.authDb.findUserByEmail, {
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
    return await c.env.runMutation(internal.authDb.createSession, {
      ...body,
      userId: body["userId"] as Id<"users">,
    } as unknown as FunctionArgs<typeof internal.authDb.createSession>);
  }
  if (operation === "update") {
    return await c.env.runMutation(internal.authDb.updateSession, {
      id: body.id as Id<"sessions">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(internal.authDb.deleteSession, {
      id: body.id as Id<"sessions">,
    });
    return { success: true };
  }
  if (operation === "deleteByToken") {
    await c.env.runMutation(internal.authDb.deleteSessionByToken, {
      token: body["token"] as string,
    });
    return { success: true };
  }
  if (operation === "deleteByUserId") {
    const count = await c.env.runMutation(internal.authDb.deleteSessionsByUserId, {
      userId: body["userId"] as Id<"users">,
    });
    return { success: true, count };
  }
  if (operation === "findById") {
    return await c.env.runQuery(internal.authDb.findSessionById, {
      id: body.id as Id<"sessions">,
    });
  }
  if (operation === "findByToken") {
    return await c.env.runQuery(internal.authDb.findSessionByToken, {
      token: body["token"] as string,
    });
  }
  if (operation === "findByUserId") {
    return await c.env.runQuery(internal.authDb.findSessionsByUserId, {
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
    return await c.env.runMutation(internal.authDb.createAccount, {
      ...body,
      userId: body["userId"] as Id<"users">,
    } as unknown as FunctionArgs<typeof internal.authDb.createAccount>);
  }
  if (operation === "update") {
    return await c.env.runMutation(internal.authDb.updateAccount, {
      id: body.id as Id<"accounts">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(internal.authDb.deleteAccount, {
      id: body.id as Id<"accounts">,
    });
    return { success: true };
  }
  if (operation === "findById") {
    return await c.env.runQuery(internal.authDb.findAccountById, {
      id: body.id as Id<"accounts">,
    });
  }
  if (operation === "findByUserId") {
    return await c.env.runQuery(internal.authDb.findAccountByUserId, {
      userId: body["userId"] as Id<"users">,
    });
  }
  if (operation === "findByProviderAccountId") {
    return await c.env.runQuery(internal.authDb.findAccountByProviderAndAccountId, {
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
      internal.authDb.createVerification,
      validFields as unknown as FunctionArgs<
        typeof internal.authDb.createVerification
      >,
    );
  }
  if (operation === "update") {
    return await c.env.runMutation(internal.authDb.updateVerification, {
      id: body.id as Id<"verifications">,
      ...body.data,
    });
  }
  if (operation === "delete") {
    await c.env.runMutation(internal.authDb.deleteVerification, {
      id: body.id as Id<"verifications">,
    });
    return { success: true };
  }
  if (operation === "findByIdentifier") {
    return await c.env.runQuery(internal.authDb.findVerificationByIdentifier, {
      identifier: body["identifier"] as string,
    });
  }
  return null;
}

async function handleJwkOperation(
  c: HttpContext,
  operation: string,
  body: AuthDbBody,
): Promise<unknown> {
  if (operation === "create") {
    return await c.env.runMutation(
      internal.authDb.createJwk,
      body as unknown as FunctionArgs<typeof internal.authDb.createJwk>,
    );
  }
  if (operation === "list") {
    return await c.env.runQuery(internal.authDb.listJwks, {});
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
  jwks: handleJwkOperation,
};

export function registerAuthDbRoutes(app: HonoWithConvex<ActionCtx>) {
  app.use("/api/auth-db/*", requireServiceToken);
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
