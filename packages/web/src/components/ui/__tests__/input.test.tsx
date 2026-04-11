import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null as HTMLInputElement | null };

    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("accepts and applies type prop", () => {
    render(<Input type="password" data-testid="password-input" />);

    const input = screen.getByTestId("password-input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies default styling classes", () => {
    render(<Input data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toHaveClass("flex");
    expect(input).toHaveClass("h-9");
    expect(input).toHaveClass("w-full");
    expect(input).toHaveClass("rounded-md");
    expect(input).toHaveClass("border-input");
  });

  it("applies custom className", () => {
    render(<Input className="custom-input-class" data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toHaveClass("custom-input-class");
  });

  it("handles user input", async () => {
    const user = userEvent.setup();
    render(<Input data-testid="input" />);

    const input = screen.getByTestId("input");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("can be disabled", () => {
    render(<Input disabled data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:cursor-not-allowed");
    expect(input).toHaveClass("disabled:opacity-50");
  });

  it("handles onChange callback", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} data-testid="input" />);

    const input = screen.getByTestId("input");
    await user.type(input, "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards additional props", () => {
    render(
      <Input
        data-testid="input"
        maxLength={10}
        minLength={2}
        required
        name="username"
      />,
    );

    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toHaveAttribute("minLength", "2");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("name", "username");
  });

  it("has correct display name", () => {
    expect(Input.displayName).toBe("Input");
  });
});
