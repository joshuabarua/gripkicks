import { renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useShoeScoring } from "@/hooks/useShoeScoring";

const mocks = vi.hoisted(() => ({ query: vi.fn(() => []) }));
vi.mock("convex/react", () => ({ useQuery: mocks.query, usePaginatedQuery: () => ({ results: [], status: "Exhausted", loadMore: vi.fn() }) }));
vi.mock("@/hooks/useFootProfile", () => ({ useFootProfile: () => ({ profile: { shape: "Roman", volume: "Low" }, isLoading: false }) }));
vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: () => ({ convexUser: { _id: "user-1" } }) }));
vi.mock("@/hooks/useUserPreferenceLearning", () => ({ useUserPreferenceLearning: () => ({ userPreferenceProfile: null, isLearningReady: false }) }));

it("queries Sole Mate ratings with the lowercase profile values stored in the database", () => {
  renderHook(() => useShoeScoring());
  expect(mocks.query).toHaveBeenLastCalledWith(expect.anything(), { footShape: "roman", footVolume: "low" });
});
