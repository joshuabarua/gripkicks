import type { HonoWithConvex } from "convex-helpers/server/hono";
import type { FunctionArgs, FunctionReference } from "convex/server";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { requireServiceToken, type HttpContext } from "./helpers";

type AuthDbBody = Record<string, unknown>;
type OpHandler = (c: HttpContext, body: AuthDbBody) => Promise<unknown>;

type InternalMutation = FunctionReference<"mutation", "internal">;
type InternalQuery = FunctionReference<"query", "internal">;
type AnyInternalFn = InternalMutation | InternalQuery;

type ArgsWithUndefined<F extends AnyInternalFn> = {
  [K in keyof FunctionArgs<F>]: FunctionArgs<F>[K] | undefined;
};

const definedOnly = <F extends AnyInternalFn>(
  args: ArgsWithUndefined<F>,
): FunctionArgs<F> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    if (value !== undefined) out[key] = value;
  }
  return out as FunctionArgs<F>;
};

const str = (value: unknown) => value as string;
const optStr = (value: unknown) => value as string | undefined;
const bool = (value: unknown) => value as boolean;
const optBool = (value: unknown) => value as boolean | undefined;
const num = (value: unknown) => value as number;
const optNum = (value: unknown) => value as number | undefined;
const numOrStr = (value: unknown) => value as number | string;
const optNumOrStr = (value: unknown) => value as number | string | undefined;
const patchData = (body: AuthDbBody) => (body.data ?? {}) as Record<string, unknown>;

const mutation = <F extends InternalMutation>(
  fn: F,
  mapArgs: (body: AuthDbBody) => ArgsWithUndefined<F>,
): OpHandler => (c, body) =>
  c.env.runMutation(fn, definedOnly<F>(mapArgs(body)));

const query = <F extends InternalQuery>(
  fn: F,
  mapArgs: (body: AuthDbBody) => ArgsWithUndefined<F>,
): OpHandler => (c, body) =>
  c.env.runQuery(fn, definedOnly<F>(mapArgs(body)));

const withSuccess = (handler: OpHandler): OpHandler =>
  async (c, body) => {
    await handler(c, body);
    return { success: true };
  };

const dispatch: Record<string, Record<string, OpHandler>> = {
  user: {
    create: mutation(internal.authDb.createUser, (b) => ({
      id: optStr(b.id),
      betterAuthId: str(b.betterAuthId),
      name: str(b.name),
      email: str(b.email),
      emailVerified: bool(b.emailVerified),
      image: optStr(b.image),
      isAdmin: optBool(b.isAdmin),
      createdAt: optNumOrStr(b.createdAt),
    })),
    update: mutation(internal.authDb.updateUser, (b) => {
      const d = patchData(b);
      return {
        id: b.id as Id<"users">,
        name: optStr(d.name),
        email: optStr(d.email),
        emailVerified: optBool(d.emailVerified),
        image: optStr(d.image),
      };
    }),
    delete: withSuccess(
      mutation(internal.authDb.deleteUser, (b) => ({ id: b.id as Id<"users"> })),
    ),
    findById: query(internal.authDb.findUserById, (b) => ({
      id: b.id as Id<"users">,
    })),
    findByEmail: query(internal.authDb.findUserByEmail, (b) => ({
      email: str(b.email),
    })),
  },
  session: {
    create: mutation(internal.authDb.createSession, (b) => ({
      id: optStr(b.id),
      token: str(b.token),
      userId: str(b.userId),
      expiresAt: numOrStr(b.expiresAt),
      ipAddress: optStr(b.ipAddress),
      userAgent: optStr(b.userAgent),
      createdAt: optNumOrStr(b.createdAt),
    })),
    update: mutation(internal.authDb.updateSession, (b) => {
      const d = patchData(b);
      return {
        id: b.id as Id<"sessions">,
        token: optStr(d.token),
        expiresAt: optNumOrStr(d.expiresAt),
        ipAddress: optStr(d.ipAddress),
        userAgent: optStr(d.userAgent),
      };
    }),
    delete: withSuccess(
      mutation(internal.authDb.deleteSession, (b) => ({
        id: b.id as Id<"sessions">,
      })),
    ),
    deleteByToken: withSuccess(
      mutation(internal.authDb.deleteSessionByToken, (b) => ({
        token: str(b.token),
      })),
    ),
    deleteByTokenOrId: withSuccess(
      mutation(internal.authDb.deleteSessionByTokenOrId, (b) => ({
        value: str(b.value),
      })),
    ),
    deleteByUserId: async (c, b) => ({
      success: true,
      count: await c.env.runMutation(internal.authDb.deleteSessionsByUserId, {
        userId: b.userId as Id<"users">,
      }),
    }),
    findById: query(internal.authDb.findSessionById, (b) => ({
      id: b.id as Id<"sessions">,
    })),
    findByToken: query(internal.authDb.findSessionByToken, (b) => ({
      token: str(b.token),
    })),
    findByUserId: query(internal.authDb.findSessionsByUserId, (b) => ({
      userId: b.userId as Id<"users">,
    })),
  },
  account: {
    create: mutation(internal.authDb.createAccount, (b) => ({
      id: optStr(b.id),
      accountId: str(b.accountId),
      providerId: str(b.providerId),
      userId: str(b.userId),
      accessToken: optStr(b.accessToken),
      refreshToken: optStr(b.refreshToken),
      idToken: optStr(b.idToken),
      expiresAt: optNumOrStr(b.expiresAt),
      password: optStr(b.password),
      accessTokenExpiresAt: optNumOrStr(b.accessTokenExpiresAt),
      refreshTokenExpiresAt: optNumOrStr(b.refreshTokenExpiresAt),
      scope: optStr(b.scope),
      createdAt: optNumOrStr(b.createdAt),
    })),
    update: mutation(internal.authDb.updateAccount, (b) => {
      const d = patchData(b);
      return {
        id: b.id as Id<"accounts">,
        accessToken: optStr(d.accessToken),
        refreshToken: optStr(d.refreshToken),
        idToken: optStr(d.idToken),
        expiresAt: optNum(d.expiresAt),
        password: optStr(d.password),
        accessTokenExpiresAt: optNum(d.accessTokenExpiresAt),
        refreshTokenExpiresAt: optNum(d.refreshTokenExpiresAt),
        scope: optStr(d.scope),
      };
    }),
    delete: withSuccess(
      mutation(internal.authDb.deleteAccount, (b) => ({
        id: b.id as Id<"accounts">,
      })),
    ),
    findById: query(internal.authDb.findAccountById, (b) => ({
      id: b.id as Id<"accounts">,
    })),
    findByUserId: query(internal.authDb.findAccountByUserId, (b) => ({
      userId: b.userId as Id<"users">,
    })),
    findByProviderAccountId: query(
      internal.authDb.findAccountByProviderAndAccountId,
      (b) => ({
        providerId: str(b.providerId),
        accountId: str(b.accountId),
      }),
    ),
  },
  verification: {
    create: mutation(internal.authDb.createVerification, (b) => ({
      id: optStr(b.id),
      identifier: str(b.identifier),
      value: str(b.value),
      expiresAt:
        typeof b.expiresAt === "string"
          ? new Date(b.expiresAt).getTime()
          : num(b.expiresAt),
    })),
    update: mutation(internal.authDb.updateVerification, (b) => {
      const d = patchData(b);
      return {
        id: b.id as Id<"verifications">,
        identifier: optStr(d.identifier),
        value: optStr(d.value),
        expiresAt: optNum(d.expiresAt),
      };
    }),
    delete: withSuccess(
      mutation(internal.authDb.deleteVerification, (b) => ({
        id: b.id as Id<"verifications">,
      })),
    ),
    deleteExpired: mutation(internal.authDb.deleteExpired, (b) => ({
      expiresBefore: num(b.expiresBefore),
    })),
    findById: query(internal.authDb.findVerificationById, (b) => ({
      id: b.id as Id<"verifications">,
    })),
    findByIdentifier: query(internal.authDb.findVerificationByIdentifier, (b) => ({
      identifier: str(b.identifier),
    })),
  },
  jwks: {
    create: mutation(internal.authDb.createJwk, (b) => ({
      publicKey: str(b.publicKey),
      privateKey: str(b.privateKey),
      createdAt: num(b.createdAt),
      expiresAt: optNum(b.expiresAt),
      alg: optStr(b.alg),
      crv: optStr(b.crv),
    })),
    delete: withSuccess(
      mutation(internal.authDb.deleteJwk, (b) => ({ id: b.id as Id<"jwks"> })),
    ),
    findById: query(internal.authDb.findJwkById, (b) => ({
      id: b.id as Id<"jwks">,
    })),
    list: query(internal.authDb.listJwks, () => ({})),
  },
};

export function registerAuthDbRoutes(app: HonoWithConvex<ActionCtx>) {
  app.use("/api/auth-db/*", requireServiceToken);
  app.post("/api/auth-db/:model/:operation", async (c) => {
    try {
      const model = c.req.param("model");
      const operation = c.req.param("operation");
      const body: AuthDbBody = await c.req.json();

      const handler = dispatch[model]?.[operation];
      if (!handler) {
        throw new Error(`Unsupported auth-db operation: ${model}/${operation}`);
      }

      const result = await handler(c, body);
      return c.json({ success: true, data: result });
    } catch (error) {
      console.error("Convex AuthDB Error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return c.json({ success: false, error: message }, 500);
    }
  });
}
