import { describe, expect, it } from "vitest";
import {
  getBaseShoeName,
  getVariantLabels,
  getVariantLabel,
  getShoeGroupKey,
  groupShoesByModel,
  groupUserShoesByModel,
  type ShoeVariantGroup,
  type GroupedVariant,
} from "../shoeVariants";
import type { Shoe, UserShoe } from "@/types/api";

describe("shoeVariants", () => {
  describe("getBaseShoeName", () => {
    it("removes variant patterns from shoe name", () => {
      expect(getBaseShoeName("Solution Comp Women")).toBe("Solution Comp");
      expect(getBaseShoeName("Solution Comp LV")).toBe("Solution Comp");
      expect(getBaseShoeName("Solution Comp High Volume")).toBe("Solution Comp");
      expect(getBaseShoeName("Solution Comp Men's")).toBe("Solution Comp");
    });

    it("handles multiple variant patterns", () => {
      expect(getBaseShoeName("Solution Comp Women LV")).toBe("Solution Comp");
      expect(getBaseShoeName("Solution Comp Men's High Volume")).toBe("Solution Comp");
    });

    it("cleans up parentheses and dashes", () => {
      expect(getBaseShoeName("Solution Comp (LV)")).toBe("Solution Comp");
      expect(getBaseShoeName("Solution Comp - LV")).toBe("Solution Comp");
      expect(getBaseShoeName("Solution Comp   LV")).toBe("Solution Comp");
    });

    it("returns original name if no variants found", () => {
      expect(getBaseShoeName("Solution Comp")).toBe("Solution Comp");
      expect(getBaseShoeName("Tarantulace")).toBe("Tarantulace");
    });

    it("handles empty or null input", () => {
      expect(getBaseShoeName("")).toBe("");
      expect(getBaseShoeName("   ")).toBe("");
    });
  });

  describe("getVariantLabels", () => {
    it("extracts volume variants", () => {
      expect(getVariantLabels("Solution Comp LV")).toContain("LV");
      expect(getVariantLabels("Solution Comp High Volume")).toContain("HV");
      expect(getVariantLabels("Solution Comp Mid Volume")).toContain("MV");
    });

    it("extracts gender variants", () => {
      expect(getVariantLabels("Solution Comp Women")).toContain("Women");
      expect(getVariantLabels("Solution Comp Men")).toContain("Men");
      expect(getVariantLabels("Solution Comp Kids")).toContain("Kids");
      expect(getVariantLabels("Solution Comp Unisex")).toContain("Unisex");
    });

    it("extracts from gender parameter", () => {
      expect(getVariantLabels("Solution Comp", "women")).toContain("Women");
      expect(getVariantLabels("Solution Comp", "men")).toContain("Men");
      expect(getVariantLabels("Solution Comp", "kids")).toContain("Kids");
      expect(getVariantLabels("Solution Comp", "unisex")).toContain("Unisex");
    });

    it("removes Unisex from results", () => {
      const labels = getVariantLabels("Solution Comp Unisex", "women");
      expect(labels).toContain("Women");
      expect(labels).not.toContain("Unisex");
    });

    it("removes duplicates", () => {
      const labels = getVariantLabels("Solution Comp Women LV", "women");
      expect(labels).toEqual(["LV", "Women"]);
    });

    it("handles case insensitive matching", () => {
      expect(getVariantLabels("solution comp women's")).toContain("Women");
      expect(getVariantLabels("solution comp womens")).toContain("Women");
      expect(getVariantLabels("solution comp lv")).toContain("LV");
    });
  });

  describe("getVariantLabel", () => {
    it("returns joined variant labels", () => {
      expect(getVariantLabel("Solution Comp Women LV")).toBe("LV Women");
      expect(getVariantLabel("Solution Comp Men HV")).toBe("HV Men");
    });

    it("returns null when no variants found", () => {
      expect(getVariantLabel("Solution Comp")).toBeNull();
      expect(getVariantLabel("")).toBeNull();
    });

    it("sorts variants consistently", () => {
      expect(getVariantLabel("Solution Comp LV Women")).toBe("LV Women");
      expect(getVariantLabel("Solution Comp Women LV")).toBe("LV Women");
    });
  });

  describe("getShoeGroupKey", () => {
    it("creates consistent group key", () => {
      expect(getShoeGroupKey("La Sportiva", "Solution Comp")).toBe(
        "la sportiva::solution comp"
      );
    });

    it("handles different casing", () => {
      expect(getShoeGroupKey("LA SPORTIVA", "SOLUTION COMP")).toBe(
        "la sportiva::solution comp"
      );
    });

    it("handles special characters", () => {
      expect(getShoeGroupKey("Black Diamond", "Zone")).toBe(
        "black diamond::zone"
      );
    });
  });

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
      const firstGroup = grouped[0];

      expect(grouped).toHaveLength(1);
      expect(firstGroup).toMatchObject({
        brand: "La Sportiva",
        baseName: "Solution Comp",
        groupKey: "la sportiva::solution comp",
      });
      expect(firstGroup?.variants).toHaveLength(2);
      expect(firstGroup?.variants.map((variant) => variant.item._id)).toEqual([
        "2",
        "1",
      ]);
      expect(firstGroup?.variants.map((variant) => variant.variantLabel)).toEqual([
        "Standard",
        "Women",
      ]);
    });

    it("handles shoes without modelName", () => {
      const shoes: Shoe[] = [
        {
          _id: "1",
          name: "Tarantulace",
          brand: "La Sportiva",
          aggressiveness: "moderate",
          stiffness: "soft",
          climbingDiscipline: "sport",
          volume: "medium",
        },
        {
          _id: "2",
          name: "Tarantulace Women",
          brand: "La Sportiva",
          aggressiveness: "moderate",
          stiffness: "soft",
          climbingDiscipline: "sport",
          volume: "medium",
        },
      ];

      const grouped = groupShoesByModel(shoes);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].baseName).toBe("Tarantulace");
      expect(grouped[0].variants).toHaveLength(2);
    });

    it("sorts variants by variantLabel", () => {
      const shoes: Shoe[] = [
        {
          _id: "1",
          name: "Solution Comp",
          brand: "La Sportiva",
          modelName: "Solution Comp",
          variantLabel: "Women",
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
          variantLabel: "Men",
          aggressiveness: "aggressive",
          stiffness: "medium",
          climbingDiscipline: "bouldering",
          volume: "medium",
        },
        {
          _id: "3",
          name: "Solution Comp",
          brand: "La Sportiva",
          modelName: "Solution Comp",
          variantLabel: "Kids",
          aggressiveness: "aggressive",
          stiffness: "medium",
          climbingDiscipline: "bouldering",
          volume: "medium",
        },
      ];

      const grouped = groupShoesByModel(shoes);
      const labels = grouped[0].variants.map((v) => v.variantLabel);

      expect(labels).toEqual(["Kids", "Men", "Women"]);
    });

    it("groups different brands separately", () => {
      const shoes: Shoe[] = [
        {
          _id: "1",
          name: "Solution",
          brand: "La Sportiva",
          modelName: "Solution",
          aggressiveness: "aggressive",
          stiffness: "medium",
          climbingDiscipline: "bouldering",
          volume: "medium",
        },
        {
          _id: "2",
          name: "Solution",
          brand: "Black Diamond",
          modelName: "Solution",
          aggressiveness: "aggressive",
          stiffness: "medium",
          climbingDiscipline: "bouldering",
          volume: "medium",
        },
      ];

      const grouped = groupShoesByModel(shoes);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].brand).toBe("La Sportiva");
      expect(grouped[1].brand).toBe("Black Diamond");
    });
  });

  describe("groupUserShoesByModel", () => {
    const createUserShoe = (overrides: Partial<UserShoe> = {}): UserShoe => ({
      _id: `user-shoe-${Math.random()}`,
      shoeId: "shoe-1",
      shoe: {
        _id: "shoe-1",
        name: "Solution Comp",
        brand: "La Sportiva",
        modelName: "Solution Comp",
        aggressiveness: "aggressive",
        stiffness: "medium",
        climbingDiscipline: "bouldering",
        volume: "medium",
      },
      ...overrides,
    });

    it("groups user shoes by model", () => {
      const userShoes = [
        createUserShoe({
          _id: "us1",
          shoe: {
            _id: "s1",
            name: "Solution Comp Women",
            brand: "La Sportiva",
            modelName: "Solution Comp",
            variantLabel: "Women",
            aggressiveness: "aggressive",
            stiffness: "medium",
            climbingDiscipline: "bouldering",
            volume: "medium",
          },
        }),
        createUserShoe({
          _id: "us2",
          shoe: {
            _id: "s2",
            name: "Solution Comp",
            brand: "La Sportiva",
            modelName: "Solution Comp",
            variantLabel: "Standard",
            aggressiveness: "aggressive",
            stiffness: "medium",
            climbingDiscipline: "bouldering",
            volume: "medium",
          },
        }),
      ];

      const grouped = groupUserShoesByModel(userShoes);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].variants).toHaveLength(2);
    });

    it("uses shoeDetails when shoe is not available", () => {
      const userShoes = [
        createUserShoe({
          _id: "us1",
          shoe: undefined,
          shoeDetails: {
            _id: "s1",
            name: "Solution Comp Women",
            brand: "La Sportiva",
            modelName: "Solution Comp",
            variantLabel: "Women",
            aggressiveness: "aggressive",
            stiffness: "medium",
            climbingDiscipline: "bouldering",
            volume: "medium",
          },
        }),
      ];

      const grouped = groupUserShoesByModel(userShoes);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].variants[0].variantLabel).toBe("Women");
    });

    it("skips items without shoe or shoeDetails", () => {
      const userShoes = [
        createUserShoe({ shoe: undefined, shoeDetails: undefined }),
        createUserShoe(),
      ];

      const grouped = groupUserShoesByModel(userShoes);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].variants).toHaveLength(1);
    });

    it("handles unknown brand", () => {
      const userShoes = [
        createUserShoe({
          shoe: {
            _id: "s1",
            name: "Unknown Shoe",
            brand: "",
            modelName: "Unknown",
            aggressiveness: "moderate",
            stiffness: "soft",
            climbingDiscipline: "sport",
            volume: "medium",
          },
        }),
      ];

      const grouped = groupUserShoesByModel(userShoes);

      expect(grouped[0].brand).toBe("Unknown");
    });
  });
});
