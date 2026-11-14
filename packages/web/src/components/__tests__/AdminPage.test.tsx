import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import AdminDashboard from "@/app/admin/AdminPage";

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  push: vi.fn(),
  query: vi.fn(),
  paginatedQuery: vi.fn(),
  mutation: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useSession: mocks.session }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin", useRouter: () => ({ push: mocks.push, replace: vi.fn() }) }));
vi.mock("convex/react", () => ({ useQuery: mocks.query, usePaginatedQuery: mocks.paginatedQuery, useMutation: mocks.mutation }));
vi.mock("@/components/ShoeImage", () => ({ default: () => <div /> }));
vi.mock("@/components/ShoeImageUpload", () => ({ default: () => <div /> }));
vi.mock("@/components/ui/UserAvatar", () => ({ UserAvatar: () => <div /> }));
vi.mock("@/components/admin/BacklogManager", () => ({ BacklogManager: () => <div>Backlog manager</div> }));

const shoe = { _id: "shoe-1", name: "Drago", brand: "Scarpa", modelName: "Drago", variantLabel: "LV", slug: "scarpa/drago", gender: "unisex", aggressiveness: "aggressive", stiffness: "soft", climbingDiscipline: "bouldering", volume: "low", rubberTechnology: { brand: "Vibram", compound: "XS Grip 2", stickiness: "high", durability: "medium" } };
const user = { _id: "user-2", name: "Ada Climber", email: "ada@example.com", footShape: "Greek", footVolume: "Medium", isAdmin: false, onboardingComplete: true, emailVerified: true };
const queries: Record<string, unknown> = {
  "shoes:listBrands": ["Scarpa"],
  "rubberTechnologies:list": [{ _id: "rubber-1", brand: "Vibram", compound: "XS Grip 2" }],
  "shoes:getMissingRubberTechnologyReport": [],
};
const paginated: Record<string, unknown[]> = { "shoes:searchCatalog": [shoe], "users:list": [user] };
const setSession = (isAdmin: boolean) =>
  mocks.session.mockReturnValue({ data: { user: { id: "user-1", name: "Josh", isAdmin } }, isPending: false });

beforeEach(() => {
  mocks.query.mockImplementation((ref: unknown, args: unknown) => (args === "skip" ? undefined : queries[getFunctionName(ref as never)]));
  mocks.paginatedQuery.mockImplementation((ref: unknown, args: unknown) => ({
    results: args === "skip" ? [] : (paginated[getFunctionName(ref as never)] ?? []),
    status: "Exhausted",
    loadMore: vi.fn(),
  }));
  mocks.mutation.mockReturnValue(vi.fn());
  setSession(true);
});

describe("AdminDashboard", () => {
  it("denies access to non-admins and sends them home", () => {
    setSession(false);
    render(<AdminDashboard />);
    expect(screen.getByRole("heading", { name: "Access Denied" })).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).toBeNull();
    expect(mocks.push).toHaveBeenCalledWith("/", { transitionTypes: ["page-nav"] });
  });

  it("shows the shoe catalog to admins", () => {
    render(<AdminDashboard />);
    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toHaveClass("lab-title");
    expect(screen.getByRole("button", { name: /Shoes \(1\)/ })).toHaveClass("bg-accent");
    expect(screen.getByRole("button", { name: /Users \(1\)/ })).toBeInTheDocument();
    expect(screen.getByText("1 shoes loaded")).toBeInTheDocument();
    expect(screen.getByText("scarpa/drago")).toBeInTheDocument();
    expect(screen.getByText("Vibram XS Grip 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Backfill Rubber (0)" })).toBeDisabled();
  });

  it("edits a shoe row inline and opens the add shoe form", () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByDisplayValue("scarpa/drago")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Cancel"));
    expect(screen.queryByDisplayValue("scarpa/drago")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add Shoe" }));
    expect(screen.getByRole("heading", { name: "Add New Shoe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Shoe" })).toBeDisabled();
  });

  it("switches to the users and backlog tabs", () => {
    render(<AdminDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Users \(1\)/ }));
    expect(screen.getByText("1 users in database")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search users..."), { target: { value: "nobody" } });
    expect(screen.getByText("0 users in database")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Backlog" }));
    expect(screen.getByText("Backlog manager")).toBeInTheDocument();
    expect(screen.queryByText("ada@example.com")).toBeNull();
  });
});
