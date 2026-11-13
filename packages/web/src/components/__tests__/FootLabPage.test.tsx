import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FootLabPage from "@/app/footlab/page";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("better-auth/react", () => ({
  createAuthClient: () => ({ useSession: mocks.session, token: vi.fn() }),
}));
vi.mock("better-auth/client/plugins", () => ({ jwtClient: () => ({}) }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/footlab",
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/components/matcher/FirstShoeQuiz", () => ({ FirstShoeQuiz: () => <div /> }));
vi.mock("@/lib/api-client", () => ({
  fetchApi: vi.fn(async () => ({ isOk: () => true, isErr: () => false, value: {} })),
}));

const loggedIn = { isPending: false, data: { user: { id: "user-1" } }, error: null };

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/footlab");
  mocks.session.mockReturnValue(loggedIn);
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("FootLabPage auth gate", () => {
  it("shows a loading state while the session is pending", () => {
    mocks.session.mockReturnValue({ isPending: true, data: null, error: null });
    render(<FootLabPage />);
    expect(screen.getByRole("status", { name: "Loading foot lab" })).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps loading and redirects to login when confirmed logged out", () => {
    mocks.session.mockReturnValue({ isPending: false, data: null, error: null });
    render(<FootLabPage />);
    expect(screen.getByRole("status", { name: "Loading foot lab" })).toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledWith("/auth/login?callbackUrl=%2Ffootlab", { transitionTypes: ["page-nav"] });
  });

  it("does not redirect when signed in", () => {
    render(<FootLabPage />);
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: "Foot Lab" })).toBeInTheDocument();
  });
});
