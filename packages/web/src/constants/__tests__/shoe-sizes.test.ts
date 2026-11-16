import { describe, expect, it } from "vitest";
import { SIZES, formatSize, parseSize, sizeValue } from "../shoe-sizes";

describe("shoe sizes", () => {
  it("reads the simple system and size format", () => {
    expect(parseSize("EU 40.5")).toEqual({ system: "EU", size: "40.5" });
    expect(parseSize("us 9")).toEqual({ system: "US", size: "9" });
  });

  it("reads the EU part of the old combined sizes", () => {
    expect(parseSize("US 8 / UK 7.5 / EU 41")).toEqual({ system: "EU", size: "41" });
    expect(parseSize("US W8.5 / UK 7 / EU 40")).toEqual({ system: "EU", size: "40" });
    expect(formatSize("US Y1 / UK 13.5 / EU 32")).toBe("EU 32");
  });

  it("keeps unknown text and empty values as they are", () => {
    expect(parseSize("")).toBeNull();
    expect(parseSize(undefined)).toBeNull();
    expect(formatSize("Custom 42")).toBe("Custom 42");
  });

  it("lists half sizes in every system", () => {
    expect(SIZES.EU[0]).toBe("30");
    expect(SIZES.EU).toContain("40.5");
    expect(SIZES.US.at(-1)).toBe("15");
    expect(SIZES.UK).toContain("7.5");
    expect(sizeValue("UK", "7.5")).toBe("UK 7.5");
  });
});
