import { expect, it } from "vitest";
import type { QueryCtx } from "./_generated/server";
import { getCommunityTopShoes } from "./recommendations";

it("keeps sizing signals inside the 10-point community scale without flattening strong ratings", async () => {
  const shoes = [{ _id: "excellent", brand: "Scarpa", name: "Excellent" }, { _id: "good", brand: "Scarpa", name: "Good" }];
  const ratings = shoes.flatMap((shoe) => Array.from({ length: 3 }, () => ({ shoeId: shoe._id, comfortScore: shoe._id === "excellent" ? 10 : 9, performanceRating: shoe._id === "excellent" ? 10 : 9, durabilityRating: shoe._id === "excellent" ? 10 : 9, sizingDeviation: 0 })));
  const ctx = { db: { query: (table: string) => ({ collect: async () => table === "shoes" ? shoes : ratings }) } } as unknown as QueryCtx;
  const handler = (getCommunityTopShoes as unknown as { _handler: (ctx: QueryCtx, args: { limit: number }) => Promise<Array<{ compositeScore: number }>> })._handler;
  const scores = await handler(ctx, { limit: 10 });
  expect(scores[0]?.compositeScore).toBe(10);
  expect(scores[1]?.compositeScore).toBeLessThan(10);
  expect(scores[0]!.compositeScore).toBeGreaterThan(scores[1]!.compositeScore);
});
