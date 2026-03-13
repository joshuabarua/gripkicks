import { describe, expect, it } from "vitest";
import { groupShoesByModel } from "../shoeVariants";
import type { Shoe } from "@/types/api";

describe("groupShoesByModel", () => {
  it("groups shoe variants by shared modelName and preserves variant labels", () => {
    const shoes: Shoe[] = [
      {
        _id: "1",
        name: "Solution Comp Women",
        brand: "La Sportiva",
        modelName: "Solution Comp",
        variantLabel: "Women",
        gender: "women",
        imageUrl: "https://example.com/women.png",
        slug: "solution-comp-women",
        aggressiveness: "aggressive",
        stiffness: "medium",
        climbingDiscipline: "bouldering",
        volume: "medium",
      },
      {
        _id: "2",
        name: "Solution Comp",
        brand: "La Sportiva",
        modelName: "Solution Comp",
        variantLabel: "Standard",
        gender: "men",
        imageUrl: "https://example.com/standard.png",
        slug: "solution-comp",
        aggressiveness: "aggressive",
        stiffness: "medium",
        climbingDiscipline: "bouldering",
        volume: "medium",
      },
    ];

    const grouped = groupShoesByModel(shoes);

    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toMatchObject({
      brand: "La Sportiva",
      baseName: "Solution Comp",
      groupKey: "la sportiva::solution comp",
    });
    expect(grouped[0].variants).toHaveLength(2);
    expect(grouped[0].variants.map((variant) => variant.item._id)).toEqual([
      "2",
      "1",
    ]);
    expect(grouped[0].variants.map((variant) => variant.variantLabel)).toEqual([
      "Standard",
      "Women",
    ]);
  });
});
