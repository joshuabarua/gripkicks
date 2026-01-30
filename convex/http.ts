import { httpRouter } from "convex/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();
const app: HonoWithConvex<ActionCtx> = new Hono();

// Better Auth routes are handled automatically by the @convex-dev/better-auth component

// CORS middleware
app.use("/*", cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
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
    const shoe = await c.env.runQuery(api.shoes.getById, { id: id as any });
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

export default new HttpRouterWithHono(app);
