import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CloudShoe from "@/components/CloudShoe";
import { RemoveShoeDialog } from "@/components/stash/RemoveShoeDialog";
import { getBrandDescription } from "@/utils/sanctuaryDescriptions";
import type { UserShoe } from "@/types/api";

vi.mock("next/image", () => ({ default: ({ fill, unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => { void fill; void unoptimized; return React.createElement("img", props); } }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));

const shoe: UserShoe = { _id: "stash-1", shoeId: "shoe-1", shoe: { _id: "shoe-1", name: "Drago", brand: "Scarpa", modelName: "Drago", aggressiveness: "aggressive", stiffness: "soft", volume: "low", climbingDiscipline: "bouldering", description: "Soft shoe for steep bouldering." } };
const onToggleExpand = vi.fn();
const onToggleFavourite = vi.fn();
const onRemove = vi.fn();
const onRate = vi.fn();
const cardProps = { onToggleExpand, onToggleFavourite, onRemove, onRate };

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("Sanctuary content", () => {
  it("stays collapsed by default and expands in place", () => {
    const { rerender } = render(<CloudShoe shoe={shoe} expanded={false} {...cardProps} />);
    expect(screen.getByText("Drago")).toBeInTheDocument();
    expect(screen.queryByText("Soft shoe for steep bouldering.")).toBeNull();
    expect(screen.queryByText("Size")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Show details for Scarpa Drago" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(onToggleExpand).toHaveBeenCalled();
    rerender(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    expect(screen.getByRole("button", { name: "Hide details for Scarpa Drago" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Soft shoe for steep bouldering.")).toBeInTheDocument();
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Condition")).toBeInTheDocument();
    expect(screen.getByText("About this shoe")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("bouldering")).toBeInTheDocument();
  });

  it("exposes favourite and remove actions when expanded", () => {
    render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Favourite/ }));
    expect(onToggleFavourite).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Remove/ }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("opens a rating grid from the value and closes it once a number is picked", () => {
    render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    const comfort = screen.getByRole("button", { name: "Comfort rating: not rated" });
    expect(comfort).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("radiogroup", { name: "Comfort rating" })).toBeNull();
    fireEvent.click(comfort);
    expect(comfort).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Comfort 8 out of 10" }));
    expect(onRate).toHaveBeenCalledWith("comfortScore", 8);
    expect(screen.queryByRole("radiogroup", { name: "Comfort rating" })).toBeNull();
    expect(screen.getByRole("button", { name: "Comfort rating: 8 out of 10" })).toHaveTextContent("8/10");
  });

  it("does not save again when the current rating is picked", () => {
    render(<CloudShoe shoe={{ ...shoe, durabilityRating: 4 }} expanded={true} {...cardProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Durability rating: 4 out of 10" }));
    expect(screen.getByRole("radio", { name: "Durability 4 out of 10" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Durability 4 out of 10" }));
    expect(onRate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Durability rating: 4 out of 10" }));
    fireEvent.click(screen.getByRole("radio", { name: "Durability 5 out of 10" }));
    expect(onRate).toHaveBeenCalledTimes(1);
    expect(onRate).toHaveBeenCalledWith("durabilityRating", 5);
  });

  it("keeps only one grid open at a time", () => {
    render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Size: not set" }));
    expect(screen.getByRole("radiogroup", { name: "Size system" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Performance rating: not rated" }));
    expect(screen.queryByRole("radiogroup", { name: "Size system" })).toBeNull();
    expect(screen.getByRole("radiogroup", { name: "Performance rating" })).toBeInTheDocument();
  });

  it("closes an open grid on Escape before closing the card", () => {
    render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Comfort rating: not rated" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("radiogroup", { name: "Comfort rating" })).toBeNull();
    expect(onToggleExpand).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape and returns focus to the card", () => {
    const { rerender } = render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
    rerender(<CloudShoe shoe={shoe} expanded={false} {...cardProps} />);
    expect(screen.getByRole("button", { name: "Show details for Scarpa Drago" })).toHaveFocus();
  });

  it("ignores Escape while collapsed", () => {
    render(<CloudShoe shoe={shoe} expanded={false} {...cardProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onToggleExpand).not.toHaveBeenCalled();
  });

  it("saves a size picked from the grid and closes it", () => {
    const onUpdateDetails = vi.fn();
    render(<CloudShoe shoe={{ ...shoe, size: "EU 40" }} expanded={true} onUpdateDetails={onUpdateDetails} {...cardProps} />);
    const size = screen.getByRole("button", { name: "Size: EU 40" });
    expect(screen.queryByRole("radio", { name: "EU 40.5" })).toBeNull();
    fireEvent.click(size);
    expect(screen.getByRole("radio", { name: "EU 40" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "UK" }));
    fireEvent.click(screen.getByRole("radio", { name: "UK 7.5" }));
    expect(onUpdateDetails).toHaveBeenCalledWith({ size: "UK 7.5" });
    expect(screen.queryByRole("radio", { name: "UK 7.5" })).toBeNull();
  });

  it("saves condition from the inline select", () => {
    const onUpdateDetails = vi.fn();
    render(<CloudShoe shoe={shoe} expanded={true} onUpdateDetails={onUpdateDetails} {...cardProps} />);
    fireEvent.change(screen.getByLabelText("Condition"), { target: { value: "Good" } });
    expect(onUpdateDetails).toHaveBeenCalledWith({ condition: "Good" });
  });

  it("does not wrap interactive buttons inside a role=button card", () => {
    render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    for (const el of document.querySelectorAll("[role='button']")) {
      expect(el.querySelector("button")).toBeNull();
    }
  });

  it("shows a variant label exactly once without repeating the gender", () => {
    const withVariant: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, gender: "men" } };
    render(<CloudShoe shoe={withVariant} variantLabel="LV" expanded={false} {...cardProps} />);
    expect(screen.getAllByText("LV")).toHaveLength(1);
    expect(screen.queryByText("Men")).toBeNull();
  });

  it("shows no gender label when no variant label exists", () => {
    const noVariant: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, gender: "men" } };
    render(<CloudShoe shoe={noVariant} expanded={false} {...cardProps} />);
    expect(screen.queryByText("Men", { exact: true })).toBeNull();
    expect(screen.queryByText("Unisex", { exact: true })).toBeNull();
  });

  it("suppresses gender words used as variant labels", () => {
    const womensShoe: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, name: "Drago Women's", gender: "women" } };
    render(<CloudShoe shoe={womensShoe} variantLabel="Women" expanded={false} {...cardProps} />);
    expect(screen.queryByText("Women", { exact: true })).toBeNull();
  });

  it("keeps non-gender variant labels on the card", () => {
    const lvShoe: UserShoe = { ...shoe, shoe: { ...shoe.shoe!, name: "Drago LV", gender: "men" } };
    render(<CloudShoe shoe={lvShoe} variantLabel="LV" expanded={false} {...cardProps} />);
    expect(screen.getAllByText("LV")).toHaveLength(1);
    expect(screen.queryByText("Men", { exact: true })).toBeNull();
  });

  it("shows the brand description in the card logo tooltip", async () => {
    const user = userEvent.setup();
    render(<CloudShoe shoe={shoe} expanded={false} {...cardProps} />);
    await user.hover(screen.getByRole("img", { name: "Scarpa brand" }));
    expect(await screen.findAllByText(getBrandDescription("Scarpa")!)).not.toHaveLength(0);
  });

  it("updates descriptions and ratings when a stashed shoe changes", () => {
    const { rerender } = render(<CloudShoe shoe={shoe} expanded={true} {...cardProps} />);
    const updated = { ...shoe, comfortScore: 8, shoe: { ...shoe.shoe!, description: "Updated product description." } };
    rerender(<CloudShoe shoe={updated} expanded={true} {...cardProps} />);
    expect(screen.getByText("Updated product description.")).toBeInTheDocument();
    expect(screen.getAllByText("8/10").length).toBeGreaterThan(0);
  });
});

describe("Remove shoe dialog", () => {
  it("names the shoe and only removes on confirm", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<RemoveShoeDialog shoe={shoe} onCancel={onCancel} onConfirm={onConfirm} />);
    const dialog = screen.getByRole("dialog", { name: "Remove shoe?" });
    expect(dialog).toHaveTextContent("Scarpa Drago and its ratings will be removed");
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onConfirm).toHaveBeenCalledWith(shoe);
  });

  it("stays closed with no pending shoe", () => {
    render(<RemoveShoeDialog shoe={null} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
