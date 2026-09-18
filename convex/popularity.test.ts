import { describe, expect, it, vi } from "vitest";
import { adjustShoePopularity } from "./shoeHelpers";

const existingRow = {
  _id: "popularity-1",
  _creationTime: 1,
  shoeId: "shoe-1",
  count: 3,
  lastUpdated: 1,
};

function createContext({
  existing = null,
}: {
  existing?: typeof existingRow | null;
} = {}) {
  const unique = vi.fn().mockResolvedValue(existing);
  const withIndex = vi.fn().mockReturnValue({ unique });
  const query = vi.fn().mockReturnValue({ withIndex });
  const patch = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockResolvedValue("popularity-new");

  return {
    db: { query, patch, insert },
  } as any;
}

describe("adjustShoePopularity", () => {
  it("increments an existing row and updates lastUpdated", async () => {
    const ctx = createContext({ existing: existingRow });

    await adjustShoePopularity(ctx, "shoe-1" as any, 2);

    expect(ctx.db.patch).toHaveBeenCalledWith("popularity-1", {
      count: 5,
      lastUpdated: expect.any(Number),
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("decrements an existing row", async () => {
    const ctx = createContext({ existing: existingRow });

    await adjustShoePopularity(ctx, "shoe-1" as any, -1);

    expect(ctx.db.patch).toHaveBeenCalledWith("popularity-1", {
      count: 2,
      lastUpdated: expect.any(Number),
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("inserts a new row when none exists and delta is positive", async () => {
    const ctx = createContext();

    await adjustShoePopularity(ctx, "shoe-1" as any, 1);

    expect(ctx.db.insert).toHaveBeenCalledWith("popularity", {
      shoeId: "shoe-1",
      count: 1,
      lastUpdated: expect.any(Number),
    });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does nothing when no row exists and delta is zero", async () => {
    const ctx = createContext();

    await adjustShoePopularity(ctx, "shoe-1" as any, 0);

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("does nothing when no row exists and delta is negative", async () => {
    const ctx = createContext();

    await adjustShoePopularity(ctx, "shoe-1" as any, -1);

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("floors the count at 0 instead of going negative", async () => {
    const ctx = createContext({
      existing: { ...existingRow, count: 1 },
    });

    await adjustShoePopularity(ctx, "shoe-1" as any, -5);

    expect(ctx.db.patch).toHaveBeenCalledWith("popularity-1", {
      count: 0,
      lastUpdated: expect.any(Number),
    });
  });
});
