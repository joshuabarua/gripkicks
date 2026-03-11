import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

import SelectorPage from "@/app/selector/page";

describe("SelectorPage", () => {
  it("redirects to home on mount", () => {
    act(() => {
      render(<SelectorPage />);
    });

    expect(replace).toHaveBeenCalledWith("/");
  });
});
