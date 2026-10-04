import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ShoeImage from "@/components/ShoeImage";

vi.mock("imagekitio-react", () => ({
  IKImage: ({ path, transformation, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { path: string; transformation: unknown }) => {
    void transformation;
    return React.createElement("img", { ...props, src: path, "data-testid": "product-image" });
  },
}));

const imageUrl = "https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/boreal/dharma_side_profile.png";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("ShoeImage", () => {
  it("keeps lazy images mounted beyond five seconds and displays a late load", () => {
    render(<ShoeImage brand="Boreal" shoeName="Dharma" imageUrl={imageUrl} />);
    const image = screen.getByTestId("product-image");
    act(() => vi.advanceTimersByTime(6000));
    expect(image).toBeInTheDocument();
    fireEvent.load(image);
    expect(image).toHaveClass("opacity-100");
    expect(screen.queryByRole("img", { name: "Boreal Dharma" })).toBe(image);
  });

  it("does not replace successfully loaded images after the deadline", () => {
    render(<ShoeImage brand="Boreal" shoeName="Dharma" imageUrl={imageUrl} />);
    const image = screen.getByTestId("product-image");
    fireEvent.load(image);
    act(() => vi.advanceTimersByTime(6000));
    expect(image).toBeInTheDocument();
    expect(image).toHaveClass("opacity-100");
  });

  it("uses a fallback for actual image errors and retries a changed source", () => {
    const { rerender } = render(<ShoeImage brand="Boreal" shoeName="Dharma" imageUrl={imageUrl} />);
    fireEvent.error(screen.getByTestId("product-image"));
    expect(screen.queryByTestId("product-image")).toBeNull();
    expect(screen.getByRole("img")).toHaveAttribute("src", "/imgs/placeholder_shoe.png");
    rerender(<ShoeImage brand="Boreal" shoeName="Dharma" imageUrl={`${imageUrl}?v=2`} />);
    expect(screen.getByTestId("product-image")).toBeInTheDocument();
  });
});
