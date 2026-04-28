import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { subscriptionStatusValidator, subscriptionTierValidator } from "./utils/helpers";

const app: HonoWithConvex<ActionCtx> = new Hono();

async function findUserByBetterAuthId(c: any, betterAuthId: string) {
  const user = await c.env.runQuery(api.users.findByBetterAuthId, { betterAuthId });
  return user;
}

async function findUserByIdOrBetterAuthId(c: any, id: string) {
  return (
    (await findUserByBetterAuthId(c, id)) ||
    (await c.env.runQuery(api.users.getById, { id: id as Id<"users"> }))
  );
}

function requireField(value: unknown, fieldName: string) {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

function handleError(c: any, error: unknown, context: string) {
  console.error(`Error ${context}:`, error);
  const message = error instanceof Error ? error.message : String(error);
  return c.json({ success: false, message }, 500);
}

function handleValidationError(c: any, fieldName: string) {
  return c.json({ success: false, message: `${fieldName} is required` }, 400);
}

function handleNotFound(c: any, resourceName: string) {
  return c.json({ success: false, message: `${resourceName} not found` }, 404);
}

// Better Auth routes are handled automatically by the @convex-dev/better-auth component

// CORS middleware
app.use("/*", cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  exposeHeaders: ["Content-Length", "Set-Better-Auth-Cookie"],
  maxAge: 600,

}));

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sync user from Better Auth to Convex
app.post("/api/sync-user", async (c) => {
  try {
    const { id, email, name, image, emailVerified } = await c.req.json();

    console.log('Convex: Syncing user from Better Auth:', { id, email, name, image, emailVerified });

    // Create or update user in Convex
    const userId = await c.env.runMutation(api.users.createOrUpdateFromBetterAuth, {
      betterAuthId: id,
      email,
      name: name || '',
      image: image || '',
      emailVerified: emailVerified || false,
    });

    console.log('Convex: User synced with ID:', userId);

    return c.json({
      success: true,
      message: 'User synced to Convex successfully',
      convexUserId: userId
    });
  } catch (error) {
    console.error('Convex: Error syncing user:', error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json({
      success: false,
      error: 'Failed to sync user to Convex',
      details: message
    }, 500);
  }
});

// Sync user from Better Auth to Convex with deduplication
app.post("/api/sync-user-deduplicated", async (c) => {
  try {
    const { betterAuthId, email, name, image, emailVerified } = await c.req.json();

    console.log('Convex: Deduplicated sync for user:', { betterAuthId, email, name, image, emailVerified });

    // Create or update user in Convex with deduplication
    const userId = await c.env.runMutation(api.users.syncUserDeduplicated, {
      betterAuthId,
      email,
      name: name || '',
      image: image || '',
      emailVerified: emailVerified || false,
    });

    console.log('Convex: User synced with ID:', userId);

    return c.json({
      success: true,
      message: 'User synced to Convex successfully (deduplicated)',
      convexUserId: userId
    });
  } catch (error) {
    console.error('Convex: Error syncing user:', error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json({
      success: false,
      error: 'Failed to sync user to Convex',
      details: message
    }, 500);
  }
});

// ============ SHOES API ============

// Get all shoes
app.get("/api/v1/shoes", async (c) => {
  const shoes = await c.env.runQuery(api.shoes.list, {});
  return c.json({ success: true, data: shoes });
});

// Get shoe by ID
app.get("/api/v1/shoes/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const shoe = await c.env.runQuery(api.shoes.getById, { id: id as Id<"shoes"> });
    if (!shoe) {
      return c.json({ success: false, message: "Shoe not found" }, 404);
    }
    return c.json({ success: true, data: shoe });
  } catch (error) {
    return c.json({ success: false, message: "Invalid shoe ID" }, 400);
  }
});

// Get shoes by brand
app.get("/api/v1/shoes/brand/:brand", async (c) => {
  const brand = c.req.param("brand");
  const shoes = await c.env.runQuery(api.shoes.getByBrand, { brand });
  return c.json({ success: true, data: shoes });
});

// Search shoes
app.get("/api/v1/shoes/search/:term", async (c) => {
  const term = c.req.param("term");
  const shoes = await c.env.runQuery(api.shoes.search, { searchTerm: term });
  return c.json({ success: true, data: shoes });
});

// ============ USERS API ============

// Find user by Better Auth ID
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

// Find user by email (internal, for webhook lookups)
app.post("/api/users/findByEmail", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return handleValidationError(c, "Email");
    }

    const user = await c.env.runQuery(api.users.getByEmail, { email });

    return c.json({ success: true, data: user });
  } catch (error) {
    return handleError(c, error, "finding user by email");
  }
});

// Get user profile (handled by existing backend-api)
app.get("/api/v1/profile", async (c) => {
  return c.json({ success: false, message: "Use backend-api for profile endpoints" }, 301);
});

// Update user profile (handled by existing backend-api)
app.put("/api/v1/profile", async (c) => {
  return c.json({ success: false, message: "Use backend-api for profile endpoints" }, 301);
});

// Complete onboarding (handled by existing backend-api)
app.post("/api/v1/onboarding", async (c) => {
  return c.json({ success: false, message: "Use backend-api for onboarding endpoints" }, 301);
});

// ============ STASH API ============
// Note: Stash endpoints are handled by the existing backend-api with Better Auth
// These are here for reference but should be redirected to backend-api

// Get user's stash (handled by existing backend-api)
app.get("/api/v1/stash", async (c) => {
  return c.json({ success: false, message: "Use backend-api for stash endpoints" }, 301);
});

// Add to stash (handled by existing backend-api)
app.post("/api/v1/stash", async (c) => {
  return c.json({ success: false, message: "Use backend-api for stash endpoints" }, 301);
});

// Remove from stash (handled by existing backend-api)
app.delete("/api/v1/stash/:shoeId", async (c) => {
  return c.json({ success: false, message: "Use backend-api for stash endpoints" }, 301);
});

// ============ STASH INTERNAL API ============
// These endpoints are for internal use by backend-api

// Get user's stash (internal)
app.post("/api/stash/getUserStash", async (c) => {
  try {
    const { betterAuthId } = await c.req.json();

    if (!betterAuthId) {
      return handleValidationError(c, "BetterAuth ID");
    }

    const user = await findUserByBetterAuthId(c, betterAuthId);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const stash = await c.env.runQuery(api.stash.getUserStash, {
      userId: user._id
    });

    return c.json({ success: true, data: stash });
  } catch (error) {
    return handleError(c, error, "getting stash");
  }
});

// Add to stash (internal)
app.post("/api/stash/addToStash", async (c) => {
  try {
    const { betterAuthId, shoeId } = await c.req.json();

    if (!betterAuthId || !shoeId) {
      return c.json({ success: false, message: "BetterAuth ID and Shoe ID are required" }, 400);
    }

    const user = await findUserByBetterAuthId(c, betterAuthId);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const userShoeId = await c.env.runMutation(api.stash.addToStash, {
      userId: user._id,
      shoeId: shoeId as Id<"shoes">
    });

    return c.json({ success: true, data: { userShoeId } });
  } catch (error) {
    return handleError(c, error, "adding to stash");
  }
});

// Remove from stash (internal)
app.post("/api/stash/removeFromStash", async (c) => {
  try {
    const { betterAuthId, shoeId } = await c.req.json();

    if (!betterAuthId || !shoeId) {
      return c.json({ success: false, message: "BetterAuth ID and Shoe ID are required" }, 400);
    }

    const user = await findUserByBetterAuthId(c, betterAuthId);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const removed = await c.env.runMutation(api.stash.removeFromStash, {
      userId: user._id,
      shoeId: shoeId as Id<"shoes">
    });

    return c.json({ success: true, data: { removed } });
  } catch (error) {
    return handleError(c, error, "removing from stash");
  }
});

// Update user profile (internal)
app.post("/api/users/update", async (c) => {
  try {
    const { id, name, image, emailVerified, footShape, footVolume, favoriteShoeId } = await c.req.json();

    if (!id) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }

    const user = await findUserByIdOrBetterAuthId(c, id);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const updatePayload: any = { id: user._id };

    if (name !== undefined) updatePayload.name = name;
    if (image !== undefined) updatePayload.image = image;
    if (emailVerified !== undefined) updatePayload.emailVerified = emailVerified;
    if (footShape !== undefined) updatePayload.footShape = footShape;
    if (footVolume !== undefined) updatePayload.footVolume = footVolume;
    if (favoriteShoeId !== undefined) {
      updatePayload.favoriteShoeId = favoriteShoeId === null ? null : (favoriteShoeId as Id<"shoes">);
    }

    const updated = await c.env.runMutation(api.users.update, updatePayload);

    return c.json({ success: true, data: updated });
  } catch (error) {
    return handleError(c, error, "updating user");
  }
});

// Complete onboarding for a user
app.post("/api/users/completeOnboarding", async (c) => {
  try {
    const { userId, footShape, favoriteShoeId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }

    const user = await findUserByIdOrBetterAuthId(c, userId);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const onboardingPayload: any = { userId: user._id };

    if (footShape !== undefined) onboardingPayload.footShape = footShape;
    if (favoriteShoeId !== undefined) {
      onboardingPayload.favoriteShoeId = favoriteShoeId as Id<"shoes">;
    }

    const updated = await c.env.runMutation(api.users.completeOnboarding, onboardingPayload);

    return c.json({ success: true, data: updated });
  } catch (error) {
    return handleError(c, error, "completing onboarding");
  }
});

// Delete user profile (internal)
app.post("/api/users/delete", async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ success: false, message: "User ID is required" }, 400);
    }

    const user = await findUserByIdOrBetterAuthId(c, id);

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    await c.env.runMutation(api.authDb.deleteUser, {
      id: user._id,
    });

    return c.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return handleError(c, error, "deleting user");
  }
});

// Update user shoe stats (internal)
app.post("/api/stash/updateUserShoeStats", async (c) => {
  try {
    const { userShoeId, size, purchaseDate, condition, notes, comfortScore, performanceRating, durabilityRating } = await c.req.json();

    if (!userShoeId) {
      return c.json({ success: false, message: "User shoe ID is required" }, 400);
    }

    const updated = await c.env.runMutation(api.stash.updateUserShoeStats, {
      userShoeId: userShoeId as Id<"userShoes">,
      size,
      purchaseDate,
      condition,
      notes,
      comfortScore,
      performanceRating,
      durabilityRating
    });

    return c.json({ success: true, data: updated });
  } catch (error) {
    return handleError(c, error, "updating shoe stats");
  }
});

app.post("/api/stash/toggleFavourite", async (c) => {
  try {
    const { userShoeId } = await c.req.json();

    if (!userShoeId) {
      return c.json({ success: false, message: "User shoe ID is required" }, 400);
    }

    const updated = await c.env.runMutation(api.stash.toggleFavourite, {
      userShoeId: userShoeId as Id<"userShoes">
    });

    return c.json({ success: true, data: updated });
  } catch (error) {
    return handleError(c, error, "toggling favourite");
  }
});

// Verify ownership of user shoe
app.post("/api/stash/verifyOwnership", async (c) => {
  try {
    const { userShoeId, betterAuthUserId } = await c.req.json();

    if (!userShoeId || !betterAuthUserId) {
      return c.json({ success: false, message: "User shoe ID and Better Auth User ID are required" }, 400);
    }

    const ownership = await c.env.runQuery(api.auth.verifyUserShoeOwnership, {
      userShoeId: userShoeId as Id<"userShoes">,
      betterAuthUserId
    });

    return c.json({ success: true, data: ownership });
  } catch (error) {
    return handleError(c, error, "verifying ownership");
  }
});

// Delete user shoe (internal)
app.post("/api/stash/deleteUserShoe", async (c) => {
  try {
    const { userShoeId } = await c.req.json();

    if (!userShoeId) {
      return c.json({ success: false, message: "User shoe ID is required" }, 400);
    }

    await c.env.runMutation(api.stash.deleteUserShoe, {
      userShoeId: userShoeId as Id<"userShoes">
    });

    return c.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return handleError(c, error, "deleting user shoe");
  }
});

// Delete shoe by name (admin)
app.post("/api/shoes/deleteByName", async (c) => {
  try {
    const { name, brand } = await c.req.json();

    if (!name || !brand) {
      return c.json({ success: false, message: "Name and brand are required" }, 400);
    }

    const result = await c.env.runMutation(api.seed.deleteShoeByName, { name, brand });

    return c.json(result);
  } catch (error) {
    return handleError(c, error, "deleting shoe");
  }
});

// Update shoe image URL
app.post("/api/shoes/updateImageUrl", async (c) => {
  try {
    const { id, imageUrl } = await c.req.json();

    if (!id || !imageUrl) {
      return c.json({ success: false, message: "ID and imageUrl are required" }, 400);
    }

    // Use the seed's update function directly
    const updated = await c.env.runMutation(api.seed.updateShoeImageUrl, {
      id: id as Id<"shoes">,
      imageUrl
    });

    return c.json({ success: true, data: updated });
  } catch (error) {
    return handleError(c, error, "updating shoe image URL");
  }
});

// ============ SUBSCRIPTIONS API (internal, called by backend-api) ============

// Update subscription status
app.post("/api/subscriptions/update", async (c) => {
  try {
    const { betterAuthId, subscriptionStatus, subscriptionTier, polarCustomerId, polarSubscriptionId, subscriptionExpiresAt } = await c.req.json();

    if (!betterAuthId) {
      return handleValidationError(c, "betterAuthId");
    }

    const user = await c.env.runMutation(api.subscriptions.updateSubscription, {
      betterAuthId,
      subscriptionStatus,
      subscriptionTier,
      polarCustomerId,
      polarSubscriptionId,
      subscriptionExpiresAt,
    });

    return c.json({ success: true, data: user });
  } catch (error) {
    return handleError(c, error, "updating subscription");
  }
});

// Grant founder status
app.post("/api/subscriptions/grantFounder", async (c) => {
  try {
    const { betterAuthId } = await c.req.json();

    if (!betterAuthId) {
      return handleValidationError(c, "betterAuthId");
    }

    const user = await c.env.runMutation(api.subscriptions.grantFounderStatus, {
      betterAuthId,
    });

    return c.json({ success: true, data: user });
  } catch (error) {
    return handleError(c, error, "granting founder status");
  }
});

// Get subscription status
app.post("/api/subscriptions/status", async (c) => {
  try {
    const { betterAuthId } = await c.req.json();

    if (!betterAuthId) {
      return handleValidationError(c, "betterAuthId");
    }

    const status = await c.env.runQuery(api.subscriptions.getSubscriptionStatus, {
      betterAuthId,
    });

    return c.json({ success: true, data: status });
  } catch (error) {
    return handleError(c, error, "getting subscription status");
  }
});

// Get total user count (for founder spots)
app.get("/api/subscriptions/userCount", async (c) => {
  try {
    const count = await c.env.runQuery(api.subscriptions.getUserCount, {});
    return c.json({ success: true, data: { count } });
  } catch (error) {
    return handleError(c, error, "getting user count");
  }
});

// ============ AUTH DATABASE API (for Better Auth adapter) ============

// Generic auth database endpoint - handles all CRUD operations
app.post("/api/auth-db/:model/:operation", async (c) => {
  try {
    const model = c.req.param("model");
    const operation = c.req.param("operation");
    const body = await c.req.json();

    console.log(`Convex AuthDB: ${operation} on ${model}`, body);

    let result: unknown = null;

    // Users
    if (model === "user") {
      if (operation === "create") {
        result = await c.env.runMutation(api.authDb.createUser, body);
      } else if (operation === "update") {
        result = await c.env.runMutation(api.authDb.updateUser, {
          id: body.id as Id<"users">,
          ...body.data,
        });
      } else if (operation === "delete") {
        await c.env.runMutation(api.authDb.deleteUser, { id: body.id as Id<"users"> });
        result = { success: true };
      } else if (operation === "findById") {
        result = await c.env.runQuery(api.authDb.findUserById, { id: body.id as Id<"users"> });
      } else if (operation === "findByEmail") {
        result = await c.env.runQuery(api.authDb.findUserByEmail, { email: body.email });
      }
    }

    // Sessions
    else if (model === "session") {
      if (operation === "create") {
        result = await c.env.runMutation(api.authDb.createSession, {
          ...body,
          userId: body.userId as Id<"users">,
        });
      } else if (operation === "update") {
        result = await c.env.runMutation(api.authDb.updateSession, {
          id: body.id as Id<"sessions">,
          ...body.data,
        });
      } else if (operation === "delete") {
        await c.env.runMutation(api.authDb.deleteSession, { id: body.id as Id<"sessions"> });
        result = { success: true };
      } else if (operation === "deleteByToken") {
        await c.env.runMutation(api.authDb.deleteSessionByToken, { token: body.token });
        result = { success: true };
      } else if (operation === "deleteByUserId") {
        const count = await c.env.runMutation(api.authDb.deleteSessionsByUserId, { userId: body.userId as Id<"users"> });
        result = { success: true, count };
      } else if (operation === "findById") {
        result = await c.env.runQuery(api.authDb.findSessionById, { id: body.id as Id<"sessions"> });
      } else if (operation === "findByToken") {
        result = await c.env.runQuery(api.authDb.findSessionByToken, { token: body.token });
      } else if (operation === "findByUserId") {
        result = await c.env.runQuery(api.authDb.findSessionsByUserId, { userId: body.userId as Id<"users"> });
      }
    }

    // Accounts
    else if (model === "account") {
      if (operation === "create") {
        result = await c.env.runMutation(api.authDb.createAccount, {
          ...body,
          userId: body.userId as Id<"users">,
        });
      } else if (operation === "update") {
        result = await c.env.runMutation(api.authDb.updateAccount, {
          id: body.id as Id<"accounts">,
          ...body.data,
        });
      } else if (operation === "delete") {
        await c.env.runMutation(api.authDb.deleteAccount, { id: body.id as Id<"accounts"> });
        result = { success: true };
      } else if (operation === "findById") {
        result = await c.env.runQuery(api.authDb.findAccountById, { id: body.id as Id<"accounts"> });
      } else if (operation === "findByUserId") {
        result = await c.env.runQuery(api.authDb.findAccountByUserId, { userId: body.userId as Id<"users"> });
      } else if (operation === "findByProviderAccountId") {
        result = await c.env.runQuery(api.authDb.findAccountByProviderAndAccountId, {
          providerId: body.providerId,
          accountId: body.accountId,
        });
      }
    }

    // Verifications
    else if (model === "verification") {
      if (operation === "create") {
        // Convert expiresAt from string to number if needed
        const processedBody = {
          ...body,
          expiresAt: typeof body.expiresAt === 'string' ? new Date(body.expiresAt).getTime() : body.expiresAt
        };

        // Filter out extra fields that aren't in the validator
        const { id, createdAt, updatedAt, ...validFields } = processedBody;
        result = await c.env.runMutation(api.authDb.createVerification, validFields);
      } else if (operation === "update") {
        result = await c.env.runMutation(api.authDb.updateVerification, {
          id: body.id as Id<"verifications">,
          ...body.data,
        });
      } else if (operation === "delete") {
        await c.env.runMutation(api.authDb.deleteVerification, { id: body.id as Id<"verifications"> });
        result = { success: true };
      } else if (operation === "findByIdentifier") {
        result = await c.env.runQuery(api.authDb.findVerificationByIdentifier, { identifier: body.identifier });
      }
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('Convex AuthDB Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return c.json({ success: false, error: message }, 500);
  }
});

export default new HttpRouterWithHono(app);
