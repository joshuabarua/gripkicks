import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getBrandDescription, getShoeDescription } from "@/utils/sanctuaryDescriptions";

const enrichment = { sourceUrl: "https://example.com/shoe", sourceName: "Manufacturer", extractedAt: 0, confidence: 1, reviewStatus: "approved" as const };

describe("Sanctuary descriptions", () => {
  it("provides a short description for every brand with catalog shoes", () => {
    const directory = path.resolve("../../data/shoe-catalog");
    for (const file of fs.readdirSync(directory).filter((name) => name.endsWith(".json"))) {
      const catalog = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
      if (!catalog.shoes.length) continue;
      expect(getBrandDescription(catalog.brand), catalog.brand).toBeTruthy();
      expect(getBrandDescription(catalog.brand)!.length).toBeLessThan(180);
    }
  });

  it("normalizes brand names and does not invent unknown brand history", () => {
    expect(getBrandDescription(" SCARPA ")).toBe(getBrandDescription("Scarpa"));
    expect(getBrandDescription("Unknown brand")).toBeNull();
  });

  it("uses the first sentence of approved product copy", () => {
    expect(getShoeDescription({ description: "Soft shoe for steep climbing. A second sentence.", enrichment })).toBe("Soft shoe for steep climbing.");
  });

  it("uses catalog characteristics when enrichment is still pending", () => {
    expect(getShoeDescription({ description: "Unreviewed product claim.", enrichment: { ...enrichment, reviewStatus: "pending" }, aggressiveness: "flat", stiffness: "medium", volume: "high", climbingDiscipline: "gym" })).toBe("Flat profile, balanced flex, and a high-volume fit for gym climbing.");
  });

  it("does not show rejected product copy", () => {
    expect(getShoeDescription({ description: "Rejected claim.", enrichment: { ...enrichment, reviewStatus: "rejected" }, stiffness: "soft" })).toBe("Soft flex.");
  });

  it("does not invent missing specifications", () => {
    expect(getShoeDescription({ name: "Unknown shoe" })).toBe("Product details are not available yet.");
    expect(getShoeDescription(undefined)).toBe("Product details are not available yet.");
  });

  it("ignores object-prototype keys in source data", () => {
    expect(getBrandDescription("constructor")).toBeNull();
    expect(getShoeDescription({ stiffness: "constructor", climbingDiscipline: "toString" })).toBe("Product details are not available yet.");
  });

  it("keeps long product descriptions concise", () => {
    const description = getShoeDescription({ description: "A climbing shoe with " + "technical details ".repeat(30) });
    expect(description.length).toBeLessThanOrEqual(180);
    expect(description.endsWith("…")).toBe(true);
  });
});
