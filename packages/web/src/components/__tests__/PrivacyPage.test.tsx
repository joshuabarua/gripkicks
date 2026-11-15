import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PrivacyPage from "@/app/privacy/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/privacy", useRouter: () => ({ push: vi.fn() }) }));

describe("PrivacyPage", () => {
  it("uses the lab header with a last-updated date", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toHaveClass("lab-title");
    expect(screen.getByText(/^Last updated \d{1,2} \w+ \d{4}\.$/)).toBeInTheDocument();
  });

  it("links each section from the contents rail", () => {
    render(<PrivacyPage />);
    const nav = screen.getByRole("navigation", { name: "Privacy sections" });
    for (const link of within(nav).getAllByRole("link")) {
      const id = link.getAttribute("href")!.slice(1);
      expect(document.getElementById(id)).toBeInTheDocument();
    }
  });

  it("discloses usage analytics alongside account data", () => {
    render(<PrivacyPage />);
    const table = screen.getByRole("table");
    for (const row of ["Account basics", "Foot profile", "Shoe ratings", "Shoe collection", "Usage analytics"]) {
      expect(within(table).getByRole("rowheader", { name: row })).toBeInTheDocument();
    }
    expect(within(table).getByText(/PostHog in the EU/)).toBeInTheDocument();
    expect(within(table).getByText(/never to your name or email\. No cookies or local storage\./)).toBeInTheDocument();
    expect(screen.queryByText(/hidden tracking/i)).toBeNull();
    expect(screen.queryByText(/device fingerprints/i)).toBeNull();
    expect(within(table).queryByText(/location/i)).toBeNull();
  });

  it("offers deletion, a data copy by email and a contact address", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("link", { name: "Open profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "Request data" })).toHaveAttribute("href", expect.stringMatching(/^mailto:gripkicksofficial@gmail\.com/));
    expect(screen.queryByText(/export/i)).toBeNull();
  });

  it("avoids promotional stats", () => {
    render(<PrivacyPage />);
    expect(screen.queryByText("0%")).toBeNull();
    expect(screen.queryByText("100%")).toBeNull();
  });
});
