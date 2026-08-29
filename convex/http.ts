import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { registerUserRoutes } from "./router/users";
import { registerShoeRoutes } from "./router/shoes";
import { registerStashRoutes } from "./router/stash";
import { registerAuthDbRoutes } from "./router/authDb";

const app: HonoWithConvex<ActionCtx> = new Hono();

app.use("/*", cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "https://grip-kicks.com",
    "https://www.grip-kicks.com",
  ],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  exposeHeaders: ["Content-Length", "Set-Better-Auth-Cookie"],
  maxAge: 600,
}));

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

registerUserRoutes(app);
registerShoeRoutes(app);
registerStashRoutes(app);
registerAuthDbRoutes(app);

export default new HttpRouterWithHono(app);
