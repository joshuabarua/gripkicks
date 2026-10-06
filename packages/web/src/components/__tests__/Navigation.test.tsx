import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navigation from "@/components/Navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/lib/auth", () => ({
  useSession: () => ({ data: { user: { id: "user-1", name: "Josh Climber", email: "josh@example.com" } }, isPending: false }),
}));
vi.mock("next/dynamic", () => ({ default: () => () => <span>GripKicks</span> }));
vi.mock("@/components/signout-button", () => ({
  SignOutButton: ({ children }: { children?: React.ReactNode }) => <button type="button">{children ?? "Sign out"}</button>,
}));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("Navigation", () => {
  it("renders the glassy transparent nav bar", () => {
    render(<Navigation />);
    const nav = document.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav).toHaveClass("bg-brand-base/55", "backdrop-blur-xl", "backdrop-saturate-150", "h-12");
  });

  it("opens the menu with the profile row clear of the close control", () => {
    const { container } = render(<Navigation />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.parentElement).toHaveClass("translate-y-[0.5px]");
    fireEvent.click(trigger);
    const closeTrigger = screen.getByRole("button", { name: "Close menu" });
    expect(closeTrigger).toHaveAttribute("aria-expanded", "true");
    const menu = container.querySelector(".nav-menu");
    expect(menu).not.toBeNull();
    const profile = within(menu as HTMLElement).getByRole("link", { name: /Profile/ });
    expect(profile).toBeInTheDocument();
    for (const label of ["Dashboard", "Foot Lab", "Sanctuary", "Matcher"]) {
      expect(within(menu as HTMLElement).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(menu as HTMLElement).getByText("Sign out")).toBeInTheDocument();
  });
});
