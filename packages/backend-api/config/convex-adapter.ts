/**
 * Custom Convex Database Adapter for Better Auth
 *
 * This adapter stores auth data (users, sessions, accounts, verifications) in Convex
 * via HTTP calls to the Convex deployment's HTTP endpoints.
 */

import { createAdapterFactory } from "better-auth/adapters";

interface ConvexAdapterConfig {
  convexUrl: string;
  debugLogs?: boolean;
}

const withNoTrailingSlash = (url: string) => url.replace(/\/$/, "");

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
      "updatedAt",
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
      "updatedAt",
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
      "updatedAt",
    ]);
  }

  if (model === "verification") {
    return pickFields(normalizedData, [
      "id",
      "identifier",
      "value",
      "expiresAt",
      "createdAt",
      "updatedAt",
    ]);
  }

  return normalizedData;
}

function getConvexBaseUrls(url: string): string[] {
  const normalized = withNoTrailingSlash(url);
  const urls = [normalized];

  if (normalized.includes(".convex.cloud")) {
    urls.push(normalized.replace(".convex.cloud", ".convex.site"));
  }

  if (normalized.includes(".convex.site")) {
    urls.push(normalized.replace(".convex.site", ".convex.cloud"));
  }

  return Array.from(new Set(urls));
}

// Map Better Auth model names to our Convex model names
const modelMap: Record<string, string> = {
  user: "user",
  session: "session",
  account: "account",
  verification: "verification",
};

export const convexAdapter = (config: ConvexAdapterConfig) => {
  const baseUrls = getConvexBaseUrls(config.convexUrl);

  const callConvex = async (
    model: string,
    operation: string,
    data: Record<string, unknown>,
  ) => {
    const mappedModel = modelMap[model] || model;
    const endpoints = baseUrls.map(
      (baseUrl) => `${baseUrl}/api/auth-db/${mappedModel}/${operation}`,
    );

    if (config.debugLogs) {
      console.log(
        `[ConvexAdapter] ${operation} on ${model}:`,
        JSON.stringify(data, null, 2),
      );
    }

    let lastError: Error | null = null;

    for (let i = 0; i < endpoints.length; i += 1) {
      const url = endpoints[i];

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseText = await response.text();

        if (!response.ok) {
          if (response.status === 404 && i < endpoints.length - 1) {
            if (config.debugLogs) {
              console.warn(
                `[ConvexAdapter] Endpoint not found at ${url}, trying fallback endpoint...`,
              );
            }
            continue;
          }

          console.error(
            `[ConvexAdapter] Error: ${response.status} ${responseText}`,
          );
          throw new Error(
            `Convex adapter error: ${response.status} - ${responseText}`,
          );
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          console.error(
            `[ConvexAdapter] Failed to parse response:`,
            responseText,
          );
          throw new Error(`Invalid JSON response from Convex`);
        }

        if (config.debugLogs) {
          console.log(
            `[ConvexAdapter] Result from ${url}:`,
            JSON.stringify(result, null, 2),
          );
        }

        // Return the data, ensuring it has the expected format
        return result.data;
      } catch (error) {
        lastError = error as Error;
        if (i === endpoints.length - 1) {
          console.error(`[ConvexAdapter] Failed to call ${url}:`, error);
        }
      }
    }

    throw lastError || new Error("Convex adapter request failed");
  };

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

          const result = await callConvex(model, "update", {
            id,
            data: update,
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
              const userIdWhere = where.find(
                (w: { field: string; value: unknown }) => w.field === "userId",
              );
              if (userIdWhere) {
                const sessions = await callConvex(model, "findByUserId", {
                  userId: userIdWhere.value,
                });
                if (Array.isArray(sessions)) {
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

          // Handle session deletion - check if value looks like a token (not a Convex ID)
          if (model === "session") {
            // Convex IDs look like "k1726gnwrvqwjh4488jt1wknhd80768a"
            // Session tokens look like "Pf8A0y4EJcr6wdkEmICxUt4VXDggMjCY"
            if (
              typeof value === "string" &&
              value.length > 20 &&
              /^[A-Za-z0-9]+$/.test(value)
            ) {
              if (config.debugLogs) {
                console.log(
                  `[ConvexAdapter] Detected session token, using deleteByToken`,
                );
              }
              await callConvex(model, "deleteByToken", { token: value });
              return;
            }
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

          // Handle verification deletion by expiresAt (for cleanup)
          if (model === "verification" && where.length > 0) {
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

              // Add a delay to prevent immediate cleanup of newly created verifications
              // Better Auth sometimes calls cleanup immediately after creation
              if (config.debugLogs) {
                console.log(
                  "[ConvexAdapter] Waiting 5 seconds before cleanup...",
                );
              }
              await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay

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

          // TODO: Implement deleteMany for other models
          console.warn(
            `[ConvexAdapter] deleteMany not fully implemented for model: ${model}, where:`,
            where,
          );
          throw new Error(
            `deleteMany operation not supported for this configuration`,
          );
        },

        findOne: async ({ model, where }) => {
          // Determine the lookup method based on the where clause
          const field = where[0]?.field;
          const value = where[0]?.value;

          if (!field || value === undefined) {
            return null;
          }

          let operation = "findById";
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

          try {
            const result = await callConvex(model, operation, data);
            return result;
          } catch (error) {
            console.error(`[ConvexAdapter] findOne error:`, error);
            return null;
          }
        },

        findMany: async ({ model, where, limit, offset, sortBy }) => {
          try {
            // Handle verification queries by identifier
            if (model === "verification" && where && where.length > 0) {
              const identifierWhere = where.find(
                (w: { field: string; value: unknown }) =>
                  w.field === "identifier",
              );
              if (identifierWhere) {
                const result = await callConvex(model, "findByIdentifier", {
                  identifier: identifierWhere.value,
                });
                const records = result ? [result] : [];

                // Apply limit and offset if provided
                let finalRecords = records;
                if (offset) finalRecords = finalRecords.slice(offset);
                if (limit) finalRecords = finalRecords.slice(0, limit);

                return finalRecords;
              }

              // Handle verification cleanup queries by expiresAt
              const expiresWhere = where.find(
                (w: { field: string; value: unknown; operator?: string }) =>
                  w.field === "expiresAt" && w.operator === "lt",
              );
              if (expiresWhere) {
                // For cleanup, return empty array - Better Auth will call deleteMany separately
                return [];
              }
            }

            // Handle session queries
            if (model === "session" && where && where.length > 0) {
              const userIdWhere = where.find(
                (w: { field: string; value: unknown }) => w.field === "userId",
              );
              if (userIdWhere) {
                const result = await callConvex(model, "findByUserId", {
                  userId: userIdWhere.value,
                });
                let records = Array.isArray(result) ? result : [];

                // Apply limit and offset if provided
                if (offset) records = records.slice(offset);
                if (limit) records = records.slice(0, limit);

                return records;
              }
            }

            // Handle account queries
            if (model === "account" && where && where.length > 0) {
              const userIdWhere = where.find(
                (w: { field: string; value: unknown }) => w.field === "userId",
              );
              if (userIdWhere) {
                const result = await callConvex(model, "findByUserId", {
                  userId: userIdWhere.value,
                });
                let records = Array.isArray(result) ? result : [];

                // Apply limit and offset if provided
                if (offset) records = records.slice(offset);
                if (limit) records = records.slice(0, limit);

                return records;
              }
            }

            // For other cases, return empty array (Better Auth typically doesn't need these)
            if (config.debugLogs) {
              console.log(
                `[ConvexAdapter] findMany called for ${model} with unsupported where clause:`,
                where,
              );
            }
            return [];
          } catch (error) {
            console.error("[ConvexAdapter] findMany error:", error);
            return [];
          }
        },

        count: async ({ model, where }) => {
          try {
            // Better Auth rarely uses count, but we can implement basic support
            // by using findMany and counting the results
            if (!where || where.length === 0) {
              console.warn(
                "[ConvexAdapter] count without where clause not supported",
              );
              return 0;
            }

            // For session model
            if (model === "session") {
              const userIdWhere = where.find(
                (w: { field: string; value: unknown }) => w.field === "userId",
              );
              if (userIdWhere) {
                const result = await callConvex(model, "findByUserId", {
                  userId: userIdWhere.value,
                });
                return Array.isArray(result) ? result.length : 0;
              }
            }

            // For account model
            if (model === "account") {
              const userIdWhere = where.find(
                (w: { field: string; value: unknown }) => w.field === "userId",
              );
              if (userIdWhere) {
                const result = await callConvex(model, "findByUserId", {
                  userId: userIdWhere.value,
                });
                return Array.isArray(result) ? result.length : 0;
              }
            }

            if (config.debugLogs) {
              console.log(
                `[ConvexAdapter] count called for ${model} with unsupported where clause:`,
                where,
              );
            }
            return 0;
          } catch (error) {
            console.error("[ConvexAdapter] count error:", error);
            return 0;
          }
        },

        options: config,
      };
    },
  });
};

export default convexAdapter;
