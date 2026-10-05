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
  mocks.session.mockReturnValue({ data: null });
  mocks.count.mockReturnValue({ count: 24 });
});

describe("Homepage clarity", () => {
  it("offers one clear account action and retains the shoe hero", () => {
    render(<HomeCreative />);
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/auth/signup");
    expect(screen.getAllByTestId("hero-scene")).toHaveLength(2);
  });

  it("keeps only an accessible scroll arrow over the shoe hero", () => {
    render(<HomeCreative />);
    const hero = within(screen.getByRole("region", { name: "Interactive climbing shoe" }));
    const arrow = hero.getByRole("link", { name: "Scroll to homepage content" });
    expect(arrow).toHaveAttribute("href", "#home-intro");
    expect(arrow.textContent).toBe("");
    expect(arrow.querySelector("svg")).toHaveClass("lucide-arrow-down");
    expect(hero.queryByText("Climbing shoe catalog")).toBeNull();
    expect(hero.queryByText("Explore tools")).toBeNull();
  });

  it("sends signed-in climbers to their dashboard", () => {
    mocks.session.mockReturnValue({ data: { user: { id: "user-1" } } });
    render(<HomeCreative />);
    expect(screen.getByRole("link", { name: "Open dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: "Create account" })).toBeNull();
  });

  it("restores the original page sections while keeping the four tools distinct", () => {
    render(<HomeCreative />);
    expect(screen.getByRole("link", { name: /Foot Lab/ })).toHaveAttribute("href", "/footlab");
    expect(screen.getByRole("link", { name: /Sanctuary/ })).toHaveAttribute("href", "/stash");
    expect(screen.getByRole("link", { name: /Matcher/ })).toHaveAttribute("href", "/matcher");
    expect(screen.getByRole("link", { name: /Sole Mate/ })).toHaveAttribute("href", "/matcher?tab=mate");
    expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GET STARTED" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Create account" })).toHaveLength(1);
  });

  it("keeps link arrows without decorative tool icons", () => {
    render(<HomeCreative />);
    const links = within(screen.getByRole("region", { name: "Tools" })).getAllByRole("link");
    expect(links).toHaveLength(4);
    for (const link of links) {
      const icons = link.querySelectorAll("svg");
      expect(icons).toHaveLength(1);
      expect(icons[0]).toHaveClass("lucide-arrow-up-right");
    }
  });

  it("restores display-headed step tiles on Privacy-style surfaces while retaining readable Sora copy", () => {
    render(<HomeCreative />);
    const stepsRegion = screen.getByRole("region", { name: "How it works" });
    expect(stepsRegion).toHaveClass("bg-black");
    const section = within(stepsRegion);
    const articles = section.getAllByRole("article");
    expect(articles).toHaveLength(3);
    for (const article of articles) {
      expect(article).toHaveClass("rounded-3xl", "bg-brand-surface");
    }
    for (const title of ["Map your foot", "Rate your shoes", "Compare fits"]) {
      expect(section.getByRole("heading", { name: title })).toHaveClass("font-ball-pill");
    }
    expect(section.getByText("Set your foot shape and volume.")).toHaveClass("font-sora");
    expect(screen.getByText("Climbing shoes, sizes and fit ratings.")).toHaveClass("font-sora");
  });

  it("keeps large editorial panels graphite instead of filling them with chalk", () => {
    render(<HomeCreative />);
    for (const title of ["GRIPKICKS", "GET STARTED"]) {
      const panel = screen.getByRole("region", { name: title });
      expect(panel).toHaveClass("bg-brand-surface", "text-brand-chalk");
      expect(panel).not.toHaveClass("bg-brand-chalk");
    }
  });

  it("does not show a fabricated zero while community data is loading", () => {
    mocks.count.mockReturnValue(undefined);
    render(<HomeCreative />);
    expect(screen.getByRole("status", { name: "Loading community count" })).toBeInTheDocument();
    expect(screen.queryByText("0", { exact: true })).toBeNull();
  });

  it("keeps server-rendered account controls stable even when the client has a cached session", () => {
    mocks.session.mockReturnValue({ data: { user: { id: "user-1" } }, isPending: false });
    const html = renderToStaticMarkup(<HomeCreative />);
    expect(html).toContain("Loading account");
    expect(html).not.toContain("Open dashboard");
  });

  it("renders readable homepage content before hydration", () => {
    const html = renderToStaticMarkup(<HomeCreative />);
    expect(html).toContain("Climbing shoes, sizes and fit ratings.");
    expect(html).not.toContain("opacity:0");
  });
});
