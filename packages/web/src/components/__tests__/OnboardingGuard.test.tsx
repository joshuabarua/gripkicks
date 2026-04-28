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

function renderWithWrapper(content: React.ReactNode) {
  return render(content, { wrapper });
}

function setupMockSession(data: any = null, isPending: boolean = false) {
  mockUseSession.mockReturnValue({ data, isPending });
}

function setupMockOnboardingComplete(complete: boolean = true) {
  mockFetchApi.mockResolvedValue({
    isOk: () => true,
    value: { onboardingComplete: complete },
  });
}

function setupMockApiError() {
  mockFetchApi.mockRejectedValue(new Error("Network error"));
}

function setupMockApiResponseError() {
  mockFetchApi.mockResolvedValue({
    isOk: () => false,
    error: new Error("Server error"),
  });
}

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
    setupMockSession();

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Public Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it("renders children immediately for auth paths", () => {
    mockUsePathname.mockReturnValue("/auth/login");
    setupMockSession();

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Auth Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it("renders children immediately for onboarding path", () => {
    mockUsePathname.mockReturnValue("/onboarding");
    setupMockSession();

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Onboarding Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(mockFetchApi).not.toHaveBeenCalled();
  });

  it("renders children while session is loading (loading shown via global overlay)", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    setupMockSession(null, true);

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("renders children for unauthenticated users on protected paths", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    setupMockSession();

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockFetchApi).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children when onboarding is incomplete (no redirect)", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    setupMockSession({ user: { id: "user-1" } });
    setupMockOnboardingComplete(false);

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockFetchApi).toHaveBeenCalledWith("/api/v1/profile");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children when onboarding is complete", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    setupMockSession({ user: { id: "user-1" } });
    setupMockOnboardingComplete(true);

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles API errors gracefully and renders children", async () => {
    mockUsePathname.mockReturnValue("/dashboard");
    setupMockSession({ user: { id: "user-1" } });
    setupMockApiError();

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>
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
    setupMockSession({ user: { id: "user-1" } });
    setupMockApiResponseError();

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Foot Lab Content</div>
      </OnboardingGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("renders children for footscan path even when onboarding incomplete", async () => {
    mockUsePathname.mockReturnValue("/footscan");
    setupMockSession({ user: { id: "user-1" } });
    setupMockOnboardingComplete(false);

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Foot Lab Content</div>
      </OnboardingGuard>
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
    setupMockSession(null, true);

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderWithWrapper(
      <OnboardingGuard>
        <div data-testid="protected-content">Protected Content</div>
      </OnboardingGuard>
    );

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
      setupMockSession({ user: { id: "user-1" } });
      setupMockOnboardingComplete(false);

      const { unmount } = renderWithWrapper(
        <OnboardingGuard>
          <div data-testid="protected-content">Content for {path}</div>
        </OnboardingGuard>
      );

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
      unmount();
    }
  });
});
