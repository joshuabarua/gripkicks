import React from "react";
import { fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CloudShoe from "@/components/CloudShoe";
import { BrandSections } from "@/components/stash/BrandSections";
import { getBrandDescription } from "@/utils/sanctuaryDescriptions";
import type { UserShoe } from "@/types/api";

vi.mock("next/image", () => ({ default: ({ fill, unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => { void fill; void unoptimized; return React.createElement("img", props); } }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));

const shoe: UserShoe = { _id: "stash-1", shoeId: "shoe-1", shoe: { _id: "shoe-1", name: "Drago", brand: "Scarpa", modelName: "Drago", aggressiveness: "aggressive", stiffness: "soft", volume: "low", climbingDiscipline: "bouldering", description: "Soft shoe for steep bouldering." } };
const onOpenStats = vi.fn();
const onEdit = vi.fn();
const onToggleFavourite = vi.fn();
const onRemove = vi.fn();
const cardProps = { onOpenStats, onEdit, onToggleFavourite, onRemove };
const groups = (item: UserShoe) => [{ brand: "Scarpa", models: [{ brand: "Scarpa", groupKey: "scarpa/drago", baseName: "Drago", variants: [{ item, variantLabel: "" }] }] }];

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("Sanctuary content", () => {
  it("stays collapsed by default and expands in place", () => {
    render(<CloudShoe shoe={shoe} index={0} {...cardProps} />);
    expect(screen.getByText("Drago")).toBeInTheDocument();
    expect(screen.queryByText("Soft shoe for steep bouldering.")).toBeNull();
    expect(screen.queryByText("Size")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Show details for Scarpa Drago" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide details for Scarpa Drago" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Soft shoe for steep bouldering.")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Condition")).toBeInTheDocument();
    expect(screen.getByText("Your ratings")).toBeInTheDocument();
    expect(screen.getByText("bouldering")).toBeInTheDocument();
  });

  it("exposes edit, favourite, full stats and remove actions when expanded", () => {
    render(<CloudShoe shoe={shoe} index={0} {...cardProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Scarpa Drago" }));
    expect(onEdit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove Scarpa Drago" }));
    expect(onRemove).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Show details for Scarpa Drago" }));
    fireEvent.click(screen.getByRole("button", { name: "Favourite" }));
    expect(screen.getByRole("button", { name: "Favourite" })).toHaveAttribute("aria-pressed", "false");
    expect(onToggleFavourite).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Full stats" }));
    expect(onOpenStats).toHaveBeenCalled();
  });

  it("does not wrap interactive buttons inside a role=button card", () => {
    render(<CloudShoe shoe={shoe} index={0} {...cardProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Show details for Scarpa Drago" }));
    for (const el of document.querySelectorAll("[role='button']")) {
      expect(el.querySelector("button")).toBeNull();
    }
  });

  it("shows a variant label exactly once without repeating the gender", () => {
    const withVariant: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, gender: "men" } };
    render(<CloudShoe shoe={withVariant} index={0} variantLabel="LV" {...cardProps} />);
    expect(screen.getAllByText("LV")).toHaveLength(1);
    expect(screen.queryByText("Men")).toBeNull();
  });

  it("falls back to a single gender label when no variant label exists", () => {
    const noVariant: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, gender: "men" } };
    render(<CloudShoe shoe={noVariant} index={0} {...cardProps} />);
    expect(screen.getAllByText("Men")).toHaveLength(1);
  });

  it("lets each card own its grouped variant label instead of repeating it above the card", () => {
    const lvShoe: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, name: "Drago LV", modelName: "Drago", gender: "men" } };
    const womensShoe: UserShoe = { ...shoe, _id: "stash-2", shoe: { ...shoe.shoe!, name: "Drago Women's", modelName: "Drago", gender: "women" } };
    const group = [{
      brand: "Scarpa",
      models: [{
        brand: "Scarpa",
        groupKey: "scarpa/drago",
        baseName: "Drago",
        variants: [
          { item: lvShoe, variantLabel: "LV" },
          { item: womensShoe, variantLabel: "Women" },
        ],
      }],
    }];
    render(<BrandSections groups={group} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    expect(screen.queryByText("Standard")).toBeNull();
    expect(screen.getAllByText("LV")).toHaveLength(1);
    expect(screen.queryByText("Men", { exact: true })).toBeNull();
    expect(screen.getAllByText("Women")).toHaveLength(1);
  });

  it("does not render brand content when the collection is empty", () => {
    render(<BrandSections groups={[]} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("collapses and expands a brand section from its header", async () => {
    render(<BrandSections groups={groups(shoe)} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    const toggle = screen.getByRole("button", { name: /Scarpa brand section/ });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Drago")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await waitForElementToBeRemoved(() => screen.queryByText("Drago"));
    expect(screen.queryByText(getBrandDescription("Scarpa")!)).toBeNull();
  });

  it("collapses and expands every brand from the toolbar", async () => {
    const twoBrands = [...groups(shoe), { brand: "Tenaya", models: [{ brand: "Tenaya", groupKey: "tenaya/ra", baseName: "Ra", variants: [{ item: { ...shoe, _id: "stash-9", shoe: { ...shoe.shoe!, name: "Ra" } }, variantLabel: "" }] }] }];
    render(<BrandSections groups={twoBrands} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    const expandAll = screen.getByRole("button", { name: "Expand all" });
    expect(expandAll).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    await waitForElementToBeRemoved(() => screen.queryByText("Drago"));
    expect(screen.queryByText("Ra")).toBeNull();
    expect(screen.getByRole("button", { name: "Collapse all" })).toBeDisabled();
    fireEvent.click(expandAll);
    expect(screen.getByText("Drago")).toBeInTheDocument();
  });

  it("places compact brands side by side at desktop widths", () => {
    const many: UserShoe[] = ["Drago", "Instinct VS", "Vapor V", "Origin", "Maestro"].map((name, index) => ({ ...shoe, _id: `stash-${index}`, shoe: { ...shoe.shoe!, name } }));
    const multi = [
      { brand: "Boreal", models: [{ brand: "Boreal", groupKey: "boreal/dharma", baseName: "Dharma", variants: [{ item: { ...shoe, _id: "stash-b", shoe: { ...shoe.shoe!, name: "Dharma", brand: "Boreal" } }, variantLabel: "" }] }] },
      { brand: "Scarpa", models: many.map((item, index) => ({ brand: "Scarpa", groupKey: `scarpa/${index}`, baseName: item.shoe!.name, variants: [{ item, variantLabel: "" }] })) },
    ];
    render(<BrandSections groups={multi} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    expect(screen.getByRole("region", { name: "Boreal" })).toHaveClass("lg:col-span-1");
    expect(screen.getByRole("region", { name: "Scarpa" })).toHaveClass("lg:col-span-2");
  });

  it("only describes brands present in the collection", () => {
    render(<BrandSections groups={groups(shoe)} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    expect(screen.getByRole("heading", { name: "Scarpa" })).toBeInTheDocument();
    expect(screen.getByText(getBrandDescription("Scarpa")!)).toBeInTheDocument();
    expect(screen.queryByText(getBrandDescription("Tenaya")!)).toBeNull();
  });

  it("updates descriptions and ratings when a stashed shoe changes", () => {
    const { rerender } = render(<BrandSections groups={groups(shoe)} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    const toggle = screen.getByRole("button", { name: "Show details for Scarpa Drago" });
    fireEvent.click(toggle);
    const updated = { ...shoe, comfortScore: 8, shoe: { ...shoe.shoe!, description: "Updated product description." } };
    rerender(<BrandSections groups={groups(updated)} specialLabels={{}} onOpenStats={onOpenStats} onEdit={onEdit} onToggleFavourite={onToggleFavourite} onRemove={onRemove} />);
    expect(screen.getByText("Updated product description.")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Scarpa" })).getAllByText("8").length).toBeGreaterThan(0);
  });
});
