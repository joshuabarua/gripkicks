import React from "react";
import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrandLogo } from "@/components/stash/BrandLogo";
import brandLogos from "@/components/stash/brand-logos.json";

vi.mock("next/image", () => ({
  default: ({ fill, unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => {
    void fill;
    void unoptimized;
    return React.createElement("img", props);
  },
}));

const brands = [
  "Scarpa", "La Sportiva", "Five Ten", "Evolv", "Butora", "Mad Rock",
  "Black Diamond", "Ocun", "Red Chili", "So iLL", "Tenaya", "Unparallel",
  "Edelrid", "Salewa", "Zamberlan", "Boreal", "Simond", "Rock Pillars",
];

describe("Sanctuary brand logos", () => {
  it.each(brands)("renders an ImageKit logo with a valid local original for %s", (brand) => {
    render(<BrandLogo brand={brand} />);
    const image = screen.getByRole("img", { name: `${brand} logo` });
    const src = image.getAttribute("src")!;
    const url = new URL(src);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).toBe("ik.imagekit.io");
    expect(url.pathname).toMatch(/\/gripkicks\/imgs\/shoes\/[^/]+\/logos\/[^/]+$/);
    expect(Object.values(brandLogos)).toContain(src);
    const filename = path.basename(url.pathname);
    const asset = path.resolve("public/imgs/brands", filename);
    expect(fs.existsSync(asset)).toBe(true);
    if (filename.endsWith(".svg")) {
      const svg = new DOMParser().parseFromString(fs.readFileSync(asset, "utf8"), "image/svg+xml");
      expect(svg.querySelector("parsererror")).toBeNull();
      expect(svg.documentElement.getAttribute("viewBox")).toBeTruthy();
    }
  });

  it("matches brand names regardless of casing and surrounding spaces", () => {
    render(<BrandLogo brand=" SCARPA " size="sm" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", brandLogos["scarpa.svg"]);
    expect(screen.getByRole("img")).toHaveAttribute("sizes", "80px");
  });

  it("uses the catalog folder spelling for Red Chili", () => {
    render(<BrandLogo brand="Red Chili" />);
    expect(screen.getByRole("img").getAttribute("src")).toContain("/red_chilli/logos/red_chili.svg");
  });

  it("retains a readable fallback for brands without an asset", () => {
    render(<BrandLogo brand="Unknown brand" size="sm" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Unknown brand")).toBeInTheDocument();
  });
});
