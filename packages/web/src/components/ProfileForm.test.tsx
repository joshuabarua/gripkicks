import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { okAsync } from "neverthrow";
import { describe, expect, it, vi, beforeEach } from "vitest";

const fetchApiMock = vi.fn();

vi.mock("@/lib/api-client", () => ({
  fetchApi: (...args: unknown[]) => fetchApiMock(...args),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props}>{children}</label>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));


import { ProfileForm } from "@/components/ProfileForm";

describe("ProfileForm", () => {
  beforeEach(() => {
    fetchApiMock.mockReset();
  });

  it("submits the profile update flow successfully", async () => {
    fetchApiMock.mockReturnValue(
      okAsync({
        name: "Updated Climber",
      }),
    );

    const onProfileUpdated = vi.fn();
    const onSuccess = vi.fn();

    render(
      <ProfileForm
        initialProfile={{ name: "Original Climber" }}
        onProfileUpdated={onProfileUpdated}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Updated Climber" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(fetchApiMock).toHaveBeenCalledWith("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "Updated Climber" }),
      });
    });

    await waitFor(() => {
      expect(onProfileUpdated).toHaveBeenCalledWith({ name: "Updated Climber" });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
