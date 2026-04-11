import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders correctly", () => {
    render(<Label>Email Address</Label>);

    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("renders as label element", () => {
    render(<Label>Test Label</Label>);

    expect(screen.getByText("Test Label")).toBeInstanceOf(HTMLLabelElement);
  });

  it("forwards ref correctly", () => {
    const ref = { current: null as HTMLLabelElement | null };

    render(<Label ref={ref}>Label with Ref</Label>);

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it("applies default styling classes", () => {
    render(<Label data-testid="label">Styled Label</Label>);

    const label = screen.getByTestId("label");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
    expect(label).toHaveClass("leading-none");
  });

  it("applies peer-disabled styles", () => {
    render(<Label data-testid="label">Label</Label>);

    const label = screen.getByTestId("label");
    expect(label).toHaveClass("peer-disabled:cursor-not-allowed");
    expect(label).toHaveClass("peer-disabled:opacity-70");
  });

  it("applies custom className", () => {
    render(<Label className="custom-label-class">Custom Label</Label>);

    const label = screen.getByText("Custom Label");
    expect(label).toHaveClass("custom-label-class");
  });

  it("associates with input via htmlFor attribute", () => {
    render(
      <>
        <Label htmlFor="email-input">Email</Label>
        <input id="email-input" type="email" />
      </>,
    );

    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email-input");
  });

  it("forwards additional props", () => {
    render(<Label data-testid="label" id="my-label">Props Label</Label>);

    const label = screen.getByTestId("label");
    expect(label).toHaveAttribute("id", "my-label");
  });

  it("has correct display name", () => {
    expect(Label.displayName).toBe("Label");
  });
});
