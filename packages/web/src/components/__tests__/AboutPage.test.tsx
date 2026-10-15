import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AboutPage from "@/app/about/page";

const FRAMER_ONLY_PROPS = new Set([
  "initial", "animate", "exit", "transition", "viewport", "variants", "custom",
  "layout", "layoutId", "drag", "dragConstraints", "onAnimationStart", "onAnimationComplete",
]);

const Stub = ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) => {
  const domProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => !key.startsWith("while") && !FRAMER_ONLY_PROPS.has(key)),
  );
  return <div {...domProps}>{children}</div>;
};

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, { get: () => Stub }),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/brand/LiquidGlassBackdrop", () => ({ default: () => null }));
vi.mock("@/components/brand/WordmarkWatermark", () => ({ default: () => null }));

const paragraphs = [
  "My name's Josh. I'm a climber, developer and guy with weird shaped feet.",
  "Through my years of climbing, every shoe has felt like it could probably fit alittle better. Call it copium, but I believe shoes really affect how we move on the wall. I've had enough heel hooks rip my shoe off and enough big, puffy air gaps in my toe box.",
  "So, I built this to find my shoe, my Cinderella slipper, if you will. One day I'll find the perfect pair. Maybe, I'll help some other climbers find theirs too.",
  "The site is free because it depends on the climbing community. The more the merrier, and I'll keep it free. I don't sell your data, I don't keep anything I don't need, and I don't have a foot fetish.",
  "Anyway, enjoy the site. I hope it helps. Mobile apps are coming soon.",
];

describe("AboutPage", () => {
  it("renders the hero and all five personal paragraphs", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { name: "ABOUT" })).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    for (const paragraph of paragraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.queryByText("GripKicks helps you find climbing shoes that fit.")).toBeNull();
  });

  it("renders the contact link and author sign-off", () => {
    render(<AboutPage />);

    expect(screen.getByRole("link", { name: "here" })).toHaveAttribute(
      "href",
      "mailto:gripkicksofficial@gmail.com",
    );
    expect(screen.getByText("— Josh")).toBeInTheDocument();
  });
});
