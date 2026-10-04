import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RadarGrid, type RadarShoe } from "@/components/shoe/RadarGrid";

vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));
const metrics = { comfort: 4, performance: 4, aggressiveness: 2, versatility: 4 };
const shoes: RadarShoe[] = Array.from({ length: 10 }, (_, index) => ({ id: `shoe-${index}`, brand: "Scarpa", name: `Shoe ${index}`, primaryScore: 90 - index, confidence: 1, metrics: { ...metrics, performance: 4 + index * 0.01 } }));

describe("Radar readability", () => {
  it("separates nearby markers without changing scores or true metric anchors", () => {
    const { container } = render(<RadarGrid shoes={shoes} userPosition={{ metrics }} />);
    const markers = screen.getAllByRole("button");
    const points = markers.map((marker) => ({ x: parseFloat(marker.style.left) / 100, y: parseFloat(marker.style.top) / 100 }));
    expect(points).toHaveLength(10);
    points.forEach((point, index) => {
      points.slice(index + 1).forEach((other) => expect(Math.abs(point.x - other.x) >= 0.159 || Math.abs(point.y - other.y) >= 0.199).toBe(true));
      expect(markers[index]).toHaveAccessibleName(`${index + 1}. Scarpa Shoe ${index}. Score ${90 - index}`);
    });
    const lines = container.querySelectorAll("line");
    expect(lines).toHaveLength(10);
    expect(Number(lines[0]?.getAttribute("x1"))).toBeCloseTo(6 / 14 * 100);
    expect(Number(lines[0]?.getAttribute("y1"))).toBeCloseTo(8 / 14 * 100);
  });

  it("offers keyboard inspection and Escape dismissal", () => {
    const onHover = vi.fn();
    render(<RadarGrid shoes={shoes.slice(0, 1)} onHoverChange={onHover} hoveredId="shoe-0" />);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("button"));
    expect(onHover).toHaveBeenCalledWith("shoe-0");
    fireEvent.keyDown(screen.getByRole("button"), { key: "Escape" });
    expect(onHover).toHaveBeenLastCalledWith(null);
  });
});
