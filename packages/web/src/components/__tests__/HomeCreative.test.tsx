import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
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

  it("sends signed-in climbers to their dashboard", () => {
    mocks.session.mockReturnValue({ data: { user: { id: "user-1" } } });
    render(<HomeCreative />);
    expect(screen.getByRole("link", { name: "Open dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("link", { name: "Create account" })).toBeNull();
  });

  it("keeps the four tools distinct without repeating a setup section", () => {
    render(<HomeCreative />);
    expect(screen.getByRole("link", { name: /Foot Lab/ })).toHaveAttribute("href", "/footlab");
    expect(screen.getByRole("link", { name: /Sanctuary/ })).toHaveAttribute("href", "/stash");
    expect(screen.getByRole("link", { name: /Matcher/ })).toHaveAttribute("href", "/matcher");
    expect(screen.getByRole("link", { name: /Sole Mate/ })).toHaveAttribute("href", "/matcher?tab=mate");
    expect(screen.queryByText("How it works")).toBeNull();
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
