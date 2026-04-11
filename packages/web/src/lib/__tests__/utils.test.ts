import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("merges simple class strings", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles conditional classes with objects", () => {
    const result = cn("base", { active: true, disabled: false });
    expect(result).toBe("base active");
  });

  it("handles arrays of classes", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("filters out falsy values", () => {
    const result = cn("class1", null, undefined, false, "class2");
    expect(result).toBe("class1 class2");
  });

  it("merges tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("handles complex combinations", () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      "base-class",
      isActive && "active-class",
      isDisabled && "disabled-class",
      ["array-class1", "array-class2"],
      { "conditional-true": true, "conditional-false": false },
    );

    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
    expect(result).toContain("array-class1");
    expect(result).toContain("array-class2");
    expect(result).toContain("conditional-true");
    expect(result).not.toContain("disabled-class");
    expect(result).not.toContain("conditional-false");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });

  it("deduplicates classes", () => {
    const result = cn("px-2", "px-2");
    expect(result).toBe("px-2");
  });

  it("resolves tailwind conflicts properly", () => {
    const result = cn("text-sm text-red-500", "text-lg text-blue-500");
    expect(result).toBe("text-lg text-blue-500");
  });
});
