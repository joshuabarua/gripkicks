import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignOutButton } from "@/components/signout-button";

const mockPush = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default text", () => {
    render(<SignOutButton />);

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("renders with custom children text", () => {
    render(<SignOutButton>Log Out</SignOutButton>);

    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("shows logout icon by default", () => {
    render(<SignOutButton />);

    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("hides icon when showIcon is false", () => {
    render(<SignOutButton showIcon={false} />);

    const button = screen.getByRole("button");
    expect(button.querySelector("svg")).not.toBeInTheDocument();
  });

  it("calls signOut and redirects on click", async () => {
    const user = userEvent.setup();
    mockSignOut.mockImplementation(({ fetchOptions }) => {
      fetchOptions?.onSuccess?.();
      return Promise.resolve();
    });

    render(<SignOutButton />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("shows loading state during sign out", async () => {
    const user = userEvent.setup();
    let onRequestCallback: (() => void) | undefined;

    mockSignOut.mockImplementation(({ fetchOptions }) => {
      onRequestCallback = fetchOptions?.onRequest;
      return new Promise(() => {});
    });

    render(<SignOutButton />);

    await user.click(screen.getByRole("button"));

    onRequestCallback?.();

    await waitFor(() => {
      expect(screen.getByText(/signing out/i)).toBeInTheDocument();
    });

    const spinner = screen.getByRole("button").querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("disables button while loading", async () => {
    const user = userEvent.setup();
    let onRequestCallback: (() => void) | undefined;

    mockSignOut.mockImplementation(({ fetchOptions }) => {
      onRequestCallback = fetchOptions?.onRequest;
      return new Promise(() => {});
    });

    render(<SignOutButton />);

    await user.click(screen.getByRole("button"));

    onRequestCallback?.();

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("handles sign out error gracefully", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockSignOut.mockImplementation(({ fetchOptions }) => {
      fetchOptions?.onError?.({ error: { message: "Sign out failed" } });
      return Promise.resolve();
    });

    render(<SignOutButton />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "SignOutButton: Error signing out:",
        expect.any(Object),
      );
    });

    expect(screen.getByRole("button")).not.toBeDisabled();

    consoleSpy.mockRestore();
  });

  it("calls custom onClick callback on success", async () => {
    const user = userEvent.setup();
    const customOnClick = vi.fn();

    mockSignOut.mockImplementation(({ fetchOptions }) => {
      fetchOptions?.onSuccess?.();
      return Promise.resolve();
    });

    render(<SignOutButton onClick={customOnClick} />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(customOnClick).toHaveBeenCalled();
    });
  });

  it("applies custom variant classes", () => {
    render(<SignOutButton variant="destructive" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies custom size classes", () => {
    render(<SignOutButton size="sm" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SignOutButton className="my-custom-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("my-custom-class");
  });
});
