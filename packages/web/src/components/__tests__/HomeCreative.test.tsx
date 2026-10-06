import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeCreative from "@/app/home-designs/HomeCreative";

const mocks = vi.hoisted(() => ({ session: vi.fn(), count: vi.fn() }));
vi.mock("@/lib/auth", () => ({ useSession: mocks.session }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("convex/react", () => ({ useQuery: mocks.count }));
vi.mock("@/hooks/useReducedEffects", () => ({ useReducedEffects: () => true }));
vi.mock("next/dynamic", () => ({ default: () => () => <div data-testid="hero-scene" /> }));

beforeEach(() => {
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
  mocks.session.mockReturnValue({ data: null });
  mocks.count.mockReturnValue({ count: 24 });
});

describe("Homepage clarity", () => {
  it("retains the shoe hero without account sections", () => {
    render(<HomeCreative />);
    expect(screen.getAllByTestId("hero-scene")).toHaveLength(2);
    expect(screen.queryByRole("link", { name: "Create account" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Open dashboard" })).toBeNull();
  });

  it("keeps only an accessible scroll arrow over the shoe hero", () => {
    render(<HomeCreative />);
    const hero = within(screen.getByRole("region", { name: "Interactive climbing shoe" }));
    const arrow = hero.getByRole("link", { name: "Scroll to homepage content" });
    expect(arrow).toHaveAttribute("href", "#home-steps");
    expect(arrow.textContent).toBe("");
    expect(arrow.querySelector("svg")).toHaveClass("lucide-arrow-down");
    expect(hero.queryByText("Climbing shoe catalog")).toBeNull();
    expect(hero.queryByText("Explore tools")).toBeNull();
  });

  it("does not render account links even when signed in", () => {
    mocks.session.mockReturnValue({ data: { user: { id: "user-1" } } });
    render(<HomeCreative />);
    expect(screen.queryByRole("link", { name: "Open dashboard" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Create account" })).toBeNull();
  });

  it("restores the original page sections while keeping the four tools distinct", () => {
    render(<HomeCreative />);
    expect(screen.getByRole("link", { name: /Foot Lab/ })).toHaveAttribute("href", "/footlab");
    expect(screen.getByRole("link", { name: /Sanctuary/ })).toHaveAttribute("href", "/stash");
    expect(screen.getByRole("link", { name: /Matcher/ })).toHaveAttribute("href", "/matcher");
    expect(screen.getByRole("link", { name: /Sole Mate/ })).toHaveAttribute("href", "/matcher?tab=mate");
    expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument();
    expect(screen.queryByText("GET STARTED")).toBeNull();
    expect(screen.queryByText("YOUR DASHBOARD")).toBeNull();
  });

  it("keeps link arrows with tool-card illustrations", () => {
    render(<HomeCreative />);
    const links = within(screen.getByRole("region", { name: "Tools" })).getAllByRole("link");
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link).toHaveClass("lab-card", "lab-card-lift", "lab-rise");
      expect(link.querySelector("svg.lucide-arrow-up-right")).not.toBeNull();
      const svgs = link.querySelectorAll("svg");
      expect(link.querySelector("img") || svgs.length > 1).toBeTruthy();
    }
  });

  it("restyles step cards as lab tiles while retaining Ball Pill titles and mono copy", () => {
    render(<HomeCreative />);
    const stepsRegion = screen.getByRole("region", { name: "How it works" });
    expect(stepsRegion).toHaveClass("bg-black");
    const section = within(stepsRegion);
    expect(section.getByRole("heading", { name: "How it works" })).toHaveClass("font-ball-pill");
    expect(section.queryByText(/three simple steps/i)).toBeNull();
    const articles = section.getAllByRole("article");
    expect(articles).toHaveLength(3);
    for (const article of articles) {
      expect(article).toHaveClass("lab-card", "lab-card-lift", "lab-rise");
    }
    for (const label of ["01", "02", "03"]) {
      expect(section.queryByText(label)).toBeNull();
    }
    for (const title of ["Map your foot", "Rate your shoes", "Compare fits"]) {
      expect(section.getByRole("heading", { name: title })).toHaveClass("font-ball-pill");
    }
    expect(section.getByText("Set your foot shape and volume.")).toHaveClass("font-mono");
  });

  it("removes the GRIP KICKS intro and account sections", () => {
    render(<HomeCreative />);
    expect(screen.queryByRole("region", { name: /^GRIP\s?KICKS$/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /^GRIP\s?KICKS$/i })).toBeNull();
    expect(screen.queryByRole("region", { name: "GET STARTED" })).toBeNull();
    expect(screen.queryByRole("region", { name: "YOUR DASHBOARD" })).toBeNull();
    expect(screen.queryByText("Loading account", { exact: false })).toBeNull();
    expect(screen.queryByText("Climbing shoes, sizes and fit ratings.")).toBeNull();
    expect(screen.queryByText("Set your foot profile. Log the shoes you climb in. Compare fit and community ratings.")).toBeNull();
  });

  it("shows the live count and locked milestones on the community rail", () => {
    render(<HomeCreative />);
    const community = within(screen.getByRole("region", { name: "COMMUNITY BUILT" }));
    expect(community.getByText("24")).toBeInTheDocument();
    expect(community.getByText("climbers building the database")).toBeInTheDocument();
    expect(community.getByText("26 to unlock foot profiles")).toBeInTheDocument();
    for (const label of ["Foot profiles", "Community ratings", "Shoe data", "Climbing community"]) {
      expect(community.getByText(label)).toBeInTheDocument();
    }
    expect(community.getAllByRole("img", { name: /locked$/ })).toHaveLength(4);
    expect(community.getByText("24 / 50")).toBeInTheDocument();
    expect(community.queryByText("Unlocked")).toBeNull();
  });

  it("does not show a fabricated zero or milestone rail while community data is loading", () => {
    mocks.count.mockReturnValue(undefined);
    render(<HomeCreative />);
    expect(screen.getByRole("status", { name: "Loading community count" })).toBeInTheDocument();
    expect(screen.queryByText("0", { exact: true })).toBeNull();
    const community = within(screen.getByRole("region", { name: "COMMUNITY BUILT" }));
    expect(community.queryByText("0 / 50")).toBeNull();
    expect(community.queryByText("0 / 100")).toBeNull();
    expect(community.queryAllByRole("img", { name: /locked$/ })).toHaveLength(0);
    expect(community.queryByText("Foot profiles")).toBeNull();
  });

  it("server-renders no account section regardless of session state", () => {
    mocks.session.mockReturnValue({ data: { user: { id: "user-1" } }, isPending: false });
    const html = renderToStaticMarkup(<HomeCreative />);
    expect(html).not.toContain("Loading account");
    expect(html).not.toContain("Open dashboard");
    expect(html).not.toContain("GET STARTED");
  });

  it("renders readable homepage content before hydration", () => {
    const html = renderToStaticMarkup(<HomeCreative />);
    expect(html).toContain("How it works");
    expect(html).toContain("Map your foot");
    expect(html).not.toContain("Climbing shoes, sizes and fit ratings.");
    expect(html).not.toContain("opacity:0");
  });
});
