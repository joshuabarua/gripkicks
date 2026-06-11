import type { HonoWithConvex } from "convex-helpers/server/hono";
import type { ActionCtx } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { handleError } from "./helpers";

export function registerShoeRoutes(app: HonoWithConvex<ActionCtx>) {
  app.get("/api/v1/shoes", async (c) => {
    const shoes = await c.env.runQuery(api.shoes.list, {});
    return c.json({ success: true, data: shoes });
  });

  app.get("/api/v1/shoes/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const shoe = await c.env.runQuery(api.shoes.getById, {
        id: id as Id<"shoes">,
      });
      if (!shoe) {
        return c.json({ success: false, message: "Shoe not found" }, 404);
      }
      return c.json({ success: true, data: shoe });
    } catch {
      return c.json({ success: false, message: "Invalid shoe ID" }, 400);
    }
  });

  app.get("/api/v1/shoes/brand/:brand", async (c) => {
    const brand = c.req.param("brand");
    const shoes = await c.env.runQuery(api.shoes.getByBrand, { brand });
    return c.json({ success: true, data: shoes });
  });

  app.get("/api/v1/shoes/search/:term", async (c) => {
    const term = c.req.param("term");
    const shoes = await c.env.runQuery(api.shoes.search, { searchTerm: term });
    return c.json({ success: true, data: shoes });
  });

  app.post("/api/shoes/deleteByName", async (c) => {
    const { name, brand } = await c.req.json();
    if (!name || !brand) {
      return c.json(
        { success: false, message: "Name and brand are required" },
        400,
      );
    }
    try {
      const result = await c.env.runMutation(api.seed.deleteShoeByName, {
        name,
        brand,
      });
      return c.json(result);
    } catch (error) {
      return handleError(c, error, "deleting shoe");
    }
  });

  app.post("/api/shoes/updateImageUrl", async (c) => {
    const { id, imageUrl } = await c.req.json();
    if (!id || !imageUrl) {
      return c.json(
        { success: false, message: "ID and imageUrl are required" },
        400,
      );
    }
    try {
      const updated = await c.env.runMutation(api.seed.updateShoeImageUrl, {
        id: id as Id<"shoes">,
        imageUrl,
      });
      return c.json({ success: true, data: updated });
    } catch (error) {
      return handleError(c, error, "updating shoe image URL");
    }
  });
}
