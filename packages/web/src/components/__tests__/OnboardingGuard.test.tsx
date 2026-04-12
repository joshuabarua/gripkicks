import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { LoadingProvider } from "@/contexts/LoadingContext";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  fetchApi: vi.fn(),
}));

const mockUsePathname = vi.fn();
const mockUseSession = vi.fn();
const mockFetchApi = vi.fn();

vi.mocked(await import("next/navigation")).usePathname = mockUsePathname;
vi.mocked(await import("@/lib/auth")).useSession = mockUseSession;
vi.mocked(await import("@/lib/api-client")).fetchApi = mockFetchApi;

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LoadingProvider>{children}</LoadingProvider>
  );

describe("OnboardingGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children immediately for public paths", () => {
    mockUsePathname.mockReturnValue("/");
    mockUseSession.mockReturnValue({ data: null, isPending: false });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Public Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it("renders children immediately for auth paths", () => {
    mockUsePathname.mockReturnValue("/auth/login");
    mockUseSession.mockReturnValue({ data: null, isPending: false });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Auth Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it("renders children immediately for onboarding path", () => {
    mockUsePathname.mockReturnValue("/onboarding");
    mockUseSession.mockReturnValue({ data: null, isPending: false });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Onboarding Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it("renders children while session is loading (loading shown via global overlay)", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({ data: null, isPending: true });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    // With global loading, children are always rendered
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("renders children for unauthenticated users on protected paths", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({ data: null, isPending: false });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockFetchApi).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children when onboarding is incomplete (no redirect)", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockFetchApi.mockResolvedValue({
      isOk: () => true,
      value: { onboardingComplete: false },
    });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockFetchApi).toHaveBeenCalledWith("/api/v1/profile");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children when onboarding is complete", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockFetchApi.mockResolvedValue({
      isOk: () => true,
      value: { onboardingComplete: true },
    });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles API errors gracefully and renders children", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockFetchApi.mockRejectedValue(new Error("Network error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to check onboarding status:",
      expect.any(Error),
    );
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("handles API error response and renders children", async () => {
    mockUsePathname.mockReturnValue("/footscan");
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockFetchApi.mockResolvedValue({
      isOk: () => false,
      error: new Error("Server error"),
    });

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Foot Lab Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children for footscan path even when onboarding incomplete", async () => {
    mockUsePathname.mockReturnValue("/footscan");
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    });
    mockFetchApi.mockResolvedValue({
      isOk: () => true,
      value: { onboardingComplete: false },
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Foot Lab Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "[OnboardingGuard] Onboarding incomplete — allowing access anyway",
    );
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("times out session loading after 5 seconds and logs warning", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseSession.mockReturnValue({ data: null, isPending: true });

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>,
      { wrapper }
    );

    // Children are always rendered with global loading
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();

    vi.advanceTimersByTime(5001);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[OnboardingGuard] Session loading timed out — rendering anyway",
    );

    consoleSpy.mockRestore();
  });

  it("works for all protected paths without blocking", async () => {
    const protectedPaths = ["/dashboard", "/profile", "/stash", "/matcher", "/recommendations"];

    for (const path of protectedPaths) {
      vi.clearAllMocks();
      mockUsePathname.mockReturnValue(path);
      mockUseSession.mockReturnValue({
        data: { user: { id: "user-1" } },
        isPending: false,
      });
      mockFetchApi.mockResolvedValue({
        isOk: () => true,
        value: { onboardingComplete: false },
      });

      const { unmount } = render(
        <OnboardingGuard>
          <div data-testid="protected-content">Content for {path}</div>
        </OnboardingGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
      unmount();
    }
  });
});
