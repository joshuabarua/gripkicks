import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(__dirname, "../../../.env"),
  resolve(__dirname, "../../.env"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

import { showRoutes } from "hono/dev";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { errorHandler, notFound } from "../middleware";
import { auth } from "../config/auth.config";
import Users from "../routes/users.routes";
import AuthSync from "../routes/authSync.routes";
import AuthRoutes from "../routes/auth.routes";
import ImageKitRoute from "../routes/imagekit";
import PolarRoutes from "../routes/polar.routes";
import createApp from "../lib/create-app";
import { Context } from "hono";
import { getAllowedOrigins } from "../config/cors-origins";

// Initialize app with middleware
const app = createApp();

// Set API base path
const API_BASE = process.env.API_BASE || "/api/v1";

// Add CORS middleware for Better Auth routes
app.use(
  "/api/auth/*",
  cors({
    origin: getAllowedOrigins(),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Health check endpoint
app.get("/health", (c: Context) => {
  return c.json({
    status: "ok",
    uptime: Math.floor(process.uptime() * 1000), // Convert to milliseconds
    message: "Welcome to the API!",
  });
});

// Better Auth health check endpoint
app.get("/api/auth/healthz", (c: Context) => {
  return c.json({
    status: "ok",
    service: "better-auth",
    message: "Better Auth is running",
  });
});

// Better Auth handler - handles all auth routes at /api/auth/*
app.on(["GET", "POST"], "/api/auth/*", async (c: Context) => {
  return auth.handler(c.req.raw);
});

// Register API routes with base path
app.route(API_BASE, Users);
app.route(`${API_BASE}/auth`, AuthRoutes);
app.route(API_BASE, AuthSync);
app.route("/api", ImageKitRoute);
app.route(`${API_BASE}/polar`, PolarRoutes);

// Error handling
app.onError(errorHandler);
app.notFound(notFound);

// Start server if not in test environment
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : process.env.BACKEND_PORT
      ? parseInt(process.env.BACKEND_PORT, 10)
      : 3001;
  const hostname = process.env.HOST || "0.0.0.0";

  // Show all routes
  console.log("Registered routes:");
  console.log(showRoutes(app));

  // Start Node.js server using @hono/node-server
  serve(
    {
      fetch: app.fetch,
      port,
      hostname,
    },
    (info) => {
      console.log(`Server started on http://${info.address}:${info.port}`);
      console.log(`API base URL: ${API_BASE}`);
      console.log("Auth: Better Auth enabled");
    },
  );
}

// Export app type for Hono RPC client
export type AppType = typeof app;

export default app;
