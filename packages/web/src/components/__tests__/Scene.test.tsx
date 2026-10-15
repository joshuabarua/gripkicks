import React, { Suspense, useLayoutEffect } from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Scene from "@/components/3d/Scene";

const mocks = vi.hoisted(() => ({
  frames: new Set<() => void>(),
  pending: null as "model" | "environment" | null,
  promise: Promise.resolve(),
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div>
      {React.Children.toArray(children).filter(
        (child) => React.isValidElement(child) && child.type === Suspense,
      )}
    </div>
  ),
  useFrame: (callback: () => void) => {
    useLayoutEffect(() => {
      mocks.frames.add(callback);
      return () => { mocks.frames.delete(callback); };
    }, [callback]);
  },
}));

vi.mock("@react-three/drei", () => ({
  useProgress: () => ({ progress: 100, active: false }),
  Environment: () => {
    if (mocks.pending === "environment") throw mocks.promise;
    return null;
  },
}));

vi.mock("@/components/3d/ShoeModel", () => ({
  default: () => {
    if (mocks.pending === "model") throw mocks.promise;
    return null;
  },
}));

beforeEach(() => {
  mocks.frames.clear();
  mocks.pending = null;
});

describe("Scene readiness", () => {
  it.each(["model", "environment"] as const)(
    "waits for %s and rendered frames before notifying once",
    async (resource) => {
      let resolve: () => void = () => undefined;
      mocks.promise = new Promise<void>((done) => { resolve = done; });
      mocks.pending = resource;
      const onReady = vi.fn();
      render(<Scene onReady={onReady} />);

      expect(onReady).not.toHaveBeenCalled();
      expect(mocks.frames.size).toBe(0);

      await act(async () => {
        mocks.pending = null;
        resolve();
        await mocks.promise;
      });
      act(() => mocks.frames.forEach((frame) => frame()));
      expect(onReady).not.toHaveBeenCalled();
      act(() => mocks.frames.forEach((frame) => frame()));
      expect(onReady).toHaveBeenCalledTimes(1);
      act(() => mocks.frames.forEach((frame) => frame()));
      expect(onReady).toHaveBeenCalledTimes(1);
    },
  );
});
