import { describe, expect, it } from "vitest";
import { calculateDefaultStats, getEffectiveShoeStats } from "@/components/ShoeStatsModal/utils";

describe("getEffectiveShoeStats", () => {
  it.each(["constructor", "__proto__"])(
    "keeps fallback ratings finite for inherited trait key %s",
    (value) => {
      const stats = getEffectiveShoeStats({
        aggressiveness: "moderate",
        climbingDiscipline: value,
        stiffness: value,
      });

      expect(stats).toEqual({
        comfort: 6,
        performance: 6,
        durability: 5,
        average: 5.7,
      });
    },
  );

  it("uses calculated defaults when user stats are missing", () => {
    const defaults = calculateDefaultStats({
      aggressiveness: "Aggressive",
      climbingDiscipline: "Sport",
      stiffness: "Stiff",
    });

    const result = getEffectiveShoeStats({
      aggressiveness: "Aggressive",
      climbingDiscipline: "Sport",
      stiffness: "Stiff",
    });

    expect(result.comfort).toBe(defaults.comfort);
    expect(result.performance).toBe(defaults.performance);
    expect(result.durability).toBe(defaults.durability);
    expect(result.average).toBe(Number(((defaults.comfort + defaults.performance + defaults.durability) / 3).toFixed(1)));
  });

  it("preserves default values for fields the user has not rated", () => {
    const result = getEffectiveShoeStats(
      {
        aggressiveness: "Neutral",
        climbingDiscipline: "Trad",
        stiffness: "Soft",
      },
      {
        comfortScore: 9,
      },
    );

    expect(result.comfort).toBe(9);
    expect(result.performance).toBe(4);
    expect(result.durability).toBe(6);
    expect(result.average).toBe(6.3);
  });

  it("calculates catalog defaults from normalized lowercase values", () => {
    expect(calculateDefaultStats({
      aggressiveness: "aggressive",
      climbingDiscipline: "competition",
      stiffness: "soft",
    })).toEqual({
      comfort: 4,
      performance: 9.5,
      durability: 5,
    });
  });

  it("uses all user-provided ratings when available", () => {
    const result = getEffectiveShoeStats(
      {
        aggressiveness: "Aggressive",
        climbingDiscipline: "Competition",
        stiffness: "Stiff",
      },
      {
        comfortScore: 6,
        performanceRating: 9,
        durabilityRating: 7,
      },
    );

    expect(result).toEqual({
      comfort: 6,
      performance: 9,
      durability: 7,
      average: 7.3,
    });
  });

  it("treats zero-like explicit values as valid overrides via nullish coalescing", () => {
    const result = getEffectiveShoeStats(
      {
        aggressiveness: "Moderate",
        climbingDiscipline: "All-Around",
        stiffness: "Soft",
      },
      {
        comfortScore: 0,
        performanceRating: 0,
        durabilityRating: 0,
      },
    );

    expect(result).toEqual({
      comfort: 0,
      performance: 0,
      durability: 0,
      average: 0,
    });
  });
});
