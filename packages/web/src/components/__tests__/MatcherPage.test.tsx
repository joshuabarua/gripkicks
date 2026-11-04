import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MatcherPage from "@/app/matcher/page";

const mocks = vi.hoisted(() => ({ session: vi.fn(), params: vi.fn(), matches: vi.fn(), replace: vi.fn() }));
vi.mock("better-auth/react", () => ({
  createAuthClient: () => ({ useSession: mocks.session, token: vi.fn() }),
}));
vi.mock("better-auth/client/plugins", () => ({ jwtClient: () => ({}) }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/matcher",
  useSearchParams: mocks.params,
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
}));
vi.mock("@/components/shoe/MatcherView", () => ({ MatcherView: () => <div>Ranked shoe matches</div> }));
vi.mock("@/hooks/useFindMyShoe", () => ({ useFindMyShoe: mocks.matches }));

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/matcher");
  mocks.session.mockReturnValue({ isPending: false, data: { user: { id: "user-1" } }, error: null });
  mocks.params.mockReturnValue(new URLSearchParams());
  mocks.matches.mockReturnValue({ soleMateMatches: [], isLoading: false, hasProfile: true });
});

describe("Matcher page navigation", () => {
  it("opens Sole Mate from existing dashboard and homepage deep links", () => {
    mocks.params.mockReturnValue(new URLSearchParams("tab=mate"));
    render(<MatcherPage />);
    expect(screen.getByRole("link", { name: "Sole Mate" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("No sole mates yet")).toBeInTheDocument();
    expect(screen.queryByText("Ranked shoe matches")).toBeNull();
  });

  it("keeps both destinations available as keyboard-accessible links", () => {
    render(<MatcherPage />);
    expect(screen.getByRole("link", { name: "Shoe matches" })).toHaveAttribute("href", "/matcher");
    expect(screen.getByRole("link", { name: "Sole Mate" })).toHaveAttribute("href", "/matcher?tab=mate");
    expect(screen.getByText("Ranked shoe matches")).toBeInTheDocument();
  });

  it("offers a direct profile setup link without nested buttons", () => {
    mocks.params.mockReturnValue(new URLSearchParams("tab=mate"));
    mocks.matches.mockReturnValue({ soleMateMatches: [], isLoading: false, hasProfile: false });
    render(<MatcherPage />);
    expect(screen.getByRole("link", { name: "Set up foot profile" })).toHaveAttribute("href", "/footlab");
    expect(document.querySelector("a button")).toBeNull();
  });

  it("keeps loading and redirects to login when confirmed signed out", () => {
    mocks.session.mockReturnValue({ isPending: false, data: null, error: null });
    render(<MatcherPage />);
    expect(screen.getByRole("status", { name: "Loading matcher" })).toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledWith("/auth/login?callbackUrl=%2Fmatcher", { transitionTypes: ["page-nav"] });
    expect(screen.queryByText("Ranked shoe matches")).toBeNull();
  });

  it("shows a loading state while the session is pending", () => {
    mocks.session.mockReturnValue({ isPending: true, data: null, error: null });
    render(<MatcherPage />);
    expect(screen.getByRole("status", { name: "Loading matcher" })).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
