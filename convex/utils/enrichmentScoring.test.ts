import { describe, expect, it } from "vitest";
import { calculateEnrichmentScores } from "./enrichmentScoring";

describe("calculateEnrichmentScores", () => {
  describe.each(["climbingDiscipline", "stiffness"] as const)("%s", (trait) => {
    it.each(["constructor", "__proto__"])("ignores inherited key %s", (value) => {
      const shoe = {
        aggressiveness: "moderate",
        stiffness: "medium",
        climbingDiscipline: "sport",
      };
      const expected = calculateEnrichmentScores({ ...shoe, [trait]: "unknown" });

      expect(calculateEnrichmentScores({ ...shoe, [trait]: value })).toEqual(expected);
    });
  });

  it("returns balanced scores for a moderate sport shoe", () => {
    expect(
      calculateEnrichmentScores(
        {
          aggressiveness: "moderate",
          stiffness: "medium",
          climbingDiscipline: "sport",
        },
        {},
      ),
    ).toEqual({
      comfort: 6,
      performance: 7,
      durability: 4.5,
      sensitivity: 4.5,
      edging: 5.6,
      smearing: 4.3,
      toeHooking: 5.5,
      heelHooking: 6.3,
    });
  });

  it("boosts performance for aggressive competition shoes", () => {
    expect(
      calculateEnrichmentScores(
        {
          aggressiveness: "aggressive",
          stiffness: "soft",
          climbingDiscipline: "competition",
        },
        { sole: "3.5mm" },
      ),
    ).toEqual({
      comfort: 4,
      performance: 9.5,
      durability: 5,
      sensitivity: 6.1,
      edging: 4.8,
      smearing: 4.9,
      toeHooking: 8.8,
      heelHooking: 9.2,
    });
  });

  it("rewards stiff flat shoes for trad durability and edging", () => {
    expect(
      calculateEnrichmentScores(
        {
          aggressiveness: "flat",
          stiffness: "stiff",
          climbingDiscipline: "trad",
        },
        { sole: "5mm" },
      ),
    ).toEqual({
      comfort: 7.5,
      performance: 5.5,
      durability: 7,
      sensitivity: 3,
      edging: 6.5,
      smearing: 3.8,
      toeHooking: 3.3,
      heelHooking: 3.7,
    });
  });

  it("reduces durability and raises sensitivity for thin soles", () => {
    expect(
      calculateEnrichmentScores(
        {
          aggressiveness: "moderate",
          stiffness: "medium",
          climbingDiscipline: "sport",
        },
        { sole: "3mm" },
      ),
    ).toEqual({
      comfort: 6,
      performance: 7,
      durability: 4,
      sensitivity: 5.8,
      edging: 5.6,
      smearing: 4.3,
      toeHooking: 5.5,
      heelHooking: 6.3,
    });
  });

  it("is case-insensitive and parses sole thickness embedded in text", () => {
    expect(
      calculateEnrichmentScores(
        {
          aggressiveness: "Aggressive",
          stiffness: "STIFF",
          climbingDiscipline: "BOULDERING",
        },
        { sole: "XS 4mm" },
      ),
    ).toEqual({
      comfort: 4,
      performance: 9.5,
      durability: 5.5,
      sensitivity: 4.4,
      edging: 8.3,
      smearing: 1.6,
      toeHooking: 7.8,
      heelHooking: 9.2,
    });
  });

  it("derives sensitivity from stiffness when no sole thickness is present", () => {
    const soft = calculateEnrichmentScores(
      { aggressiveness: "moderate", stiffness: "soft", climbingDiscipline: "gym" },
      { sole: "vibram xs grip" },
    );
    const stiff = calculateEnrichmentScores(
      { aggressiveness: "moderate", stiffness: "stiff", climbingDiscipline: "gym" },
      {},
    );
    expect(soft.sensitivity).toBe(7);
    expect(stiff.sensitivity).toBe(2);
  });

  it("clamps scores to the 1-10 range", () => {
    const scores = calculateEnrichmentScores(
      {
        aggressiveness: "aggressive",
        stiffness: "stiff",
        climbingDiscipline: "competition",
      },
      { sole: "4.5mm" },
    );
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
    expect(scores.performance).toBe(10);
  });
});
