import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage, { DashboardOverview } from "@/app/dashboard/DashboardPage";
import type { UserShoe } from "@/types/api";

const mocks = vi.hoisted(() => ({ session: vi.fn(), profile: vi.fn(), userData: vi.fn(), replace: vi.fn(), showLoader: vi.fn(), hideLoader: vi.fn() }));
vi.mock("better-auth/react", () => ({
  createAuthClient: () => ({ useSession: mocks.session, token: vi.fn() }),
}));
vi.mock("better-auth/client/plugins", () => ({ jwtClient: () => ({}) }));
vi.mock("@/hooks/useFootProfile", () => ({ useFootProfile: mocks.profile }));
vi.mock("@/hooks/useUserData", () => ({ useUserData: mocks.userData }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ replace: mocks.replace, push: vi.fn() }) }));
vi.mock("@/contexts/LoadingContext", () => ({ useLoading: () => ({ showLoader: mocks.showLoader, hideLoader: mocks.hideLoader }) }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));

const shoe: UserShoe = { _id: "stash-1", shoeId: "shoe-1", shoe: { _id: "shoe-1", name: "Origin Women's", modelName: "Origin", brand: "Scarpa", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "sport", volume: "medium" } };
const setShoes = (userStashData: UserShoe[] | undefined) => mocks.userData.mockReturnValue({ userData: { name: "Josh Climber" }, userStashData, isLoading: false });

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/dashboard");
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
  mocks.session.mockReturnValue({ data: { user: { id: "user-1", name: "Josh Climber" } }, isPending: false, error: null });
  mocks.profile.mockReturnValue({ profile: { shape: "Egyptian", volume: "Low" }, isLoading: false });
  setShoes([shoe]);
});

describe("DashboardPage", () => {
  it("renders visible content before hydration without a device-dependent entrance fade", () => {
    const html = renderToStaticMarkup(<DashboardOverview firstName="Josh" userShoes={[shoe]} footProfile={{ shape: "Egyptian", volume: "Low" }} />);
    expect(html).toContain("Find your next shoe");
    expect(html).not.toMatch(/opacity:\s*0[";]/);
    expect(html).not.toContain("translateY(");
  });

  it("shows one primary matching action without duplicate navigation tiles", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("link", { name: "Find shoes" })).toHaveAttribute("href", "/matcher?tab=mate");
    expect(screen.queryByText("Where to next?")).toBeNull();
    expect(screen.queryByText("Sole Mate")).toBeNull();
    expect(screen.queryByText("Matcher")).toBeNull();
  });

  it("uses the Lab header on a black canvas", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("main")).toHaveClass("bg-black");
    expect(screen.getByRole("heading", { name: "Dashboard", level: 1 })).toHaveClass("lab-title");
    expect(screen.getByText("Hey Josh")).toHaveClass("font-mono");
  });

  it("styles dashboard actions with lab buttons and glows the next step", () => {
    render(<DashboardPage />);
    const nextStep = screen.getByRole("region", { name: "Find your next shoe" });
    expect(nextStep).toHaveClass("lab-card", "lab-card-active");
    const primary = screen.getByRole("link", { name: "Find shoes" });
    expect(primary).toHaveClass("lab-button");
    for (const name of ["Open Sanctuary", "Edit foot profile"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveClass("lab-button-ghost");
      expect(link.className).not.toContain("underline");
    }
  });

  it("prioritizes creating a missing foot profile", () => {
    mocks.profile.mockReturnValue({ profile: null, isLoading: false });
    render(<DashboardPage />);
    expect(screen.getByRole("link", { name: "Set up foot profile" })).toHaveAttribute("href", "/footlab");
    expect(screen.queryByRole("link", { name: "Find shoes" })).toBeNull();
  });

  it("prioritizes adding a shoe after the foot profile is complete", () => {
    setShoes([]);
    render(<DashboardPage />);
    expect(screen.getByRole("link", { name: "Add first shoe" })).toHaveAttribute("href", "/stash");
    expect(screen.getByText("No shoes added yet")).toBeInTheDocument();
  });

  it("averages only valid comfort ratings", () => {
    setShoes([{ ...shoe, comfortScore: 8 }, { ...shoe, _id: "stash-2", comfortScore: 6 }, { ...shoe, _id: "stash-3" }, { ...shoe, _id: "stash-4", comfortScore: 0 }]);
    render(<DashboardPage />);
    expect(screen.getByText("7.0")).toBeInTheDocument();
    expect(screen.getByText("2 rated shoes")).toBeInTheDocument();
  });

  it("does not present missing ratings as zero", () => {
    render(<DashboardPage />);
    expect(screen.getByText("No rated shoes")).toBeInTheDocument();
    expect(screen.getAllByText("Not rated").length).toBeGreaterThanOrEqual(2);
  });

  it("waits for the stash query instead of showing a false empty state", () => {
    setShoes(undefined);
    render(<DashboardPage />);
    expect(screen.getByRole("status", { name: "Loading dashboard" })).toBeInTheDocument();
    expect(screen.queryByText("No shoes added yet")).toBeNull();
    expect(screen.queryByRole("link", { name: "Add first shoe" })).toBeNull();
    expect(mocks.showLoader).toHaveBeenCalledWith("dashboard");
  });

  it("uses keyboard-accessible links and preserves shoe variant names", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("link", { name: /Scarpa Origin Women's/ })).toHaveAttribute("href", "/stash");
    expect(screen.getByRole("link", { name: "Edit foot profile" })).toHaveAttribute("href", "/footlab");
  });

  it("keeps loading and redirects to login when confirmed signed out", () => {
    mocks.session.mockReturnValue({ data: null, isPending: false, error: null });
    render(<DashboardPage />);
    expect(mocks.replace).toHaveBeenCalledWith("/auth/login?callbackUrl=%2Fdashboard", { transitionTypes: ["page-nav"] });
    expect(screen.getByRole("status", { name: "Loading dashboard" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Find shoes" })).toBeNull();
  });

  it("shows a loading state while the session is pending", () => {
    mocks.session.mockReturnValue({ data: null, isPending: true, error: null });
    render(<DashboardPage />);
    expect(screen.getByRole("status", { name: "Loading dashboard" })).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
