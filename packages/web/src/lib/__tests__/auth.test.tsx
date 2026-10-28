import type { PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { ConvexProviderWithAuth, useConvexAuth } from "convex/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  safeCallbackPath,
  useBetterAuthForConvex,
  useRedirectIfAuthenticated,
  useRequireAuth,
} from "@/lib/auth";

const { useSessionMock, tokenMock, replaceMock, pushMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  tokenMock: vi.fn(),
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("better-auth/react", () => ({
  createAuthClient: () => ({
    useSession: useSessionMock,
    token: tokenMock,
  }),
}));

vi.mock("better-auth/client/plugins", () => ({
  jwtClient: () => ({}),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

beforeEach(() => {
  replaceMock.mockClear();
  pushMock.mockClear();
  window.history.replaceState({}, "", "/");
  useSessionMock.mockReturnValue({
    isPending: false,
    data: { user: { id: "user-1" } },
  });
  tokenMock.mockResolvedValue({ data: { token: "access-token" } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useBetterAuthForConvex", () => {
  it("keeps the token fetcher stable when the session snapshot changes", () => {
    const { result, rerender } = renderHook(useBetterAuthForConvex);
    const fetchAccessToken = result.current.fetchAccessToken;

    useSessionMock.mockReturnValue({
      isPending: false,
      data: { user: { id: "user-1", name: "Updated name" } },
    });
    rerender();

    expect(result.current.fetchAccessToken).toBe(fetchAccessToken);
  });

  it("returns the token or null when the token response has no data", async () => {
    const { result } = renderHook(useBetterAuthForConvex);

    await expect(result.current.fetchAccessToken()).resolves.toBe("access-token");

    tokenMock.mockResolvedValueOnce({ data: null });
    await expect(result.current.fetchAccessToken()).resolves.toBeNull();
  });

  it("does not restart Convex authentication after confirmation or rerender", () => {
    let onAuthChange: ((authenticated: boolean) => void) | undefined;
    const client = {
      setAuth: vi.fn((_fetchToken: unknown, onChange: (authenticated: boolean) => void) => {
        onAuthChange = onChange;
      }),
      clearAuth: vi.fn(),
    };
    const wrapper = ({ children }: PropsWithChildren) => (
      <ConvexProviderWithAuth client={client} useAuth={useBetterAuthForConvex}>
        {children}
      </ConvexProviderWithAuth>
    );
    const { result, rerender, unmount } = renderHook(useConvexAuth, { wrapper });

    expect(result.current).toEqual({ isLoading: true, isAuthenticated: false });
    expect(client.setAuth).toHaveBeenCalledTimes(1);
    const confirmAuthentication = onAuthChange;
    if (!confirmAuthentication) throw new Error("Convex did not register authentication");

    act(() => confirmAuthentication(true));
    rerender();

    expect(result.current).toEqual({ isLoading: false, isAuthenticated: true });
    expect(client.setAuth).toHaveBeenCalledTimes(1);
    expect(client.clearAuth).not.toHaveBeenCalled();

    unmount();
    expect(client.clearAuth).toHaveBeenCalledTimes(1);
  });
});

describe("safeCallbackPath", () => {
  it("keeps safe relative paths including search params", () => {
    expect(safeCallbackPath("/stash")).toBe("/stash");
    expect(safeCallbackPath("/matcher?tab=mate")).toBe("/matcher?tab=mate");
  });

  it("rejects protocol-relative and backslash-escaped URLs", () => {
    expect(safeCallbackPath("//evil.com")).toBe("/dashboard");
    expect(safeCallbackPath("/\\evil.com")).toBe("/dashboard");
  });

  it("rejects absolute URLs and empty values", () => {
    expect(safeCallbackPath("https://evil.com")).toBe("/dashboard");
    expect(safeCallbackPath(null)).toBe("/dashboard");
    expect(safeCallbackPath(undefined, "/footlab")).toBe("/footlab");
  });
});

describe("useRequireAuth", () => {
  it("redirects to login with the current path when confirmed signed out", () => {
    window.history.pushState({}, "", "/stash?foo=1");
    useSessionMock.mockReturnValue({ isPending: false, data: null, error: null });

    renderHook(() => useRequireAuth());

    expect(replaceMock).toHaveBeenCalledWith(
      `/auth/login?callbackUrl=${encodeURIComponent("/stash?foo=1")}`,
    );
  });

  it("does not redirect while the session is pending", () => {
    useSessionMock.mockReturnValue({ isPending: true, data: null, error: null });

    renderHook(() => useRequireAuth());

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("does not redirect when the session times out while pending", () => {
    vi.useFakeTimers();
    useSessionMock.mockReturnValue({ isPending: true, data: null, error: null });

    renderHook(() => useRequireAuth());
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects once a timed-out session later resolves as signed out", () => {
    vi.useFakeTimers();
    window.history.pushState({}, "", "/footlab");
    useSessionMock.mockReturnValue({ isPending: true, data: null, error: null });

    const { rerender } = renderHook(() => useRequireAuth());
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(replaceMock).not.toHaveBeenCalled();

    useSessionMock.mockReturnValue({ isPending: false, data: null, error: null });
    rerender();

    expect(replaceMock).toHaveBeenCalledWith(
      `/auth/login?callbackUrl=${encodeURIComponent("/footlab")}`,
    );
  });

  it("does not redirect when the session errored", () => {
    useSessionMock.mockReturnValue({
      isPending: false,
      data: null,
      error: new Error("network"),
    });

    renderHook(() => useRequireAuth());

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("does not redirect when signed in", () => {
    renderHook(() => useRequireAuth());

    expect(replaceMock).not.toHaveBeenCalled();
  });
});

describe("useRedirectIfAuthenticated", () => {
  it("redirects signed-in users to a safe callbackUrl", () => {
    window.history.pushState({}, "", "/auth/login?callbackUrl=/stash");

    renderHook(() => useRedirectIfAuthenticated());

    expect(replaceMock).toHaveBeenCalledWith("/stash");
  });

  it("falls back to the dashboard for unsafe callbackUrls", () => {
    window.history.pushState({}, "", "/auth/login?callbackUrl=//evil.com");

    renderHook(() => useRedirectIfAuthenticated());

    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });

  it("does not redirect when signed out", () => {
    useSessionMock.mockReturnValue({ isPending: false, data: null, error: null });

    renderHook(() => useRedirectIfAuthenticated());

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
