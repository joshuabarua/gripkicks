import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/profile/ProfilePage";

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
  usePathname: () => "/profile",
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/lib/api-client", () => ({
  fetchApi: vi.fn(async () => ({
    isOk: () => true,
    value: { id: "user-1", name: "Josh Climber", email: "josh@example.com", onboardingComplete: true },
  })),
}));
vi.mock("@/contexts/LoadingContext", () => ({ useLoading: () => ({ showLoader: vi.fn(), hideLoader: vi.fn() }) }));
vi.mock("@/hooks/useFootProfile", () => ({ useFootProfile: () => ({ profile: null, isLoading: false }) }));
vi.mock("@/hooks/useUserData", () => ({ useUserData: () => ({ userData: null, userStashData: [], isLoading: false }) }));
vi.mock("@/components/ui/UserAvatar", () => ({ UserAvatar: () => <div /> }));
vi.mock("@/components/ProfileForm", () => ({ ProfileForm: () => <div>Profile form</div> }));
vi.mock("@/components/PasswordChangeForm", () => ({ PasswordChangeForm: () => <div /> }));
vi.mock("@/components/EmailChangeForm", () => ({ EmailChangeForm: () => <div /> }));
vi.mock("@/components/AccountDeletion", () => ({ AccountDeletion: () => <div /> }));

const loggedIn = { isPending: false, data: { user: { id: "user-1", name: "Josh Climber", email: "josh@example.com" } }, error: null };

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/profile");
  mocks.session.mockReturnValue(loggedIn);
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("ProfilePage auth gate", () => {
  it("shows a loading state while the session is pending", () => {
    mocks.session.mockReturnValue({ isPending: true, data: null, error: null });
    render(<ProfilePage />);
    expect(screen.getByRole("status", { name: "Loading profile" })).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps loading and redirects to login when confirmed logged out", () => {
    mocks.session.mockReturnValue({ isPending: false, data: null, error: null });
    render(<ProfilePage />);
    expect(screen.getByRole("status", { name: "Loading profile" })).toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledWith("/auth/login?callbackUrl=%2Fprofile", { transitionTypes: ["page-nav"] });
  });

  it("toggles aria-expanded on the Profile information section", async () => {
    render(<ProfilePage />);
    await act(async () => {});
    expect(mocks.replace).not.toHaveBeenCalled();
    const toggle = screen.getByRole("button", { name: /Profile Information/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Profile form")).toBeInTheDocument();
  });
});
