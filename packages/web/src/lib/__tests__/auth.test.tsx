import type { PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { ConvexProviderWithAuth, useConvexAuth } from "convex/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBetterAuthForConvex } from "@/lib/auth";

const { useSessionMock, tokenMock } = vi.hoisted(() => ({
  useSessionMock: vi.fn(),
  tokenMock: vi.fn(),
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

beforeEach(() => {
  useSessionMock.mockReturnValue({
    isPending: false,
    data: { user: { id: "user-1" } },
  });
  tokenMock.mockResolvedValue({ data: { token: "access-token" } });
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
