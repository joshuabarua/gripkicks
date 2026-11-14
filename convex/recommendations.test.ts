import { expect, it, vi } from "vitest";
import type { QueryCtx } from "./_generated/server";
import { getCommunityTopShoes, getShoeRecommendations } from "./recommendations";
import { aggregateSoleMateRatings, calculateShoeScore, calculateUserPreferenceProfile, preferencesFromProfile } from "./utils/matchScore";
import { toHundredPointScale } from "./utils/scoring";
import { mockQueryCtx } from "./mockDb.testing";

it("keeps sizing signals inside the 10-point community scale without flattening strong ratings", async () => {
  const shoes = [{ _id: "excellent", brand: "Scarpa", name: "Excellent" }, { _id: "good", brand: "Scarpa", name: "Good" }];
  const ratings = shoes.flatMap((shoe) => Array.from({ length: 3 }, () => ({ shoeId: shoe._id, comfortScore: shoe._id === "excellent" ? 10 : 9, performanceRating: shoe._id === "excellent" ? 10 : 9, durabilityRating: shoe._id === "excellent" ? 10 : 9, sizingDeviation: 0 })));
  const ctx = mockQueryCtx({ shoes, userShoes: ratings });
  const handler = (getCommunityTopShoes as unknown as { _handler: (ctx: QueryCtx, args: { limit: number }) => Promise<Array<{ compositeScore: number }>> })._handler;
  const scores = await handler(ctx, { limit: 10 });
  expect(scores[0]?.compositeScore).toBe(10);
  expect(scores[1]?.compositeScore).toBeLessThan(10);
  expect(scores[0]!.compositeScore).toBeGreaterThan(scores[1]!.compositeScore);
});

vi.mock("./authorization", () => ({ requireUserAccess: async () => ({}) }));

it("scores recommendations with the same model as the client Matcher", async () => {
  const users = [
    { _id: "me", footShape: "egyptian", footVolume: "medium" },
    { _id: "mate", footShape: "egyptian", footVolume: "medium" },
    { _id: "other", footShape: "greek", footVolume: "high" },
  ];
  const shoes = [
    { _id: "fits", brand: "Scarpa", name: "Fits", volume: "medium", aggressiveness: "moderate", climbingDiscipline: "sport" },
    { _id: "misses", brand: "Tenaya", name: "Misses", volume: "high", aggressiveness: "aggressive", climbingDiscipline: "bouldering" },
  ];
  const rate = (userId: string, shoeId: string, score: number) => ({ userId, shoeId, comfortScore: score, performanceRating: score, durabilityRating: score, sizingDeviation: 0 });
  const userShoes = [rate("me", "fits", 8), rate("mate", "fits", 9), rate("other", "fits", 6), rate("mate", "misses", 5), rate("other", "misses", 9), rate("me", "misses", 4)];
  const footShapeCompat = [{ shoeId: "fits", footShape: "egyptian" }];
  const ctx = mockQueryCtx({ users, shoes, userShoes, footShapeCompat });

  const handler = (getShoeRecommendations as unknown as { _handler: (ctx: QueryCtx, args: Record<string, unknown>) => Promise<{ items: Array<{ _id: string; matchScore: number }> }> })._handler;
  const { items } = await handler(ctx, { userId: "me", footShape: "egyptian", footVolume: "medium" });

  const profile = calculateUserPreferenceProfile(userShoes.filter((row) => row.userId === "me").map((row) => ({ ...row, shoe: shoes.find((shoe) => shoe._id === row.shoeId) })) as never);
  const soleMates = new Map(aggregateSoleMateRatings(userShoes.filter((row) => row.userId !== "other") as never).map((row) => [row.shoeId, row]));
  const popularity = shoes.map((shoe) => ({ shoeId: shoe._id, count: 3 }));
  const expected = shoes.map((shoe) => {
    const compat = footShapeCompat.filter((row) => row.shoeId === shoe._id).map((row) => row.footShape);
    const { totalScore } = calculateShoeScore({ ...shoe, footShapeCompat: compat } as never, { shape: "egyptian", volume: "medium" }, preferencesFromProfile(profile), popularity, profile, soleMates);
    return { _id: shoe._id, matchScore: toHundredPointScale(totalScore, 5) };
  });

  expect(items.map(({ _id, matchScore }) => ({ _id, matchScore }))).toEqual(expected);
});
