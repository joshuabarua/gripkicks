import { expect, it, vi } from "vitest";
import type { QueryCtx } from "./_generated/server";
import { list } from "./shoes";

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
