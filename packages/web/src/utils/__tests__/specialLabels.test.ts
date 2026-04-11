import { describe, it, expect } from "vitest";
import { buildSpecialLabels } from "@/utils/specialLabels";
import type { UserShoe } from "@/types/api";

const createMockShoe = (overrides: Partial<UserShoe> = {}): UserShoe => ({
  _id: `shoe-${Math.random().toString(36).substr(2, 9)}`,
  shoeId: "shoe-id-1",
  shoe: {
    _id: "shoe-id-1",
    name: "Test Shoe",
    brand: "Test Brand",
    modelName: "Test Model",
    imageUrl: "https://example.com/shoe.png",
    slug: "test-shoe",
    aggressiveness: "moderate",
    stiffness: "medium",
    climbingDiscipline: "sport",
    volume: "medium",
  },
  comfortScore: 5,
  purchaseDate: new Date().toISOString(),
  condition: "good",
  ...overrides,
});

describe("buildSpecialLabels", () => {
  it("returns empty object for single shoe", () => {
    const shoes = [createMockShoe()];
    const result = buildSpecialLabels(shoes);
    expect(result).toEqual({});
  });

  it("returns empty object for empty array", () => {
    const result = buildSpecialLabels([]);
    expect(result).toEqual({});
  });

  it("identifies most comfortable shoe", () => {
    const shoes = [
      createMockShoe({ _id: "shoe-1", comfortScore: 3 }),
      createMockShoe({ _id: "shoe-2", comfortScore: 8 }),
      createMockShoe({ _id: "shoe-3", comfortScore: 5 }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(result["shoe-2"]).toBeDefined();
    expect(result["shoe-2"]?.type).toBe("most-comfy");
  });

  it("identifies oldest shoe by purchase date", () => {
    const shoes = [
      createMockShoe({ _id: "shoe-1", purchaseDate: "2023-06-01", comfortScore: 5 }),
      createMockShoe({ _id: "shoe-2", purchaseDate: "2023-01-15", comfortScore: 5 }),
      createMockShoe({ _id: "shoe-3", purchaseDate: "2023-09-20", comfortScore: 5 }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(result["shoe-2"]).toBeDefined();
    expect(result["shoe-2"]?.type).toBe("oldest");
  });

  it("identifies most worn shoe by condition", () => {
    const shoes = [
      createMockShoe({ _id: "shoe-1", condition: "good", comfortScore: 5 }),
      createMockShoe({ _id: "shoe-2", condition: "worn", comfortScore: 5 }),
      createMockShoe({ _id: "shoe-3", condition: "excellent", comfortScore: 5 }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(result["shoe-2"]).toBeDefined();
    expect(result["shoe-2"]?.type).toBe("most-worn");
  });

  it("assigns multiple labels when shoe qualifies for multiple categories", () => {
    const shoes = [
      createMockShoe({
        _id: "shoe-1",
        comfortScore: 10,
        purchaseDate: "2020-01-01",
        condition: "worn",
      }),
      createMockShoe({
        _id: "shoe-2",
        comfortScore: 5,
        purchaseDate: "2023-01-01",
        condition: "new",
      }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(result["shoe-1"]).toBeDefined();
    expect(result["shoe-1"]?.type).toBeOneOf(["most-comfy", "oldest", "most-worn"]);
  });

  it("skips most-comfy label when no comfort scores exist", () => {
    const shoes = [
      createMockShoe({ _id: "shoe-1", comfortScore: 0 }),
      createMockShoe({ _id: "shoe-2", comfortScore: 0 }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(Object.values(result).some((label) => label.type === "most-comfy")).toBe(false);
  });

  it("skips oldest label when no purchase dates exist", () => {
    const shoes = [
      createMockShoe({ _id: "shoe-1", purchaseDate: undefined, comfortScore: 5 }),
      createMockShoe({ _id: "shoe-2", purchaseDate: undefined, comfortScore: 5 }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(Object.values(result).some((label) => label.type === "oldest")).toBe(false);
  });

  it("includes React icon elements in labels", () => {
    const shoes = [
      createMockShoe({ _id: "shoe-1", comfortScore: 10 }),
      createMockShoe({ _id: "shoe-2", comfortScore: 5 }),
    ];

    const result = buildSpecialLabels(shoes);

    expect(result["shoe-1"]?.icon).toBeDefined();
    expect(typeof result["shoe-1"]?.icon).toBe("object");
  });
});
