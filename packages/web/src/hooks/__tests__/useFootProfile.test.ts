import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  normalizeBackendFootProfile,
  useFootProfile,
} from "@/hooks/useFootProfile";

const { useQueryMock, useSessionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  useSessionMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/lib/auth", () => ({
  useSession: useSessionMock,
}));

function mockAuth({
  session,
  sessionPending = false,
  convexUser,
}: {
  session: { user: { id: string } } | null | undefined;
  sessionPending?: boolean;
  convexUser: unknown;
}) {
  useSessionMock.mockReturnValue({
    data: session,
    isPending: sessionPending,
  });
  useQueryMock.mockReturnValue(convexUser);
}

describe("normalizeBackendFootProfile", () => {
  it("maps lowercase backend values to the capitalized FootProfile shape", () => {
    expect(
      normalizeBackendFootProfile({ footShape: "greek", footVolume: "low" }),
    ).toEqual({ shape: "Greek", volume: "Low" });
  });

  it("returns null when either field is missing or unrecognized", () => {
    expect(
      normalizeBackendFootProfile({ footShape: "greek", footVolume: null }),
    ).toBeNull();
    expect(
      normalizeBackendFootProfile({ footShape: null, footVolume: "low" }),
    ).toBeNull();
    expect(
      normalizeBackendFootProfile({ footShape: "alien", footVolume: "low" }),
    ).toBeNull();
  });
});

describe("useFootProfile", () => {
  it("reports loading while the session is pending", () => {
    mockAuth({ session: undefined, sessionPending: true, convexUser: undefined });
    const { result } = renderHook(() => useFootProfile());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it("reports loading while the user query resolves", () => {
    mockAuth({
      session: { user: { id: "better-auth-1" } },
      convexUser: undefined,
    });
    const { result } = renderHook(() => useFootProfile());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it("returns the capitalized profile once the user resolves", () => {
    mockAuth({
      session: { user: { id: "better-auth-1" } },
      convexUser: { _id: "user-1", footShape: "egyptian", footVolume: "high" },
    });
    const { result } = renderHook(() => useFootProfile());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toEqual({
      shape: "Egyptian",
      volume: "High",
    });
  });

  it("distinguishes a genuinely unset profile from a loading one", () => {
    mockAuth({
      session: { user: { id: "better-auth-1" } },
      convexUser: { _id: "user-1", name: "No Feet" },
    });
    const { result } = renderHook(() => useFootProfile());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
  });

  it("is not loading and has no profile when logged out", () => {
    mockAuth({ session: null, convexUser: undefined });
    const { result } = renderHook(() => useFootProfile());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.profile).toBeNull();
  });
});
