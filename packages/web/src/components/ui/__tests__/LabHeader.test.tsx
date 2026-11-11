import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LabHeader } from "@/components/ui/LabHeader";

describe("LabHeader", () => {
  it("renders the title with lab-title", () => {
    render(<LabHeader title="Foot Lab" />);
    const heading = screen.getByRole("heading", { name: "Foot Lab" });
    expect(heading).toHaveClass("lab-title");
    expect(heading).not.toHaveClass("font-mono");
  });
});
