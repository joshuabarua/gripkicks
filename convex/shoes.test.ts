import { describe, expect, it, vi } from "vitest";
import type { QueryCtx } from "./_generated/server";
import { fitShowcase, list } from "./shoes";

it("includes stored foot compatibility in the paginated catalog consumed by Matcher", async () => {
  const page = [{ _id: "shoe-1", brand: "Boreal", name: "Ace", volume: "medium" }, { _id: "shoe-2", brand: "Scarpa", name: "Origin", volume: "high" }];
  const rows = [{ shoeId: "shoe-1", footShape: "roman" }, { shoeId: "shoe-1", footShape: "egyptian" }];
  const paginate = vi.fn().mockResolvedValue({ page, isDone: true, continueCursor: "" });
  const order = vi.fn().mockReturnValue({ paginate });
  const withIndex = vi.fn().mockReturnValue({ order });
  const collect = vi.fn(async (shoeId: string) => rows.filter((row) => row.shoeId === shoeId));
  const fitIndex = vi.fn((_index, select: (q: { eq: (field: string, value: string) => void }) => unknown) => {
    let shoeId = "";
    select({ eq: (_field, value) => { shoeId = value; } });
    return { collect: () => collect(shoeId) };
  });
  const ctx = { db: { query: vi.fn((table) => table === "shoes" ? { withIndex } : { withIndex: fitIndex }), get: vi.fn() } } as unknown as QueryCtx;
  const handler = (list as unknown as { _handler: (ctx: QueryCtx, args: { paginationOpts: { numItems: number; cursor: null } }) => Promise<{ page: Array<{ footShapeCompat?: string[] }> }> })._handler;
  const result = await handler(ctx, { paginationOpts: { numItems: 100, cursor: null } });
  expect(result.page[0]?.footShapeCompat).toEqual(["roman", "egyptian"]);
  expect(result.page[1]?.footShapeCompat).toEqual([]);
  expect(collect.mock.calls.map(([shoeId]) => shoeId)).toEqual(["shoe-1", "shoe-2"]);
  expect(fitIndex).toHaveBeenCalledWith("by_shoe", expect.any(Function));
});

describe("fitShowcase", () => {
  const shoes: Record<string, Record<string, unknown>> = {
    a: { _id: "a", brand: "Scarpa", name: "Drago", modelName: "Drago", volume: "low_volume", imageUrl: "https://img/a.png", totalRatings: 9 },
    a2: { _id: "a2", brand: "Scarpa", name: "Drago LV", modelName: "Drago", volume: "low", imageUrl: "https://img/a2.png", totalRatings: 4 },
    b: { _id: "b", brand: "La Sportiva", name: "Solution", modelName: "Solution", volume: "medium", imageUrl: "https://img/b.png", totalRatings: 20 },
    c: { _id: "c", brand: "Five Ten", name: "Hiangle", modelName: "Hiangle", volume: "low", totalRatings: 30 },
  };
  const compat = [{ shoeId: "a", footShape: "greek" }, { shoeId: "a2", footShape: "greek" }, { shoeId: "b", footShape: "greek" }, { shoeId: "c", footShape: "greek" }, { shoeId: "b", footShape: "roman" }];

  function makeCtx() {
    const fitIndex = vi.fn((_index: string, select: (q: { eq: (field: string, value: string) => void }) => unknown) => {
      let shape = "";
      select({ eq: (_field, value) => { shape = value; } });
      return { collect: async () => compat.filter((row) => row.footShape === shape) };
    });
    return {
      db: {
        query: vi.fn((table: string) => table === "shoes" ? { take: async () => Object.values(shoes) } : { withIndex: fitIndex }),
        get: vi.fn(async (id: string) => shoes[id] ?? null),
      },
    } as unknown as QueryCtx;
  }
  type Result = Array<{ _id: string; imageUrl: string }>;
  const handler = (fitShowcase as unknown as { _handler: (ctx: QueryCtx, args: Record<string, unknown>) => Promise<Result> })._handler;

  it("samples shoes with images when nothing is selected, one per model", async () => {
    const result = await handler(makeCtx(), {});
    expect(result.map((shoe) => shoe._id)).toEqual(["b", "a"]);
  });

  it("returns only shoes listed for the foot shape and matching the volume", async () => {
    expect((await handler(makeCtx(), { footShape: "greek" })).map((shoe) => shoe._id)).toEqual(["b", "a"]);
    expect((await handler(makeCtx(), { footShape: "greek", footVolume: "low" })).map((shoe) => shoe._id)).toEqual(["a"]);
    expect((await handler(makeCtx(), { footShape: "roman", footVolume: "low" }))).toEqual([]);
  });

  it("caps the number of shoes", async () => {
    expect(await handler(makeCtx(), { limit: 1 })).toHaveLength(1);
  });
});
