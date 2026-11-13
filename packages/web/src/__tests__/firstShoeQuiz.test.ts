import { describe, expect, it } from "vitest";
import { rankShoesForQuiz, scoreShoeForQuiz, type QuizAnswers } from "@/utils/firstShoeQuiz";
import type { Shoe } from "@/types/api";

function makeShoe(overrides: Partial<Shoe>): Shoe {
  return {
    _id: overrides.name ?? "shoe",
    name: "Shoe",
    brand: "Brand",
    aggressiveness: "moderate",
    stiffness: "medium",
    climbingDiscipline: "gym",
    volume: "medium",
    ...overrides,
  };
}

const beginner: QuizAnswers = { discipline: "gym", experience: "new", priority: "comfort", volume: "medium" };
const crusher: QuizAnswers = { discipline: "bouldering", experience: "advanced", priority: "performance", volume: "low" };

describe("scoreShoeForQuiz", () => {
  it("scores a flat gym shoe highest for a new comfort-seeking gym climber", () => {
    const flatGym = makeShoe({ name: "Comfy", aggressiveness: "flat", stiffness: "stiff", climbingDiscipline: "gym" });
    const compShoe = makeShoe({ name: "Comp", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "competition" });
    expect(scoreShoeForQuiz(flatGym, beginner).score).toBeGreaterThan(scoreShoeForQuiz(compShoe, beginner).score);
  });

  it("scores an aggressive bouldering shoe highest for an advanced performance boulderer", () => {
    const compShoe = makeShoe({ name: "Comp", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low" });
    const flatGym = makeShoe({ name: "Comfy", aggressiveness: "flat", stiffness: "stiff", climbingDiscipline: "gym" });
    expect(scoreShoeForQuiz(compShoe, crusher).score).toBeGreaterThan(scoreShoeForQuiz(flatGym, crusher).score);
  });

  it("treats gym shoes as all-rounders for outdoor disciplines", () => {
    const gymShoe = makeShoe({ name: "Gym", climbingDiscipline: "gym" });
    const sportClimber: QuizAnswers = { ...beginner, discipline: "sport" };
    const score = scoreShoeForQuiz(gymShoe, sportClimber).score;
    const exact = makeShoe({ name: "Sport", climbingDiscipline: "sport" });
    expect(score).toBeLessThanOrEqual(scoreShoeForQuiz(exact, sportClimber).score);
    expect(score).toBeGreaterThan(50);
  });
});

describe("rankShoesForQuiz", () => {
  it("dedupes variants by model name and keeps the best score", () => {
    const shoes = [
      makeShoe({ _id: "a", name: "Vapor", modelName: "Vapor", variantLabel: "Men's", aggressiveness: "flat", climbingDiscipline: "gym" }),
      makeShoe({ _id: "b", name: "Vapor", modelName: "Vapor", variantLabel: "LV", aggressiveness: "aggressive", climbingDiscipline: "bouldering" }),
      makeShoe({ _id: "c", name: "Basic", aggressiveness: "flat", stiffness: "stiff", climbingDiscipline: "gym" }),
    ];
    const ranked = rankShoesForQuiz(shoes, beginner);
    expect(ranked).toHaveLength(2);
    expect(ranked[0]!.shoe.name).toBe("Basic");
  });
});
