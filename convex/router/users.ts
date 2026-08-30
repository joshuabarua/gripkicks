import type { HonoWithConvex } from "convex-helpers/server/hono";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  HttpContext,
  findUserByBetterAuthId,
  handleError,
  handleValidationError,
  requireServiceToken,
  withUserIdValidation,
} from "./helpers";

async function syncUserHandler(
  c: HttpContext,
  successMessage: string,
  runSync: () => Promise<unknown>,
) {
  try {
    const userId = await runSync();

    return c.json({
      success: true,
      message: successMessage,
      convexUserId: userId,
    });
  } catch (error) {
    console.error("Convex: Error syncing user:", error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        success: false,
        error: "Failed to sync user to Convex",
        details: message,
      },
      500,
    );
  }
}

export function registerUserRoutes(app: HonoWithConvex<ActionCtx>) {
  app.use("/api/sync-user", requireServiceToken);
  app.use("/api/sync-user-deduplicated", requireServiceToken);
  app.use("/api/users/*", requireServiceToken);

  app.post("/api/sync-user", async (c) => {
    const { id, email, name, image, emailVerified } = await c.req.json();
    return syncUserHandler(c, "User synced to Convex successfully", () =>
      c.env.runMutation(internal.users.createOrUpdateFromBetterAuth, {
        betterAuthId: id,
        email,
        name: name || "",
        image: image || "",
        emailVerified: emailVerified || false,
      }),
    );
  });

  app.post("/api/sync-user-deduplicated", async (c) => {
    const { betterAuthId, email, name, image, emailVerified } =
      await c.req.json();
    return syncUserHandler(
      c,
      "User synced to Convex successfully (deduplicated)",
      () =>
        c.env.runMutation(internal.users.syncUserDeduplicated, {
          betterAuthId,
          email,
          name: name || "",
          image: image || "",
          emailVerified: emailVerified || false,
        }),
    );
  });

  app.post("/api/users/list", async (c) => {
    const users = await c.env.runQuery(internal.users.serviceList, {});
    return c.json({ success: true, data: users });
  });

  app.post("/api/users/findByBetterAuthId", async (c) => {
    try {
      const { betterAuthId } = await c.req.json();

      if (!betterAuthId) {
        return handleValidationError(c, "Better Auth ID");
      }

      const user = await findUserByBetterAuthId(c, betterAuthId);

      return c.json({ success: true, data: user });
    } catch (error) {
      return handleError(c, error, "finding user by Better Auth ID");
    }
  });

  app.post("/api/users/findByEmail", async (c) => {
    try {
      const { email } = await c.req.json();

      if (!email) {
        return handleValidationError(c, "Email");
      }

      const user = await c.env.runQuery(internal.users.serviceGetByEmail, { email });

      return c.json({ success: true, data: user });
    } catch (error) {
      return handleError(c, error, "finding user by email");
    }
  });

  app.post("/api/users/update", async (c) => {
    const { id, name, image, emailVerified, footShape, footVolume, favoriteShoeId } =
      await c.req.json();
    return withUserIdValidation(c, id, async (user) => {
      return await c.env.runMutation(internal.users.serviceUpdate, {
        id: user._id,
        ...(name !== undefined ? { name } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(emailVerified !== undefined ? { emailVerified } : {}),
        ...(footShape !== undefined ? { footShape } : {}),
        ...(footVolume !== undefined ? { footVolume } : {}),
        ...(favoriteShoeId !== undefined
          ? {
              favoriteShoeId:
                favoriteShoeId === null
                  ? null
                  : (favoriteShoeId as Id<"shoes">),
            }
          : {}),
      });
    });
  });

  app.post("/api/users/completeOnboarding", async (c) => {
    const { userId, footShape, favoriteShoeId } = await c.req.json();
    return withUserIdValidation(c, userId, async (user) => {
      return await c.env.runMutation(internal.users.serviceCompleteOnboarding, {
        userId: user._id,
        ...(footShape !== undefined ? { footShape } : {}),
        ...(favoriteShoeId !== undefined
          ? { favoriteShoeId: favoriteShoeId as Id<"shoes"> }
          : {}),
      });
    });
  });

  app.post("/api/users/delete", async (c) => {
    const { id } = await c.req.json();
    return withUserIdValidation(c, id, async (user) => {
      await c.env.runMutation(internal.authDb.deleteUser, { id: user._id });
      return { message: "User deleted successfully" };
    });
  });

  app.get("/api/v1/profile", async (c) => {
    return c.json(
      { success: false, message: "Use backend-api for profile endpoints" },
      301,
    );
  });

  app.put("/api/v1/profile", async (c) => {
    return c.json(
      { success: false, message: "Use backend-api for profile endpoints" },
      301,
    );
  });

  app.post("/api/v1/onboarding", async (c) => {
    return c.json(
      { success: false, message: "Use backend-api for onboarding endpoints" },
      301,
    );
  });
}
