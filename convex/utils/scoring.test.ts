import { describe, expect, it } from "vitest";
import {
  aggressivenessToScore,
  disciplineToVersatility,
  fitLongevityToScore,
  sizingDeviationToScore,
  toFivePointScale,
} from "./scoring";

describe("fitLongevityToScore", () => {
  it("maps longevity labels to the 1-10 scale", () => {
    expect(fitLongevityToScore("6+ months")).toBe(10);
    expect(fitLongevityToScore("3-6 months")).toBe(7);
    expect(fitLongevityToScore("1-3 months")).toBe(4);
  });

  it("returns null for missing or unknown labels", () => {
    expect(fitLongevityToScore(undefined)).toBeNull();
    expect(fitLongevityToScore("unknown")).toBeNull();
  });
});

describe("sizingDeviationToScore", () => {
  it("maps deviation to the 1-10 scale", () => {
    expect(sizingDeviationToScore(0)).toBe(10);
    expect(sizingDeviationToScore(0.5)).toBe(8);
    expect(sizingDeviationToScore(-0.5)).toBe(8);
    expect(sizingDeviationToScore(1)).toBe(6);
  });

  it("floors at 2 for extreme deviation", () => {
    expect(sizingDeviationToScore(3)).toBe(2);
    expect(sizingDeviationToScore(-4)).toBe(2);
  });

  it("returns null when undefined", () => {
    expect(sizingDeviationToScore(undefined)).toBeNull();
  });
});

describe("aggressivenessToScore", () => {
  it("maps the enum values to 1-5", () => {
    expect(aggressivenessToScore("aggressive", 3)).toBe(5);
    expect(aggressivenessToScore("moderate", 3)).toBe(3);
    expect(aggressivenessToScore("flat", 3)).toBe(1);
  });

  it("uses the caller-provided fallback for unknown or missing values", () => {
    expect(aggressivenessToScore(undefined, 3)).toBe(3);
    expect(aggressivenessToScore(undefined, 2.5)).toBe(2.5);
    expect(aggressivenessToScore("unknown", 2.5)).toBe(2.5);
  });
});

describe("disciplineToVersatility", () => {
  it("maps the enum values to 1-5", () => {
    expect(disciplineToVersatility("trad", 3)).toBe(4);
    expect(disciplineToVersatility("sport", 3)).toBe(3);
    expect(disciplineToVersatility("bouldering", 3)).toBe(3);
    expect(disciplineToVersatility("gym", 3)).toBe(2);
    expect(disciplineToVersatility("competition", 3)).toBe(2);
  });

  it("uses the caller-provided fallback for unknown or missing values", () => {
    expect(disciplineToVersatility(undefined, 3)).toBe(3);
    expect(disciplineToVersatility("unknown", 2.5)).toBe(2.5);
  });
});

describe("toFivePointScale", () => {
  it("halves a 1-10 value", () => {
    expect(toFivePointScale(10)).toBe(5);
    expect(toFivePointScale(7)).toBe(3.5);
    expect(toFivePointScale(2)).toBe(1);
  });
});
