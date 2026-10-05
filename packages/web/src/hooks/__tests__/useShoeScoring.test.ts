import { describe, expect, it } from "vitest";
import type { Doc } from "convex/_generated/dataModel";
import { calculateShoeScore } from "@/hooks/useShoeScoring";

type Shoe = Doc<"shoes">;

const baseShoe = {
  _id: "shoe-1",
  _creationTime: 1,
  name: "Test Shoe",
  brand: "TestBrand",
  aggressiveness: "moderate",
  stiffness: "medium",
  climbingDiscipline: "sport",
  volume: "medium",
} as unknown as Shoe;

const approvedEnrichment = {
  sourceUrl: "https://example.com",
  sourceName: "test",
  extractedAt: 1,
  confidence: 1,
  reviewStatus: "approved" as const,
};

describe("calculateShoeScore fit signals", () => {
  it("marks missing preferences as unavailable rather than reporting a 50% match", () => {
    const score = calculateShoeScore(baseShoe, { shape: "Roman", volume: "Medium" }, undefined, []);
    expect(score.signals.preferences).toBe(false);
    expect(score.signals.footShape).toBe("unknown");
  });
  it("varies volume compatibility for the catalog's low, medium and high volumes", () => {
    const scores = ["low", "medium", "high"].map((volume) => calculateShoeScore({ ...baseShoe, volume }, { shape: "Roman", volume: "Low" }, undefined, []));
    expect(new Set(scores.map((score) => score.breakdown.volumeCompatibility)).size).toBe(3);
    expect(scores[0]!.breakdown.volumeCompatibility).toBeGreaterThan(scores[2]!.breakdown.volumeCompatibility);
  });

  it.each(["low", "low_volume", "Low Volume"])("normalizes the volume alias %s", (volume) => {
    const score = calculateShoeScore({ ...baseShoe, volume }, { shape: "Roman", volume: "Low" }, undefined, []);
    expect(score.breakdown.volumeCompatibility).toBe(5);
  });

  it("uses recorded foot shape compatibility instead of giving every shoe 50%", () => {
    const compatible = calculateShoeScore({ ...baseShoe, footShapeCompat: ["roman"] }, { shape: "Roman", volume: "Medium" }, undefined, []);
    const incompatible = calculateShoeScore({ ...baseShoe, footShapeCompat: ["egyptian"] }, { shape: "Roman", volume: "Medium" }, undefined, []);
    expect(compatible.breakdown.footTypeCompatibility).toBeGreaterThan(incompatible.breakdown.footTypeCompatibility);
  });
});

describe("calculateShoeScore scale consistency", () => {
  it("keeps learned bonuses inside the 5-point personal score scale", () => {
    const shoe = { ...baseShoe, footShapeCompat: ["roman" as const], avgComfortScore: 10, avgPerformanceRating: 10, avgDurabilityRating: 10 };
    const score = calculateShoeScore(shoe, { shape: "Roman", volume: "Medium" }, { comfort: 5, performance: 5, durability: 5 }, [{ shoeId: "shoe-1", count: 20 }], { preferredBrands: ["TestBrand"], preferredVolumes: ["medium"], preferredDisciplines: ["sport"], confidence: 1, sampleSize: 10, aggressiveness: 3 });
    expect(score.totalScore).toBeLessThanOrEqual(5);
  });
  it("scores a rated shoe and an identical catalog-baseline shoe at comparable magnitude", () => {
    const ratedShoe = {
      ...baseShoe,
      _id: "rated",
      avgComfortScore: 8,
      avgPerformanceRating: 8,
      avgDurabilityRating: 8,
    } as unknown as Shoe;

    const baselineShoe = {
      ...baseShoe,
      _id: "baseline",
      defaultScores: { comfort: 8, performance: 8, durability: 8 },
      enrichment: approvedEnrichment,
    } as unknown as Shoe;

    const rated = calculateShoeScore(
      ratedShoe,
      null,
      undefined,
      [{ shoeId: "rated", count: 5 }],
    );
    const baseline = calculateShoeScore(baselineShoe, null, undefined, []);

    expect(rated.totalScore).toBeGreaterThan(0);
    expect(baseline.totalScore).toBeGreaterThan(0);
    expect(rated.totalScore / baseline.totalScore).toBeLessThan(1.5);
  });

  it("does not saturate strong community ratings at the 5.0 cap", () => {
    const goodShoe = {
      ...baseShoe,
      _id: "good",
      avgComfortScore: 8,
      avgPerformanceRating: 8,
      avgDurabilityRating: 8,
    } as unknown as Shoe;

    const excellentShoe = {
      ...baseShoe,
      _id: "excellent",
      avgComfortScore: 10,
      avgPerformanceRating: 10,
      avgDurabilityRating: 10,
    } as unknown as Shoe;

    const popularity = [
      { shoeId: "good", count: 5 },
      { shoeId: "excellent", count: 5 },
    ];

    const good = calculateShoeScore(goodShoe, null, undefined, popularity);
    const excellent = calculateShoeScore(excellentShoe, null, undefined, popularity);

    expect(good.breakdown.communityApproval).toBeLessThan(5);
    expect(excellent.breakdown.communityApproval).toBeGreaterThan(
      good.breakdown.communityApproval,
    );
    expect(excellent.totalScore).toBeGreaterThan(good.totalScore);
  });

  it("converts soleMate 1-10 aggregates into the 1-5 pipeline", () => {
    const soleMateMap = new Map([
      [
        "shoe-1",
        {
          shoeId: "shoe-1",
          ownerCount: 4,
          avgComfort: 10,
          avgPerformance: 10,
          avgDurability: 10,
          avgFitLongevityScore: 10,
          avgSizingDeviationScore: 10,
        },
      ],
    ]);

    const ratedShoe = {
      ...baseShoe,
      avgComfortScore: 8,
      avgPerformanceRating: 8,
      avgDurabilityRating: 8,
    } as unknown as Shoe;

    const score = calculateShoeScore(
      ratedShoe,
      { shape: "Roman", volume: "Medium" },
      undefined,
      [{ shoeId: "shoe-1", count: 5 }],
      null,
      soleMateMap,
    );

    expect(score.breakdown.communityApproval).toBeLessThanOrEqual(5);
    expect(score.metrics.durability).toBeLessThanOrEqual(5);
    expect(score.totalScore).toBeLessThanOrEqual(5);
  });
});
