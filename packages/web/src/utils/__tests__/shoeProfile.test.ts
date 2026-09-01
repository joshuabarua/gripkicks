import { describe, expect, it } from "vitest";
import { getShoeProfileCompletion } from "@/utils/shoeProfile";

const baseShoe = { _id: "user-shoe", shoeId: "shoe" };

describe("getShoeProfileCompletion", () => {
  it("identifies all required details on a newly added shoe", () => {
    expect(getShoeProfileCompletion(baseShoe)).toEqual({
      completed: 0,
      total: 5,
      missing: ["Size", "Condition", "Comfort", "Performance", "Durability"],
      isComplete: false,
    });
  });

  it("marks a shoe complete when size, condition, and ratings exist", () => {
    expect(getShoeProfileCompletion({
      ...baseShoe,
      size: "42",
      condition: "new",
      comfortScore: 0,
      performanceRating: 8,
      durabilityRating: 7,
    })).toEqual({
      completed: 5,
      total: 5,
      missing: [],
      isComplete: true,
    });
  });
});
