import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingPage from "@/app/onboarding/page";
import type { Shoe } from "@/types/api";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  convexUser: vi.fn(),
  mutation: vi.fn(),
  fetchApi: vi.fn(),
  push: vi.fn(),
}));

const shoe: Shoe = { _id: "shoe-1", name: "Origin", brand: "Scarpa", aggressiveness: "flat", stiffness: "medium", climbingDiscipline: "sport", volume: "medium" };

vi.mock("@/lib/auth", () => ({ useSession: mocks.session }));
vi.mock("convex/react", () => ({ useQuery: mocks.convexUser, useMutation: () => mocks.mutation }));
vi.mock("next/navigation", () => ({ usePathname: () => "/onboarding", useRouter: () => ({ push: mocks.push, replace: vi.fn() }) }));
vi.mock("@/lib/api-client", () => ({ fetchApi: mocks.fetchApi }));
vi.mock("@/components/matcher/FirstShoeQuiz", () => ({ FirstShoeQuiz: () => <div /> }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));
vi.mock("@/components/ShoeSearch", () => ({
  ShoeSearch: ({ onShoeSelect }: { onShoeSelect: (shoe: Shoe) => void }) => (
    <button type="button" onClick={() => onShoeSelect(shoe)}>Pick Origin</button>
  ),
}));
// Radix Select does not open in jsdom, so render a native select instead.
vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      <option value="" />
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
}));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
  mocks.session.mockReturnValue({ data: { user: { id: "user-1" } }, isPending: false, error: null });
  mocks.convexUser.mockReturnValue({ _id: "convex-user-1" });
  mocks.mutation.mockResolvedValue("user-shoe-1");
  mocks.fetchApi.mockResolvedValue({ isOk: () => true, isErr: () => false, value: {} });
});

describe("OnboardingPage", () => {
  it("renders the welcome step first", () => {
    render(<OnboardingPage />);
    expect(screen.getByRole("heading", { level: 1, name: "WELCOME" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
  });

  it("walks through each step and saves the first shoe", async () => {
    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole("button", { name: "LET'S GET STARTED" }));
    expect(await screen.findByRole("heading", { name: "FOOT SHAPE" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Egyptian/ }));
    fireEvent.click(screen.getByRole("button", { name: /Medium/ }));
    fireEvent.click(screen.getByRole("button", { name: /NEXT/ }));
    await waitFor(() =>
      expect(mocks.fetchApi).toHaveBeenCalledWith("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({ footShape: "egyptian", footVolume: "medium" }),
      }),
    );

    fireEvent.click(await screen.findByRole("button", { name: "I know my shoe — search instead" }));
    expect(await screen.findByRole("heading", { name: "ADD YOUR FIRST SHOE" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pick Origin" }));
    fireEvent.change(screen.getAllByRole("combobox")[0]!, { target: { value: "US Y10 / UK 9.5 / EU 27.5" } });
    fireEvent.click(screen.getByRole("button", { name: /COMPLETE SETUP/ }));

    await waitFor(() =>
      expect(mocks.mutation).toHaveBeenCalledWith({ userId: "convex-user-1", shoeId: "shoe-1" }),
    );
    expect(mocks.mutation).toHaveBeenCalledWith({
      userShoeId: "user-shoe-1",
      size: "US Y10 / UK 9.5 / EU 27.5",
      condition: "new",
      comfortScore: 5,
      performanceRating: 5,
    });
    expect(mocks.fetchApi).toHaveBeenCalledWith("/api/v1/onboarding", {
      method: "POST",
      body: JSON.stringify({ footShape: "egyptian", favoriteShoeId: "shoe-1" }),
    });

    expect(await screen.findByRole("heading", { level: 1, name: "ALL SET" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "GO TO SHOE SANCTUARY" }));
    expect(mocks.push).toHaveBeenCalledWith("/stash", { transitionTypes: ["page-nav"] });
  });
});
