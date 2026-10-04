import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFindMyShoe } from "@/hooks/useFindMyShoe";

const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), query: vi.fn() }));
vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: mocks.currentUser }));
vi.mock("convex/react", () => ({ useQuery: mocks.query }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.currentUser.mockReturnValue({ convexUser: { _id: "user-1" }, isLoading: false });
  mocks.query.mockReturnValueOnce([]).mockReturnValue(undefined);
});

describe("Sole Mate loading", () => {
  it("does not wait forever for a skipped recommendation query without a profile", () => {
    const { result } = renderHook(() => useFindMyShoe());
    expect(result.current.hasProfile).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("still waits for recommendations when a full profile is available", () => {
    mocks.currentUser.mockReturnValue({ convexUser: { _id: "user-1", footShape: "Egyptian", footVolume: "Low" }, isLoading: false });
    const { result } = renderHook(() => useFindMyShoe());
    expect(result.current.hasProfile).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });
});
