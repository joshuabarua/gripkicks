import { Hono } from "hono";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { getAllowedOrigins } from "../config/cors-origins";

const createApp = () => {
  const app = new Hono();

  // Middleware
  app.use("*", logger());
  app.use("*", compress());
  app.use(
    "*",
    cors({
      origin: getAllowedOrigins(),
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );

  return app;
};

export default createApp;
