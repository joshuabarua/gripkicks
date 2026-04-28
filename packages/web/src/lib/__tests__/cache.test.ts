import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { shoeCache } from "@/lib/cache";
import { SimpleCache } from "@/lib/cache";

describe("SimpleCache", () => {
  let cache: SimpleCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new SimpleCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("set and get", () => {
    it("stores and retrieves data", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("returns null for non-existent key", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("stores different data types", () => {
      const obj = { name: "test", value: 123 };
      const arr = [1, 2, 3];
      const num = 42;

      cache.set("obj", obj);
      cache.set("arr", arr);
      cache.set("num", num);

      expect(cache.get("obj")).toEqual(obj);
      expect(cache.get("arr")).toEqual(arr);
      expect(cache.get("num")).toBe(num);
    });

    it("overwrites existing key", () => {
      cache.set("key", "value1");
      cache.set("key", "value2");
      expect(cache.get("key")).toBe("value2");
    });
  });

  describe("TTL (Time To Live)", () => {
    it("returns null after TTL expires", () => {
      cache.set("key", "value", 1000);
      expect(cache.get("key")).toBe("value");

      vi.advanceTimersByTime(1001);
      expect(cache.get("key")).toBeNull();
    });

    it("keeps data within TTL", () => {
      cache.set("key", "value", 1000);
      vi.advanceTimersByTime(500);
      expect(cache.get("key")).toBe("value");
    });

    it("uses default TTL when not specified", () => {
      cache.set("key", "value");
      expect(cache.get("key")).toBe("value");

      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(cache.get("key")).toBeNull();
    });

    it("handles zero TTL", () => {
      cache.set("key", "value", 0);
      vi.advanceTimersByTime(1);
      expect(cache.get("key")).toBeNull();
    });
  });

  describe("delete", () => {
    it("removes specific key", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      cache.delete("key1");
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBe("value2");
    });

    it("handles deleting non-existent key", () => {
      expect(() => cache.delete("nonexistent")).not.toThrow();
    });
  });

  describe("clear", () => {
    it("removes all keys", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      cache.clear();
      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
      expect(cache.get("key3")).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("removes expired items", () => {
      cache.set("key1", "value1", 1000);
      cache.set("key2", "value2", 2000);
      cache.set("key3", "value3", 3000);

      vi.advanceTimersByTime(1500);
      cache.cleanup();

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBe("value2");
      expect(cache.get("key3")).toBe("value3");
    });

    it("keeps valid items", () => {
      cache.set("key1", "value1", 1000);
      cache.set("key2", "value2", 1000);

      vi.advanceTimersByTime(500);
      cache.cleanup();

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBe("value2");
    });
  });

  describe("shoeCache instance", () => {
    it("has cache methods", () => {
      expect(typeof shoeCache.set).toBe("function");
      expect(typeof shoeCache.get).toBe("function");
      expect(typeof shoeCache.delete).toBe("function");
      expect(typeof shoeCache.clear).toBe("function");
      expect(typeof shoeCache.cleanup).toBe("function");
    });

    it("persists across operations", () => {
      shoeCache.set("test", "value");
      expect(shoeCache.get("test")).toBe("value");
      shoeCache.clear();
    });
  });
});

