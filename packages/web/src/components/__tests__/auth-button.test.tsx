import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthButton from "@/components/auth-button";

describe("AuthButton", () => {
  it("renders Sign In link with correct href", () => {
    render(<AuthButton />);

    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/auth/login");
  });

  it("has correct styling classes", () => {
    render(<AuthButton />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("inline-flex");
    expect(link).toHaveClass("h-8");
    expect(link).toHaveClass("rounded-sm");
    expect(link).toHaveClass("border-brand-red/40");
    expect(link).toHaveClass("bg-transparent");
    expect(link).toHaveClass("text-white");
  });

  it("displays correct text", () => {
    render(<AuthButton />);

    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("has hover transition classes", () => {
    render(<AuthButton />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("transition-all");
    expect(link).toHaveClass("duration-500");
    expect(link).toHaveClass("hover:border-brand-red");
    expect(link).toHaveClass("hover:bg-brand-red");
    expect(link).toHaveClass("hover:text-black");
  });
});
