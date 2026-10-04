import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MatcherPage from "@/app/matcher/page";

const mocks = vi.hoisted(() => ({ session: vi.fn(), params: vi.fn(), matches: vi.fn() }));
vi.mock("@/lib/auth", () => ({ useSession: mocks.session }));
vi.mock("next/navigation", () => ({ useSearchParams: mocks.params }));
vi.mock("@/components/shoe/MatcherView", () => ({ MatcherView: () => <div>Ranked shoe matches</div> }));
vi.mock("@/hooks/useFindMyShoe", () => ({ useFindMyShoe: mocks.matches }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.session.mockReturnValue({ data: { user: { id: "user-1" } }, isPending: false });
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

  it("preserves the sign-in return destination", () => {
    mocks.session.mockReturnValue({ data: null, isPending: false });
    render(<MatcherPage />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth/login?callbackUrl=%2Fmatcher");
    expect(screen.queryByText("Ranked shoe matches")).toBeNull();
  });
});
