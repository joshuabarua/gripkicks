import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import BootLoader from "@/components/BootLoader";
import { PageTransition } from "@/components/PageTransition";
import { FullPageLoading, LoadingBar } from "@/components/ui/loading";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

function Probe() {
  const { isLoading, showLoader, hideLoader } = useLoading();
  return (
    <>
      <output>{isLoading ? "loading" : "ready"}</output>
      <button onClick={() => showLoader("session")}>Start session</button>
      <button onClick={() => showLoader("catalog")}>Start catalog</button>
      <button onClick={() => hideLoader("session")}>Finish session</button>
      <button onClick={() => hideLoader("catalog")}>Finish catalog</button>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  route.pathname = "/";
  sessionStorage.clear();
});

afterEach(() => vi.useRealTimers());

describe("loading lifecycle", () => {
  it("does not add a loading wait after a ready route commits", () => {
    const content = <LoadingProvider><Probe /></LoadingProvider>;
    const { rerender } = render(content);
    route.pathname = "/stash";
    rerender(<LoadingProvider><Probe /></LoadingProvider>);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("status")).toHaveTextContent("ready");
  });

  it("keeps loading until all real sources finish", () => {
    render(<LoadingProvider><Probe /></LoadingProvider>);
    fireEvent.click(screen.getByText("Start session"));
    fireEvent.click(screen.getByText("Start catalog"));
    fireEvent.click(screen.getByText("Finish session"));
    expect(screen.getByRole("status")).toHaveTextContent("loading");
    fireEvent.click(screen.getByText("Finish catalog"));
    expect(screen.getByRole("status")).toHaveTextContent("ready");
  });

  it("route feedback preserves child state and never mounts transition images", () => {
    function Counter() {
      const [count, setCount] = React.useState(0);
      return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
    }
    const { rerender, container } = render(<LoadingProvider><PageTransition><Counter /></PageTransition></LoadingProvider>);
    fireEvent.click(screen.getByText("Count 0"));
    route.pathname = "/matcher";
    rerender(<LoadingProvider><PageTransition><Counter /></PageTransition></LoadingProvider>);
    expect(screen.getByText("Count 1")).toBeInTheDocument();
    expect(container.querySelector(".pointer-events-none")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("clamps real progress and keeps indeterminate progress honest", () => {
    const { rerender } = render(<LoadingBar progress={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<LoadingBar />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it("shows a route-sized skeleton with an accessible loading label", () => {
    render(<FullPageLoading text="Loading sanctuary" />);
    expect(screen.getByRole("status", { name: "Loading sanctuary" })).toHaveAttribute("aria-busy", "true");
  });

  it("boot cue never covers or blocks the page and clears immediately", () => {
    const { container, rerender } = render(<BootLoader visible />);
    expect(container.querySelector(".pointer-events-none")).not.toBeNull();
    expect(container.querySelector(".inset-0")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    rerender(<BootLoader visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
