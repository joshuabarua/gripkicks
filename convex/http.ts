import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";

const app: HonoWithConvex<ActionCtx> = new Hono();

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

// Get user profile (requires auth - will be handled by Better Auth middleware)
app.get("/api/v1/profile", async (c) => {
  // TODO: Get user from Better Auth session
  // For now, return placeholder
  return c.json({ success: false, message: "Auth not configured yet" }, 401);
});

// Update user profile
app.put("/api/v1/profile", async (c) => {
  // TODO: Get user from Better Auth session
  return c.json({ success: false, message: "Auth not configured yet" }, 401);
});

// Complete onboarding
app.post("/api/v1/onboarding", async (c) => {
  // TODO: Get user from Better Auth session
  return c.json({ success: false, message: "Auth not configured yet" }, 401);
});

// ============ STASH API ============

// Get user's stash
app.get("/api/v1/stash", async (c) => {
  // TODO: Get user from Better Auth session
  return c.json({ success: false, message: "Auth not configured yet" }, 401);
});

// Add to stash
app.post("/api/v1/stash", async (c) => {
  // TODO: Get user from Better Auth session
  return c.json({ success: false, message: "Auth not configured yet" }, 401);
});

// Remove from stash
app.delete("/api/v1/stash/:shoeId", async (c) => {
  // TODO: Get user from Better Auth session
  return c.json({ success: false, message: "Auth not configured yet" }, 401);
});

export default new HttpRouterWithHono(app);
