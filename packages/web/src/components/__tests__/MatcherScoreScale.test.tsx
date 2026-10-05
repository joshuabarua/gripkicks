import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { QueryCtx } from "../../../../../convex/_generated/server";
import { getCommunityTopShoes } from "../../../../../convex/recommendations";
import { MatcherView } from "@/components/shoe/MatcherView";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: mocks.query }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));
vi.mock("@/hooks/useFootProfile", () => ({ useFootProfile: () => ({ profile: { shape: "Roman", volume: "Medium" } }) }));
vi.mock("@/hooks/useShoeScoring", () => ({ useShoeScoring: () => ({ scoredShoes: [], isLoading: false, stashCount: 0, ratedCount: 0 }) }));
vi.mock("@/hooks/useUserPreferenceLearning", () => ({ useUserPreferenceLearning: () => ({ userPreferenceProfile: null }) }));

it("displays real 8/10 community ratings as 80/100, not 159/100", async () => {
  const shoes = [{ _id: "shoe-1", brand: "Scarpa", name: "Test Shoe", volume: "medium", aggressiveness: "moderate", stiffness: "medium", climbingDiscipline: "sport" }];
  const ratings = Array.from({ length: 3 }, () => ({ shoeId: "shoe-1", comfortScore: 8, performanceRating: 8, durabilityRating: 8, fitLongevity: "3-6 months" }));
  const ctx = { db: { query: (table: string) => ({ collect: async () => table === "shoes" ? shoes : ratings }) } } as unknown as QueryCtx;
  const handler = (getCommunityTopShoes as unknown as { _handler: (ctx: QueryCtx, args: { limit: number }) => Promise<unknown> })._handler;
  mocks.query.mockReturnValue(await handler(ctx, { limit: 10 }));
  render(<MatcherView />);
  fireEvent.click(screen.getByRole("button", { name: /Community/ }));
  const card = within(screen.getByRole("article", { name: "Scarpa Test Shoe" }));
  expect(card.getByText("80/100")).toBeVisible();
  expect(card.queryByText("159/100")).toBeNull();
  fireEvent.click(screen.getByText("Compare ratings", { exact: true }));
  expect(screen.getAllByText("4.0")).toHaveLength(2);
  expect(screen.getByText("3.9")).toBeVisible();
});
