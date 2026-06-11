import type { HonoWithConvex } from "convex-helpers/server/hono";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  handleError,
  withIdValidation,
  withUserAndShoeValidation,
  withUserValidation,
} from "./helpers";

export function registerStashRoutes(app: HonoWithConvex<ActionCtx>) {
  app.get("/api/v1/stash", async (c) => {
    return c.json(
      { success: false, message: "Use backend-api for stash endpoints" },
      301,
    );
  });

  app.post("/api/v1/stash", async (c) => {
    return c.json(
      { success: false, message: "Use backend-api for stash endpoints" },
      301,
    );
  });

  app.delete("/api/v1/stash/:shoeId", async (c) => {
    return c.json(
      { success: false, message: "Use backend-api for stash endpoints" },
      301,
    );
  });

  app.post("/api/stash/getUserStash", async (c) => {
    const { betterAuthId } = await c.req.json();
    return withUserValidation(c, betterAuthId, async (user) => {
      return await c.env.runQuery(api.stash.getUserStash, {
        userId: user._id,
      });
    });
  });

  app.post("/api/stash/addToStash", async (c) => {
    const { betterAuthId, shoeId } = await c.req.json();
    return withUserAndShoeValidation(c, betterAuthId, shoeId, async (user, validShoeId) => {
      const userShoeId = await c.env.runMutation(api.stash.addToStash, {
        userId: user._id,
        shoeId: validShoeId,
      });
      return { userShoeId };
    });
  });

  app.post("/api/stash/removeFromStash", async (c) => {
    const { betterAuthId, shoeId } = await c.req.json();
    return withUserAndShoeValidation(c, betterAuthId, shoeId, async (user, validShoeId) => {
      const removed = await c.env.runMutation(api.stash.removeFromStash, {
        userId: user._id,
        shoeId: validShoeId,
      });
      return { removed };
    });
  });

  app.post("/api/stash/updateUserShoeStats", async (c) => {
    const {
      userShoeId,
      size,
      purchaseDate,
      condition,
      notes,
      comfortScore,
      performanceRating,
      durabilityRating,
    } = await c.req.json();
    return withIdValidation<Id<"userShoes">>(
      c,
      userShoeId,
      "User shoe ID",
      async (validUserShoeId) => {
        return await c.env.runMutation(api.stash.updateUserShoeStats, {
          userShoeId: validUserShoeId,
          size,
          purchaseDate,
          condition,
          notes,
          comfortScore,
          performanceRating,
          durabilityRating,
        });
      },
    );
  });

  app.post("/api/stash/toggleFavourite", async (c) => {
    const { userShoeId } = await c.req.json();
    return withIdValidation<Id<"userShoes">>(
      c,
      userShoeId,
      "User shoe ID",
      async (validUserShoeId) => {
        return await c.env.runMutation(api.stash.toggleFavourite, {
          userShoeId: validUserShoeId,
        });
      },
    );
  });

  app.post("/api/stash/verifyOwnership", async (c) => {
    const { userShoeId, betterAuthUserId } = await c.req.json();
    if (!userShoeId || !betterAuthUserId) {
      return c.json(
        {
          success: false,
          message: "User shoe ID and Better Auth User ID are required",
        },
        400,
      );
    }
    try {
      const ownership = await c.env.runQuery(api.auth.verifyUserShoeOwnership, {
        userShoeId: userShoeId as Id<"userShoes">,
        betterAuthUserId,
      });
      return c.json({ success: true, data: ownership });
    } catch (error) {
      return handleError(c, error, "verifying ownership");
    }
  });

  app.post("/api/stash/deleteUserShoe", async (c) => {
    const { userShoeId } = await c.req.json();
    return withIdValidation<Id<"userShoes">>(
      c,
      userShoeId,
      "User shoe ID",
      async (validUserShoeId) => {
        await c.env.runMutation(api.stash.deleteUserShoe, {
          userShoeId: validUserShoeId,
        });
        return { deleted: true };
      },
    );
  });
}
