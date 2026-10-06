import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/auth", () => ({
  useSession: () => ({ data: null }),
}));

import NavLinks from "@/components/ui/nav-links";

describe("NavLinks", () => {
  it("does not expose 3D Selector in navigation", () => {
    render(<NavLinks />);

    expect(screen.queryByText(/3d selector/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /3d selector/i })).not.toBeInTheDocument();
  });

  it("renders profileSlot between the main links and the footer", () => {
    render(<NavLinks profileSlot={<div>profile-slot</div>} />);

    const slot = screen.getByText("profile-slot");
    const matcher = screen.getByRole("link", { name: /matcher/i });
    const about = screen.getByRole("link", { name: /about/i });

    expect(matcher.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(slot.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
