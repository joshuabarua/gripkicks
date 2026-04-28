import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { ResultAsync, ok } from "neverthrow";

vi.mock("@/lib/auth", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  fetchApi: vi.fn(),
}));

function mockSessionWithUser() {
  return {
    data: {
      user: {
        id: "test-id",
        email: "test@example.com",
        name: "Test",
        emailVerified: true,
        createdAt: new Date(),
      },
      session: {
        id: "session-id",
        createdAt: new Date(),
        userId: "test-id",
        expiresAt: new Date(Date.now() + 86400000),
      },
    },
    isPending: false,
    error: null,
    isRefetching: false,
    refetch: vi.fn(),
  };
}

function mockSessionWithoutUser() {
  return {
    data: null,
    isPending: false,
    error: null,
    isRefetching: false,
    refetch: vi.fn(),
  };
}

describe("useSubscription", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns default values when no session", async () => {
    const { useSession } = await import("@/lib/auth");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue(mockSessionWithoutUser());

    const { useSubscription } = await import("@/hooks/useSubscription");
    const { result } = renderHook(() => useSubscription());

    expect(result.current.isPremium).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it("fetches subscription data when session exists", async () => {
    const { useSession } = await import("@/lib/auth");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue(mockSessionWithUser());

    const { fetchApi } = await import("@/lib/api-client");
    (fetchApi as ReturnType<typeof vi.fn>).mockReturnValue(
      ResultAsync.fromSafePromise(
        Promise.resolve({
          subscriptionStatus: "active",
          subscriptionTier: "monthly",
          isPremium: true,
        }),
      ),
    );

    const { useSubscription } = await import("@/hooks/useSubscription");
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isPremium).toBe(true);
    });

    expect(result.current.subscriptionTier).toBe("monthly");
  });

  it("provides refresh function", async () => {
    const { useSession } = await import("@/lib/auth");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue(mockSessionWithUser());

    const { fetchApi } = await import("@/lib/api-client");
    (fetchApi as ReturnType<typeof vi.fn>).mockReturnValue(
      ok({
        subscriptionStatus: null,
        subscriptionTier: null,
        isPremium: false,
      }),
    );

    const { useSubscription } = await import("@/hooks/useSubscription");
    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe("function");
    expect(fetchApi).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
    });

    expect(fetchApi).toHaveBeenCalledTimes(2);
  });
});
