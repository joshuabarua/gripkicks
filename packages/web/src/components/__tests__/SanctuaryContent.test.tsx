import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CloudShoe from "@/components/CloudShoe";
import { BrandSections } from "@/components/stash/BrandSections";
import { getBrandDescription } from "@/utils/sanctuaryDescriptions";
import type { UserShoe } from "@/types/api";

vi.mock("next/image", () => ({ default: ({ fill, unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => { void fill; void unoptimized; return React.createElement("img", props); } }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));

const shoe: UserShoe = { _id: "stash-1", shoeId: "shoe-1", shoe: { _id: "shoe-1", name: "Drago", brand: "Scarpa", modelName: "Drago", aggressiveness: "aggressive", stiffness: "soft", volume: "low", climbingDiscipline: "bouldering", description: "Soft shoe for steep bouldering." } };
const onSelect = vi.fn();
const onEdit = vi.fn();
const groups = (item: UserShoe) => [{ brand: "Scarpa", models: [{ brand: "Scarpa", groupKey: "scarpa/drago", baseName: "Drago", variants: [{ item, variantLabel: "" }] }] }];

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("Sanctuary content", () => {
  it("shows the product description and opens shoe details", () => {
    render(<CloudShoe shoe={shoe} onClick={onSelect} onEdit={onEdit} index={0} />);
    expect(screen.getByText("Soft shoe for steep bouldering.")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "View Scarpa Drago" }), { key: "Enter" });
    expect(onSelect).toHaveBeenCalled();
  });

  it("does not render brand content when the collection is empty", () => {
    render(<BrandSections groups={[]} specialLabels={{}} onSelect={onSelect} onEdit={onEdit} />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("only describes brands present in the collection", () => {
    render(<BrandSections groups={groups(shoe)} specialLabels={{}} onSelect={onSelect} onEdit={onEdit} />);
    expect(screen.getByRole("heading", { name: "Scarpa" })).toBeInTheDocument();
    expect(screen.getByText(getBrandDescription("Scarpa")!)).toBeInTheDocument();
    expect(screen.queryByText(getBrandDescription("Tenaya")!)).toBeNull();
  });

  it("updates descriptions and ratings when a stashed shoe changes", () => {
    const { rerender } = render(<BrandSections groups={groups(shoe)} specialLabels={{}} onSelect={onSelect} onEdit={onEdit} />);
    const updated = { ...shoe, comfortScore: 8, shoe: { ...shoe.shoe!, description: "Updated product description." } };
    rerender(<BrandSections groups={groups(updated)} specialLabels={{}} onSelect={onSelect} onEdit={onEdit} />);
    expect(screen.getByText("Updated product description.")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
