import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MatcherResults, type DisplayShoe } from "@/components/shoe/MatcherView";

vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));
vi.mock("next/image", () => ({ default: ({ fill, unoptimized, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => { void fill; void unoptimized; return React.createElement("img", props); } }));

const baseShoe: DisplayShoe = { id: "shoe-1", brand: "Scarpa", name: "Origin Women's", primaryScore: 86, secondaryLabel: "match", metrics: { comfort: 4, performance: 3, durability: 4, aggressiveness: 2, versatility: 4 } };
const shoe: DisplayShoe = { ...baseShoe, breakdown: { footTypeCompatibility: 4, volumeCompatibility: 4, userPreferenceMatch: 3, communityApproval: 4, overallRating: 4, learnedPreferenceBonus: 0, soleMateMatch: 2 } };
const props = { personalShoes: [shoe], communityShoes: [{ ...baseShoe, id: "community-1", name: "Drago LV", secondaryLabel: "12 ratings", totalRatings: 12 }], footProfile: { shape: "Egyptian", volume: "Low" } };

const second: DisplayShoe = { ...shoe, id: "shoe-2", name: "Drago LV", primaryScore: 71, metrics: { ...shoe.metrics, aggressiveness: 4.5, versatility: 1 } };
const detail = () => within(screen.getByRole("region", { name: "Selected shoe" }));

// The shared setup reports every media query as unmatched, which is the narrow
// layout. Most tests want the wide one, where the detail panel is always shown.
const narrowMatchMedia = window.matchMedia;
function setWide(wide: boolean) {
  window.matchMedia = ((query: string) => ({ ...narrowMatchMedia(query), matches: wide })) as typeof window.matchMedia;
}

describe("Matcher results", () => {
  beforeEach(() => setWide(true));
  afterEach(() => {
    window.matchMedia = narrowMatchMedia;
  });

  it("shows the ranked list, the radar map and the first shoe's details by default", () => {
    render(<MatcherResults {...props} />);
    expect(screen.getByRole("region", { name: "Radar map" })).toBeVisible();
    expect(screen.queryByText("Compare ratings")).toBeNull();
    expect(detail().getByRole("heading", { name: "Origin Women's" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Selected shoe" })).not.toHaveAttribute("inert");
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
    expect(detail().getByText("Match details")).toBeVisible();
    expect(detail().getByText("Foot shape")).toBeVisible();
  });

  it("shows weighted match contributions on each card", () => {
    render(<MatcherResults {...props} />);
    const card = within(screen.getByRole("article", { name: "Scarpa Origin Women's" }));
    expect(card.getByRole("img", { name: /Match makeup: Foot shape 24, Volume 16, Preferences 15, Community 12, Overall rating 8/ })).toBeInTheDocument();
    expect(detail().getByText("Foot shape").closest("div")).toHaveTextContent("+24 / 30");
  });

  it("charts each personal match against the user's ratings", () => {
    const fitProfile = { comfort: 4, performance: 4, durability: 4, aggressiveness: 4, versatility: 4 };
    render(<MatcherResults {...props} fitProfile={fitProfile} />);
    expect(screen.getByRole("img", { name: /Fit against your ratings: Comfort 4\.0 vs your 4\.0/ })).toBeInTheDocument();
    expect(screen.getByText("Biggest gap").parentElement).toHaveTextContent("Aggressive -2.0");
    fireEvent.click(screen.getByRole("button", { name: /Community/ }));
    expect(screen.queryByRole("img", { name: /Fit against your ratings/ })).not.toBeInTheDocument();
  });

  it("updates the details when another row is selected", () => {
    render(<MatcherResults {...props} personalShoes={[shoe, second]} />);
    const row = within(screen.getByRole("article", { name: "Scarpa Drago LV" })).getByRole("button", { name: "Drago LV" });
    expect(row).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-pressed", "true");
    expect(detail().getByRole("heading", { name: "Drago LV" })).toBeVisible();
    expect(detail().getByText("71%")).toBeVisible();
    expect(screen.getByRole("article", { name: "Scarpa Drago LV" })).toHaveClass("lab-card-active");
  });

  it("selects a shoe from its radar marker", () => {
    render(<MatcherResults {...props} personalShoes={[shoe, second]} />);
    const marker = screen.getByRole("button", { name: /^2\. Scarpa Drago LV/ });
    fireEvent.click(marker);
    expect(marker).toHaveAttribute("aria-pressed", "true");
    expect(detail().getByRole("heading", { name: "Drago LV" })).toBeVisible();
  });

  it("keeps the details sheet closed on narrow screens until a shoe is chosen", () => {
    setWide(false);
    render(<MatcherResults {...props} />);
    const sheet = screen.getByRole("region", { name: "Selected shoe" });
    expect(sheet).toHaveAttribute("inert");
    fireEvent.click(screen.getByRole("button", { name: "Origin Women's" }));
    expect(sheet).not.toHaveAttribute("inert");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(sheet).toHaveAttribute("inert");
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
    expect(detail().getAllByText("Not recorded")).toHaveLength(2);
    expect(detail().getByText("Not learned")).toBeVisible();
    expect(screen.queryByText("50%")).toBeNull();
    expect(screen.getByRole("link", { name: "Rate your shoes" })).toHaveAttribute("href", "/stash");
  });

  it("renders shoe cards before hydration without entrance opacity", () => {
    const html = renderToStaticMarkup(<MatcherResults {...props} />);
    expect(html).toContain("Origin Women");
    expect(html).not.toContain("opacity:0");
  });
});
