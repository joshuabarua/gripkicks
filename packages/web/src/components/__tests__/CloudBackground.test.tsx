import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CloudBackground from "@/components/CloudBackground";

vi.mock("next/image", () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props) }));

const effects = vi.hoisted(() => ({ reducedEffects: vi.fn(() => false), reducedMotion: vi.fn(() => false), animationsEnabled: vi.fn(() => true) }));
vi.mock("@/hooks/useReducedEffects", () => ({ useReducedEffects: effects.reducedEffects }));
vi.mock("framer-motion", () => ({ useReducedMotion: effects.reducedMotion }));
vi.mock("@/stores/useAppStore", () => ({ useAnimationsEnabled: effects.animationsEnabled }));

const cloudWrappers = (container: HTMLElement) => container.querySelectorAll<HTMLElement>(".absolute.will-change-transform");

beforeEach(() => {
  vi.clearAllMocks();
  effects.reducedEffects.mockReturnValue(false);
  effects.reducedMotion.mockReturnValue(false);
  effects.animationsEnabled.mockReturnValue(true);
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("CloudBackground", () => {
  it("renders seven animated clouds when effects are allowed", () => {
    const { container } = render(<CloudBackground />);
    const clouds = cloudWrappers(container);
    expect(clouds).toHaveLength(7);
    for (const cloud of clouds) {
      expect(cloud.style.animation).toMatch(/cloud-drift-(left|right) [\d.]+s linear -?[\d.]+s/);
      expect(cloud.style.left).toBe("0px");
    }
  });

  it("renders four animated clouds under reduced device effects", () => {
    effects.reducedEffects.mockReturnValue(true);
    const { container } = render(<CloudBackground />);
    const clouds = cloudWrappers(container);
    expect(clouds).toHaveLength(4);
    for (const cloud of clouds) {
      expect(cloud.style.animation).toContain("cloud-drift-");
    }
  });

  it("renders three static clouds when motion is fully disabled", () => {
    effects.reducedMotion.mockReturnValue(true);
    const { container } = render(<CloudBackground />);
    const clouds = cloudWrappers(container);
    expect(clouds).toHaveLength(3);
    for (const cloud of clouds) {
      expect(cloud.style.animation).toBe("");
    }
  });

  it("respawns a cloud when its drift animation ends", () => {
    const { container } = render(<CloudBackground />);
    const before = cloudWrappers(container);
    expect(before).toHaveLength(7);
    const first = before[0]!;
    const propsKey = Object.keys(first).find((key) => key.startsWith("__reactProps"));
    expect(propsKey).toBeDefined();
    const handler = (first as unknown as Record<string, { onAnimationEnd?: () => void }>)[propsKey!]?.onAnimationEnd;
    expect(handler).toBeTypeOf("function");
    act(() => handler!());
    const after = cloudWrappers(container);
    expect(after).toHaveLength(7);
    expect(after[0]).not.toBe(first);
    expect(first.isConnected).toBe(false);
    expect(after[0]!.style.animation).toContain("cloud-drift-");
  });
});
