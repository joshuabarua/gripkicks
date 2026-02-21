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
import { createRateLimit, errorHandler, notFound } from "../middleware";
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

const parseIntEnv = (value: string | undefined, fallback: number) => {
  const parsed = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const apiLimiter = createRateLimit({
  keyPrefix: "api",
  windowMs: parseIntEnv(process.env.RATE_LIMIT_API_WINDOW_MS, 60_000),
  max: parseIntEnv(process.env.RATE_LIMIT_API_MAX, 120),
});

const authLimiter = createRateLimit({
  keyPrefix: "auth",
  windowMs: parseIntEnv(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 60_000),
  max: parseIntEnv(process.env.RATE_LIMIT_AUTH_MAX, 30),
});

const accountMutationLimiter = createRateLimit({
  keyPrefix: "account-mutation",
  windowMs: parseIntEnv(process.env.RATE_LIMIT_ACCOUNT_WINDOW_MS, 60_000),
  max: parseIntEnv(process.env.RATE_LIMIT_ACCOUNT_MAX, 10),
});

const checkoutLimiter = createRateLimit({
  keyPrefix: "checkout",
  windowMs: parseIntEnv(process.env.RATE_LIMIT_CHECKOUT_WINDOW_MS, 60_000),
  max: parseIntEnv(process.env.RATE_LIMIT_CHECKOUT_MAX, 12),
});

const imageUploadLimiter = createRateLimit({
  keyPrefix: "upload",
  windowMs: parseIntEnv(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS, 60_000),
  max: parseIntEnv(process.env.RATE_LIMIT_UPLOAD_MAX, 20),
});

app.use(`${API_BASE}/*`, apiLimiter);
app.use("/api/auth/*", authLimiter);
app.use(`${API_BASE}/auth/change-email`, accountMutationLimiter);
app.use(`${API_BASE}/auth/change-password`, accountMutationLimiter);
app.use(`${API_BASE}/auth/delete-account`, accountMutationLimiter);
app.use(`${API_BASE}/polar/checkout`, checkoutLimiter);
app.use("/api/upload", imageUploadLimiter);
app.use("/api/imagekit", imageUploadLimiter);

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
  try {
    return await auth.handler(c.req.raw);
  } catch (error) {
    console.error("[auth] Unhandled auth route error", error);
    return c.json(
      {
        error: "Authentication provider error",
      },
      500,
    );
  }
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
