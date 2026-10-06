import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MatcherResults, type DisplayShoe } from "@/components/shoe/MatcherView";

vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));
vi.mock("next/image", () => ({ default: ({ fill, unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => { void fill; void unoptimized; return React.createElement("img", props); } }));

const baseShoe: DisplayShoe = { id: "shoe-1", brand: "Scarpa", name: "Origin Women's", primaryScore: 86, secondaryLabel: "match", metrics: { comfort: 4, performance: 3, durability: 4, aggressiveness: 2, versatility: 4 } };
const shoe: DisplayShoe = { ...baseShoe, breakdown: { footTypeCompatibility: 4, volumeCompatibility: 4, userPreferenceMatch: 3, communityApproval: 4, overallRating: 4, learnedPreferenceBonus: 0, soleMateMatch: 2 } };
const props = { personalShoes: [shoe], communityShoes: [{ ...baseShoe, id: "community-1", name: "Drago LV", secondaryLabel: "12 ratings", totalRatings: 12 }], footProfile: { shape: "Egyptian", volume: "Low" } };

describe("Matcher results", () => {
  it("keeps comparison views collapsed instead of competing with shoe cards", () => {
    render(<MatcherResults {...props} />);
    expect(screen.getByText("Radar map").closest("details")).not.toHaveAttribute("open");
    expect(screen.getByText("Compare ratings").closest("details")).not.toHaveAttribute("open");
    const tile = screen.getByRole("article", { name: "Scarpa Origin Women's" });
    expect(tile).toHaveClass("lab-card", "lab-card-lift", "lab-rise");
    expect(within(tile).getByText("86%")).toBeInTheDocument();
  });

  it("switches recommendation source without losing scores or variant names", () => {
    render(<MatcherResults {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Community/ }));
    expect(screen.getByRole("button", { name: /Community/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("article", { name: "Scarpa Drago LV" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Scarpa Origin Women's" })).toBeNull();
  });

  it("shows the brand logo on result cards across recommendation sources", () => {
    render(<MatcherResults {...props} />);
    const personalCard = within(screen.getByRole("article", { name: "Scarpa Origin Women's" }));
    expect(personalCard.getByRole("img", { name: "Scarpa logo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Community/ }));
    const communityCard = within(screen.getByRole("article", { name: "Scarpa Drago LV" }));
    expect(communityCard.getByRole("img", { name: "Scarpa logo" })).toBeInTheDocument();
  });

  it("makes match details available without hover", () => {
    render(<MatcherResults {...props} />);
    const summary = screen.getByText("Match details");
    fireEvent.click(summary);
    expect(summary.closest("details")).toHaveAttribute("open");
    expect(screen.getByText("Foot shape")).toBeVisible();
  });

  it("does not show a false empty state while a source is loading", () => {
    render(<MatcherResults personalShoes={[]} communityShoes={[]} personalLoading />);
    expect(screen.getByRole("status", { name: "Loading matcher" })).toBeInTheDocument();
    expect(screen.queryByText("No shoe matches yet")).toBeNull();
  });

  it("offers profile setup when personal results cannot be shown", () => {
    render(<MatcherResults personalShoes={[]} communityShoes={[]} footProfile={null} />);
    expect(screen.getByRole("link", { name: "Set up foot profile" })).toHaveAttribute("href", "/footlab");
  });

  it("does not present unavailable signals as 50% compatibility", () => {
    const unknown: DisplayShoe = { ...shoe, signals: { footShape: "unknown", volume: false, preferences: false }, breakdown: { ...shoe.breakdown!, footTypeCompatibility: 2.5, volumeCompatibility: 2.5, userPreferenceMatch: 2.5 } };
    render(<MatcherResults {...props} personalShoes={[unknown]} />);
    fireEvent.click(screen.getByText("Match details"));
    const card = within(screen.getByRole("article", { name: "Scarpa Origin Women's" }));
    expect(card.getAllByText("Not recorded")).toHaveLength(2);
    expect(card.getByText("Not learned")).toBeVisible();
    expect(card.queryByText("50%")).toBeNull();
    expect(screen.getByRole("link", { name: "Rate your shoes" })).toHaveAttribute("href", "/stash");
  });

  it("renders shoe cards before hydration without entrance opacity", () => {
    const html = renderToStaticMarkup(<MatcherResults {...props} />);
    expect(html).toContain("Origin Women");
    expect(html).not.toContain("opacity:0");
  });
});
