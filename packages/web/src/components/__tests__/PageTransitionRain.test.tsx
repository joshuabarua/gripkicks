import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageTransitionRain from "@/components/ui/PageTransitionRain";
import { RAIN_PIECES } from "@/lib/transition-rain";

const navState = vi.hoisted(() => ({ pathname: "/about" }));
vi.mock("next/navigation", () => ({ usePathname: () => navState.pathname }));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    ViewTransition: ({ name, update, children }: { name?: string; update?: unknown; children?: React.ReactNode }) => (
      <div data-vt-name={name} data-vt-update={JSON.stringify(update)}>{children}</div>
    ),
  };
});

describe("PageTransitionRain", () => {
  it("renders 12 hidden named boundaries keyed to pathname", () => {
    const { container, rerender } = render(<PageTransitionRain />);
    const boundaries = container.querySelectorAll("[data-vt-name]");
    expect(boundaries).toHaveLength(12);
    const names = [...boundaries].map((el) => el.getAttribute("data-vt-name"));
    expect(names).toEqual(Array.from({ length: 12 }, (_, i) => `page-rain-${i}`));
    for (const el of boundaries) {
      expect(el.getAttribute("data-vt-update")).toBe('{"page-nav":"page-rain","default":"none"}');
      const span = el.querySelector("span");
      expect(span).toHaveAttribute("aria-hidden", "true");
      expect(span).toHaveClass("absolute", "size-0", "overflow-hidden");
      expect(span?.textContent).toBe("/about");
    }
    navState.pathname = "/privacy";
    rerender(<PageTransitionRain />);
    expect(container.querySelectorAll("[data-vt-name] span")[0]?.textContent).toBe("/privacy");
    expect(container.querySelectorAll("[data-vt-name]")).toHaveLength(12);
  });

  it("preloads the five distinct optimized WebP assets for no-preference only", () => {
    render(<PageTransitionRain />);
    const preloads = document.head.querySelectorAll('link[rel="preload"][type="image/webp"]');
    expect(preloads).toHaveLength(5);
    const hrefs = [...preloads].map((el) => el.getAttribute("href"));
    expect(new Set(hrefs).size).toBe(5);
    for (const el of preloads) {
      expect(el.getAttribute("href")).toMatch(/\/imgs\/transition\/rain-[\w-]+\.webp$/);
      expect(el.getAttribute("as")).toBe("image");
      expect(el.getAttribute("type")).toBe("image/webp");
      expect(el.getAttribute("media")).toBe("(prefers-reduced-motion: no-preference)");
      expect(el.getAttribute("fetchpriority") ?? el.getAttribute("fetchPriority")).toBe("low");
    }
  });

  it("injects per-name CSS that hides extras on portrait phones and reduced motion", () => {
    const { container } = render(<PageTransitionRain />);
    const css = container.querySelector("style")?.textContent ?? "";
    for (let i = 0; i < 12; i++) {
      expect(css).toContain(`::view-transition-group(page-rain-${i})`);
    }
    const portraitRules = css.match(/orientation: portrait/g) ?? [];
    expect(portraitRules).toHaveLength(5);
    const reducedRules = css.match(/prefers-reduced-motion: reduce/g) ?? [];
    expect(reducedRules).toHaveLength(12);
    expect(css).toContain("rain-blue.webp");
    expect(css).toContain("rain-rock.webp");
    expect(css).not.toContain(".png");
    expect(css).not.toContain("Math.random");
    expect(css).not.toContain("transform:none");
    expect(css).toContain("inset:0 auto auto 0");
    expect(css).toMatch(/width:clamp\(32px,calc\(var\(--rain-size\)\*\.12vw\),calc\(var\(--rain-size\)\*1px\)\)!important/);
    expect(css).toMatch(/height:clamp\(32px,calc\(var\(--rain-size\)\*\.12vw\),calc\(var\(--rain-size\)\*1px\)\)!important/);
    expect(css).toContain("--rain-size:70}");
    expect(css).not.toMatch(/--rain-size:\d+px/);
  });

  it("keeps every piece inside the wipe budget with seven mobile pieces", () => {
    expect(RAIN_PIECES).toHaveLength(12);
    expect(RAIN_PIECES.filter((piece) => piece.mobile)).toHaveLength(7);
    for (const piece of RAIN_PIECES) {
      expect(piece.delayMs + piece.durationMs).toBeLessThanOrEqual(1050);
    }
  });
});
