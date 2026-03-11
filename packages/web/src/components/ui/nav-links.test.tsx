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

vi.mock("@/components/ui/AnimatedNavIcon", () => ({
  AnimatedNavIcon: ({ icon }: { icon: ReactNode }) => <span>{icon}</span>,
}));

import NavLinks from "@/components/ui/nav-links";

describe("NavLinks", () => {
  it("does not expose 3D Selector in navigation", () => {
    render(<NavLinks />);

    expect(screen.queryByText(/3d selector/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /3d selector/i })).not.toBeInTheDocument();
  });
});
