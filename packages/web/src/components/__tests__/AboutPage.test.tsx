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
vi.mock("next/image", () => ({ default: ({ fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => { void fill; return React.createElement("img", props); } }));

const paragraphs = [
  "I'm Josh, a climber and developer with awkward-shaped feet.",
  "Every shoe I've owned could have fit a little better: heels slipping off on hooks, air gaps in the toe box. GripKicks is my attempt to find the right pair, and to help other climbers find theirs.",
  "It's free and stays free. I don't sell your data or keep anything I don't need.",
];

describe("AboutPage", () => {
  it("renders the lab header and the personal paragraphs", () => {
    render(<AboutPage />);
    const heading = screen.getByRole("heading", { level: 1, name: "About" });
    expect(heading).toHaveClass("lab-title");
    for (const paragraph of paragraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.queryByText("GripKicks helps you find climbing shoes that fit.")).toBeNull();
  });

  it("renders the contact link and author sign-off", () => {
    render(<AboutPage />);

    expect(screen.getByRole("link", { name: /Send feedback/ })).toHaveAttribute(
      "href",
      "mailto:gripkicksofficial@gmail.com",
    );
    expect(screen.getByText("gripkicksofficial@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("— Josh")).toBeInTheDocument();
  });
});
