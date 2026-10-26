import { describe, expect, it, vi } from "vitest";
import { createJwksCache } from "./jwks-cache";

describe("createJwksCache", () => {
  it("loads once for sequential get() calls within the TTL", async () => {
    const load = vi.fn(async () => [{ kid: "a" }]);
    const cache = createJwksCache(load, 1000, () => 0);

    const first = await cache.get();
    const second = await cache.get();

    expect(load).toHaveBeenCalledTimes(1);
    expect(first).toEqual([{ kid: "a" }]);
    expect(second).toEqual([{ kid: "a" }]);
  });

  it("shares a single in-flight load across concurrent get() calls", async () => {
    let resolveLoad!: (value: unknown) => void;
    const load = vi.fn(
      () => new Promise<unknown>((resolve) => { resolveLoad = resolve; }),
    );
    const cache = createJwksCache(load, 1000, () => 0);

    const first = cache.get();
    const second = cache.get();
    expect(load).toHaveBeenCalledTimes(1);

    resolveLoad([{ kid: "b" }]);
    await expect(first).resolves.toEqual([{ kid: "b" }]);
    await expect(second).resolves.toEqual([{ kid: "b" }]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("reloads after the TTL elapses", async () => {
    let now = 0;
    const load = vi.fn(async () => ["k"]);
    const cache = createJwksCache(load, 1000, () => now);

    await cache.get();
    now = 1001;
    await cache.get();

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("invalidate() forces the next get() to reload", async () => {
    const load = vi.fn(async () => ["k"]);
    const cache = createJwksCache(load, 1000, () => 0);

    await cache.get();
    cache.invalidate();
    await cache.get();

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("propagates a rejected load and retries on the next get()", async () => {
    const load = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(["k"]);
    const cache = createJwksCache(load, 1000, () => 0);

    await expect(cache.get()).rejects.toThrow("boom");
    await expect(cache.get()).resolves.toEqual(["k"]);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("normalizes a non-array load result to an empty array", async () => {
    const cache = createJwksCache(async () => ({ not: "an array" }), 1000, () => 0);

    await expect(cache.get()).resolves.toEqual([]);
  });

  it("returns a copy so callers cannot mutate the cached keys", async () => {
    const load = vi.fn(async () => [{ kid: "a" }]);
    const cache = createJwksCache(load, 1000, () => 0);

    const first = await cache.get();
    first.push({ kid: "mutated" });

    const second = await cache.get();
    expect(second).toEqual([{ kid: "a" }]);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
