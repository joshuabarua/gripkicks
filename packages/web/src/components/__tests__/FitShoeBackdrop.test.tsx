import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FitShoeBackdrop } from "@/components/foot/FitShoeBackdrop";

const mocks = vi.hoisted(() => ({ useQuery: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: mocks.useQuery }));
vi.mock("@/components/ShoeImage", () => ({ default: ({ shoeName }: { shoeName: string }) => <span data-shoe={shoeName} /> }));
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: { div: ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => <div className={className} style={style}>{children}</div> },
}));

const sample = [{ _id: "a", brand: "Scarpa", name: "Drago", imageUrl: "https://img/a.png" }, { _id: "b", brand: "La Sportiva", name: "Solution", imageUrl: "https://img/b.png" }];
const greekLow = [{ _id: "b", brand: "La Sportiva", name: "Solution", imageUrl: "https://img/b.png" }, { _id: "c", brand: "Five Ten", name: "Hiangle", imageUrl: "https://img/c.png" }];

const shoesShown = () => [...document.querySelectorAll("[data-shoe]")].map((el) => el.getAttribute("data-shoe"));

beforeEach(() => {
  mocks.useQuery.mockReset();
  mocks.useQuery.mockImplementation((_query: unknown, args: { footShape?: string }) => (args.footShape ? greekLow : sample));
});

describe("FitShoeBackdrop", () => {
  it("floats a catalog sample behind the page, hidden from assistive tech", () => {
    render(<FitShoeBackdrop footShape={null} footVolume={null} />);
    const backdrop = screen.getByTestId("fit-shoe-backdrop");
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop).toHaveClass("pointer-events-none", "fixed");
    expect(shoesShown()).toEqual(["Drago", "Solution"]);
    expect(mocks.useQuery).toHaveBeenLastCalledWith(expect.anything(), { limit: 14 });
  });

  it("swaps to shoes that fit the selection and keeps shared shoes in place", () => {
    const { rerender } = render(<FitShoeBackdrop footShape={null} footVolume={null} />);
    const solutionSpot = () => (document.querySelector('[data-shoe="Solution"]')!.parentElement!.parentElement as HTMLElement).style.left;
    const before = solutionSpot();
    rerender(<FitShoeBackdrop footShape="greek" footVolume="low" />);
    expect(mocks.useQuery).toHaveBeenLastCalledWith(expect.anything(), { footShape: "greek", footVolume: "low", limit: 14 });
    expect(shoesShown()).toEqual(["Solution", "Hiangle"]);
    expect(solutionSpot()).toBe(before);
  });

  it("can stick to its section instead of covering the viewport", () => {
    render(<FitShoeBackdrop layout="sticky" />);
    const backdrop = screen.getByTestId("fit-shoe-backdrop");
    expect(backdrop).toHaveClass("absolute", "inset-0");
    expect(backdrop).not.toHaveClass("fixed");
    expect(backdrop.firstElementChild).toHaveClass("sticky", "top-0");
    expect(shoesShown()).toEqual(["Drago", "Solution"]);
  });

  it("holds the previous shoes while a new selection loads", () => {
    const { rerender } = render(<FitShoeBackdrop footShape={null} footVolume={null} />);
    mocks.useQuery.mockReturnValue(undefined);
    rerender(<FitShoeBackdrop footShape="roman" footVolume={null} />);
    expect(shoesShown()).toEqual(["Drago", "Solution"]);
  });

  it("renders nothing instead of breaking the page when the query fails", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.useQuery.mockImplementation(() => { throw new Error("Could not find public function"); });
    const { container } = render(<FitShoeBackdrop footShape={null} footVolume={null} />);
    expect(container).toBeEmptyDOMElement();
    error.mockRestore();
  });
});
