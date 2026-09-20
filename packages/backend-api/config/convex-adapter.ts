/**
 * Custom Convex Database Adapter for Better Auth
 *
 * This adapter stores auth data (users, sessions, accounts, verifications) in Convex
 * via HTTP calls to the Convex deployment's HTTP endpoints.
 */

import { createAdapterFactory } from "better-auth/adapters";
import {
  callConvex as callConvexApi,
  getConvexBaseUrls,
} from "../utils/convexClient";

interface ConvexAdapterConfig {
  convexUrl: string;
  serviceToken: string;
  debugLogs?: boolean;
}

const normalizeNullableRecord = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === null ? undefined : value,
    ]),
  );

const pickFields = (
  data: Record<string, unknown>,
  allowedFields: readonly string[],
) =>
  Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      if (!allowedFields.includes(key)) return false;
      return value !== undefined;
    }),
  );

function sanitizeCreatePayload(
  model: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const normalizedData = normalizeNullableRecord(data);

  if (model === "user") {
    return pickFields(normalizedData, [
      "id",
      "betterAuthId",
      "name",
      "email",
      "emailVerified",
      "image",
      "isAdmin",
      "createdAt",
    ]);
  }

  if (model === "session") {
    return pickFields(normalizedData, [
      "id",
      "token",
      "userId",
      "expiresAt",
      "ipAddress",
      "userAgent",
      "createdAt",
    ]);
  }

  if (model === "account") {
    return pickFields(normalizedData, [
      "id",
      "accountId",
      "providerId",
      "userId",
      "accessToken",
      "refreshToken",
      "idToken",
      "expiresAt",
      "password",
      "accessTokenExpiresAt",
      "refreshTokenExpiresAt",
      "scope",
      "createdAt",
    ]);
  }

  if (model === "verification") {
    return pickFields(normalizedData, [
      "id",
      "identifier",
      "value",
      "expiresAt",
      "createdAt",
    ]);
  }

  if (model === "jwks") {
    return pickFields(normalizedData, [
      "publicKey",
      "privateKey",
      "createdAt",
      "expiresAt",
      "alg",
      "crv",
    ]);
  }

  return normalizedData;
}

const toTimestamp = (value: unknown) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    return new Date(value).getTime();
  }

  return value;
};

function sanitizeUpdatePayload(
  model: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sanitizedData = sanitizeCreatePayload(model, data);

  if (model === "session") {
    return {
      ...sanitizedData,
      expiresAt: toTimestamp(sanitizedData.expiresAt),
    };
  }

  if (model === "account") {
    return {
      ...sanitizedData,
      expiresAt: toTimestamp(sanitizedData.expiresAt),
      accessTokenExpiresAt: toTimestamp(sanitizedData.accessTokenExpiresAt),
      refreshTokenExpiresAt: toTimestamp(sanitizedData.refreshTokenExpiresAt),
    };
  }

  if (model === "verification" || model === "jwks") {
    return {
      ...sanitizedData,
      createdAt: toTimestamp(sanitizedData.createdAt),
      expiresAt: toTimestamp(sanitizedData.expiresAt),
    };
  }

  return sanitizedData;
}

// Map Better Auth model names to our Convex model names
const modelMap: Record<string, string> = {
  user: "user",
  session: "session",
  account: "account",
  verification: "verification",
  jwks: "jwks",
};

const convexAdapter = (config: ConvexAdapterConfig) => {
  const baseUrls = getConvexBaseUrls(config.convexUrl);

  const callConvex = async (
    model: string,
    operation: string,
    data: Record<string, unknown>,
  ) => {
    const mappedModel = modelMap[model] || model;

    if (config.debugLogs) {
      console.log(
        `[ConvexAdapter] ${operation} on ${model}:`,
        JSON.stringify(data, null, 2),
      );
    }

    try {
      const result = await callConvexApi<any>(
        `/api/auth-db/${mappedModel}/${operation}`,
        data,
        {
          baseUrls,
          serviceToken: config.serviceToken,
          timeoutMs: 0,
        },
      );

      if (config.debugLogs) {
        console.log(
          `[ConvexAdapter] Result:`,
          JSON.stringify(result, null, 2),
        );
      }

      return result;
    } catch (error) {
      console.error(`[ConvexAdapter] Failed to call ${operation} on ${model}:`, error);
      throw error;
    }
  };

  type WhereClause = { field: string; value: unknown; operator?: string };

  async function findRecordsByUserIdWhere(
    model: string,
    where: WhereClause[],
    offset?: number,
    limit?: number,
  ) {
    const userIdWhere = where.find((w) => w.field === "userId");
    if (!userIdWhere) return null;

    const result = await callConvex(model, "findByUserId", {
      userId: userIdWhere.value,
    });
    let records = Array.isArray(result) ? result : [];

    if (offset) records = records.slice(offset);
    if (limit) records = records.slice(0, limit);

    return records;
  }

  return createAdapterFactory({
    config: {
      adapterId: "convex-http",
      adapterName: "Convex HTTP Adapter",
      usePlural: false,
      debugLogs: config.debugLogs ?? false,
      supportsJSON: true,
      supportsDates: false, // Convex uses timestamps (numbers)
      supportsBooleans: true,
      supportsNumericIds: false, // Convex uses string IDs
      disableIdGeneration: false, // Let Better Auth generate IDs
    },
    adapter: () => {
      return {
        create: async ({ model, data }) => {
          if (config.debugLogs) {
            console.log(`[ConvexAdapter] CREATE ${model}:`, data);
          }

          const sanitizedData = sanitizeCreatePayload(model, data);

          // Convert expiresAt from string to number if present (for verification model)
          // Also filter out extra fields that aren't in the validator
          let finalData: Record<string, unknown> = sanitizedData;
          if (model === "verification") {
            const { id, createdAt, updatedAt, expiresAt, ...rest } =
              sanitizedData as Record<string, unknown>;
            finalData = {
              ...rest,
              expiresAt:
                expiresAt && typeof expiresAt === "string"
                  ? new Date(expiresAt).getTime()
                  : expiresAt,
            };
          } else if (model === "jwks") {
            const { id, updatedAt, createdAt, expiresAt, ...rest } =
              sanitizedData as Record<string, unknown>;
            finalData = {
              ...rest,
              createdAt: toTimestamp(createdAt),
              expiresAt: toTimestamp(expiresAt),
            };
          }

          // Add betterAuthId for user model
          if (model === "user" && data.id) {
            const dataWithBetterAuthId: Record<string, unknown> = {
              ...finalData,
              betterAuthId: data.id,
            };
            const result = await callConvex(
              model,
              "create",
              dataWithBetterAuthId,
            );
            return result;
          }

          const result = await callConvex(model, "create", finalData);
          return result;
        },

        update: async ({ model, where, update }) => {
          // Better Auth passes where clause with field conditions
          // We need to find the record first, then update by ID
          const field = where[0]?.field;
          const value = where[0]?.value;

          if (!field || value === undefined) {
            throw new Error("Update requires a field and value");
          }

          let id: string | undefined;

          // Special handling for session updates by token
          if (model === "session" && field === "token") {
            // Find the session by token first
            const session = await callConvex(model, "findByToken", {
              token: value,
            });
            if (config.debugLogs) {
              console.log("[ConvexAdapter] Found session:", session);
            }
            // The session.id is already a proper Convex ID
            id = session?.id;
          } else if (model === "account") {
            const providerWhere = where.find((w) => w.field === "providerId");
            const accountWhere = where.find((w) => w.field === "accountId");
            const userIdWhere = where.find((w) => w.field === "userId");

            if (providerWhere && accountWhere) {
              const account = await callConvex(model, "findByProviderAccountId", {
                providerId: providerWhere.value,
                accountId: accountWhere.value,
              });
              if (config.debugLogs) {
                console.log("[ConvexAdapter] Found account by provider/account:", account);
              }
              id = account?.id;
            } else if (userIdWhere) {
              const accounts = await callConvex(model, "findByUserId", {
                userId: userIdWhere.value,
              });
              if (config.debugLogs) {
                console.log("[ConvexAdapter] Found accounts by userId:", accounts);
              }
              id = Array.isArray(accounts) ? accounts[0]?.id : accounts?.id;
            } else if (field === "id" || field === "_id") {
              const account = await callConvex(model, "findById", {
                id: value,
              });
              id = account?.id;
            }
          } else if (field === "id" || field === "_id") {
            id = value as string;
          } else {
            // For other fields, we'd need to implement specific lookups
            console.warn(
              `[ConvexAdapter] Update by ${field} not implemented for ${model}`,
            );
            return null;
          }

          if (!id) {
            throw new Error("Record not found for update");
          }

          if (config.debugLogs) {
            console.log(`[ConvexAdapter] Updating ${model} with ID:`, id);
          }

          const sanitizedUpdate = sanitizeUpdatePayload(
            model,
            update as Record<string, unknown>,
          );

          const result = await callConvex(model, "update", {
            id,
            data: sanitizedUpdate,
          });
          return result;
        },

        updateMany: async ({ model, where, update }) => {
          // Better Auth rarely uses updateMany, but we can implement basic support
          // by finding records and updating them individually
          try {
            if (!where || where.length === 0) {
              console.warn("[ConvexAdapter] updateMany requires where clause");
              return 0;
            }

            // For session model, handle specific cases
            if (model === "session") {
              const sessions = await findRecordsByUserIdWhere(model, where);
              if (sessions) {
                let updateCount = 0;
                for (const session of sessions) {
                  await callConvex(model, "update", {
                    id: session.id,
                    data: update,
                  });
                  updateCount++;
                }
                return updateCount;
              }
            }

            console.warn(
              `[ConvexAdapter] updateMany not fully implemented for model: ${model}`,
            );
            return 0;
          } catch (error) {
            console.error("[ConvexAdapter] updateMany error:", error);
            return 0;
          }
        },

        delete: async ({ model, where }) => {
          const field = where[0]?.field;
          const value = where[0]?.value;

          if (config.debugLogs) {
            console.log(
              `[ConvexAdapter] DELETE called with model: ${model}, where:`,
              where,
            );
            console.log(`[ConvexAdapter] Field: ${field}, Value: ${value}`);
          }

          if (!field || value === undefined) {
            throw new Error("Delete requires a field and value");
          }

          if (
            model === "session" &&
            (field === "token" || field === "id" || field === "_id")
          ) {
            await callConvex(model, "deleteByTokenOrId", { value });
            return;
          }

          // Handle deletion by ID
          if (field === "id" || field === "_id") {
            await callConvex(model, "delete", { id: value });
            return;
          }

          throw new Error(`Delete by ${field} not implemented for ${model}`);
        },

        deleteMany: async ({ model, where }) => {
          // Handle special cases for session deletion
          if (model === "session") {
            const field = where[0]?.field;
            const value = where[0]?.value;

            if (field === "token") {
              await callConvex(model, "deleteByToken", { token: value });
              return 1;
            } else if (field === "userId") {
              const result = await callConvex(model, "deleteByUserId", {
                userId: value,
              });
              return result?.count || 0;
            }
          }

          if (model === "account" && where[0]?.field === "userId") {
            const accounts = await callConvex(model, "findByUserId", {
              userId: where[0].value,
            });
            if (!Array.isArray(accounts)) return 0;
            for (const account of accounts) {
              await callConvex(model, "delete", { id: account.id });
            }
            return accounts.length;
          }

          if (model === "user") {
            const field = where[0]?.field;
            const value = where[0]?.value;
            const user =
              field === "email"
                ? await callConvex(model, "findByEmail", { email: value })
                : field === "id" || field === "_id"
                  ? await callConvex(model, "findById", { id: value })
                  : null;
            if (!user?.id) return 0;
            await callConvex(model, "delete", { id: user.id });
            return 1;
          }

          // Handle verification deletion by expiresAt (for cleanup)
          if (model === "verification" && where.length > 0) {
            const identifierWhere = where.find(
              (entry: { field: string; value: unknown }) =>
                entry.field === "identifier",
            );
            if (identifierWhere) {
              const verification = await callConvex(model, "findByIdentifier", {
                identifier: identifierWhere.value,
              });
              if (!verification?.id) return 0;
              await callConvex(model, "delete", { id: verification.id });
              return 1;
            }

            const expiresWhere = where.find(
              (w: { field: string; value: unknown; operator?: string }) =>
                w.field === "expiresAt" && w.operator === "lt",
            );
            if (expiresWhere) {
              if (config.debugLogs) {
                console.log(
                  "[ConvexAdapter] About to delete expired verifications with expiresBefore:",
                  expiresWhere.value,
                );
              }

              // Convert string timestamp to number if needed
              let expiresBefore = expiresWhere.value;
              if (typeof expiresBefore === "string") {
                expiresBefore = new Date(expiresBefore).getTime();
              }

              // Delete expired verifications
              const result = await callConvex(model, "deleteExpired", {
                expiresBefore: expiresBefore as number,
              });

              if (config.debugLogs) {
                console.log(
                  "[ConvexAdapter] Deleted expired verifications, count:",
                  result?.count,
                );
              }
              return result?.count || 0;
            }
          }

          throw new Error(
            `deleteMany does not support ${model} with the supplied filters`,
          );
        },

        findOne: async ({ model, where }) => {
          // Determine the lookup method based on the where clause
          const field = where[0]?.field;
          const value = where[0]?.value;

          if (!field || value === undefined) {
            return null;
          }

          let operation: string | null = null;
          const data: Record<string, unknown> = {};

          if (field === "id" || field === "_id") {
            operation = "findById";
            data.id = value;
          } else if (field === "email" && model === "user") {
            operation = "findByEmail";
            data.email = value;
          } else if (field === "token" && model === "session") {
            operation = "findByToken";
            data.token = value;
          } else if (field === "identifier" && model === "verification") {
            operation = "findByIdentifier";
            data.identifier = value;
          } else if (field === "userId") {
            operation = "findByUserId";
            data.userId = value;
          } else if (model === "account" && where.length >= 2) {
            // Account lookup by providerId + accountId
            const providerWhere = where.find((w) => w.field === "providerId");
            const accountWhere = where.find((w) => w.field === "accountId");
            if (providerWhere && accountWhere) {
              operation = "findByProviderAccountId";
              data.providerId = providerWhere.value;
              data.accountId = accountWhere.value;
            }
          }

          if (!operation) {
            throw new Error(
              `findOne does not support ${model} by ${field}`,
            );
          }

          try {
            const result = await callConvex(model, operation, data);
            return result;
          } catch (error) {
            console.error(`[ConvexAdapter] findOne error:`, error);
            return null;
          }
        },

        findMany: async ({ model, where, limit, offset }) => {
          if (model === "jwks") {
            const keys = await callConvex(model, "list", {});
            return Array.isArray(keys) ? keys : [];
          }

          // Handle verification queries by identifier
          if (model === "verification" && where && where.length > 0) {
            const identifierWhere = where.find((w) => w.field === "identifier");
            if (identifierWhere) {
              const result = await callConvex(model, "findByIdentifier", {
                identifier: identifierWhere.value,
              });
              let records = result ? [result] : [];
              if (offset) records = records.slice(offset);
              if (limit) records = records.slice(0, limit);
              return records;
            }

            const expiredCleanup = where.some(
              (w) => w.field === "expiresAt" && w.operator === "lt",
            );
            if (expiredCleanup) return [];
          }

          if (
            (model === "session" || model === "account") &&
            where &&
            where.length > 0
          ) {
            const records = await findRecordsByUserIdWhere(
              model,
              where,
              offset,
              limit,
            );
            if (records) return records;
          }

          throw new Error(
            `findMany does not support ${model} with the supplied filters`,
          );
        },

        count: async ({ model, where }) => {
          if (!where || where.length === 0) {
            throw new Error("count requires a where clause");
          }

          if (model === "session" || model === "account") {
            const records = await findRecordsByUserIdWhere(model, where);
            if (records) return records.length;
          }

          throw new Error(
            `count does not support ${model} with the supplied filters`,
          );
        },

        options: config,
      };
    },
  });
};

export default convexAdapter;
