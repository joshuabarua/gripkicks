import React from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Footer from "@/components/Footer";

vi.mock("@/components/GrippyKickkyy", () => ({
  FooterGrippy: () => null,
}));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

describe("Footer", () => {
  it("keeps one About link and one Privacy link alongside product navigation", () => {
    render(<Footer />);
    const footer = within(screen.getByRole("contentinfo"));

    expect(footer.getAllByRole("link", { name: "About" })).toHaveLength(1);
    expect(footer.getAllByRole("link", { name: "Privacy" })).toHaveLength(1);
    expect(footer.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(footer.getByText("Company")).toBeInTheDocument();
    for (const name of ["Dashboard", "Foot Lab", "Sanctuary", "Matcher"]) {
      expect(footer.getByRole("link", { name })).toBeInTheDocument();
    }
    expect(footer.getByText(`\u00a9 ${new Date().getFullYear()} GripKicks`)).toBeInTheDocument();
  });
});
