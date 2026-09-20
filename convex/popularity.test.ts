import { describe, expect, it, vi } from "vitest";
import {
  addUserShoe,
  adjustShoePopularity,
  deleteUserShoesForShoe,
  deleteUserShoesForUser,
  removeUserShoe,
} from "./userShoes";

const existingRow = {
  _id: "popularity-1",
  _creationTime: 1,
  shoeId: "shoe-1",
  count: 3,
  lastUpdated: 1,
};

function createContext({
  userShoe = null,
  userShoes = [],
  popularityRow = existingRow,
}: {
  userShoe?: { _id: string; userId: string; shoeId: string } | null;
  userShoes?: Array<{ _id: string; userId: string; shoeId: string }>;
  popularityRow?: typeof existingRow | null;
} = {}) {
  const unique = vi.fn().mockResolvedValue(popularityRow);
  const first = vi.fn().mockResolvedValue(userShoe);
  const collect = vi.fn().mockResolvedValue(userShoes);
  const withIndex = vi.fn().mockReturnValue({ unique, first, collect });
  const query = vi.fn().mockReturnValue({ withIndex });
  const patch = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockResolvedValue("user-shoe-new");
  const del = vi.fn().mockResolvedValue(undefined);

  return {
    db: { query, patch, insert, delete: del },
  } as any;
}

describe("adjustShoePopularity", () => {
  it("increments an existing row and updates lastUpdated", async () => {
    const ctx = createContext();

    await adjustShoePopularity(ctx, "shoe-1" as any, 2);

    expect(ctx.db.patch).toHaveBeenCalledWith("popularity-1", {
      count: 5,
      lastUpdated: expect.any(Number),
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("decrements an existing row", async () => {
    const ctx = createContext();

    await adjustShoePopularity(ctx, "shoe-1" as any, -1);

    expect(ctx.db.patch).toHaveBeenCalledWith("popularity-1", {
      count: 2,
      lastUpdated: expect.any(Number),
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("inserts a new row when none exists and delta is positive", async () => {
    const ctx = createContext({ popularityRow: null });

    await adjustShoePopularity(ctx, "shoe-1" as any, 1);

    expect(ctx.db.insert).toHaveBeenCalledWith("popularity", {
      shoeId: "shoe-1",
      count: 1,
      lastUpdated: expect.any(Number),
    });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does nothing when no row exists and delta is zero", async () => {
    const ctx = createContext({ popularityRow: null });

    await adjustShoePopularity(ctx, "shoe-1" as any, 0);

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("does nothing when no row exists and delta is negative", async () => {
    const ctx = createContext({ popularityRow: null });

    await adjustShoePopularity(ctx, "shoe-1" as any, -1);

    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("floors the count at 0 instead of going negative", async () => {
    const ctx = createContext({
      popularityRow: { ...existingRow, count: 1 },
    });

    await adjustShoePopularity(ctx, "shoe-1" as any, -5);

    expect(ctx.db.patch).toHaveBeenCalledWith("popularity-1", {
      count: 0,
      lastUpdated: expect.any(Number),
    });
  });
});

describe("addUserShoe", () => {
  it("inserts and increments popularity when the pair is absent", async () => {
    const ctx = createContext({ popularityRow: null });

    const result = await addUserShoe(ctx, "user-1" as any, "shoe-1" as any);

    expect(result).toBe("user-shoe-new");
    expect(ctx.db.insert).toHaveBeenCalledWith("userShoes", {
      userId: "user-1",
      shoeId: "shoe-1",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "popularity",
      expect.objectContaining({ shoeId: "shoe-1", count: 1 }),
    );
  });

  it("returns the existing id without writing when the pair exists", async () => {
    const ctx = createContext({
      userShoe: { _id: "user-shoe-1", userId: "user-1", shoeId: "shoe-1" },
    });

    const result = await addUserShoe(ctx, "user-1" as any, "shoe-1" as any);

    expect(result).toBe("user-shoe-1");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});

describe("removeUserShoe", () => {
  it("deletes the row and decrements popularity", async () => {
    const ctx = createContext();

    await removeUserShoe(ctx, {
      _id: "user-shoe-1",
      userId: "user-1",
      shoeId: "shoe-1",
    } as any);

    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "popularity-1",
      expect.objectContaining({ count: 2 }),
    );
  });
});

describe("deleteUserShoesForUser", () => {
  it("deletes every row for the user and decrements each shoe", async () => {
    const ctx = createContext({
      userShoes: [
        { _id: "user-shoe-1", userId: "user-1", shoeId: "shoe-1" },
        { _id: "user-shoe-2", userId: "user-1", shoeId: "shoe-2" },
      ],
    });

    const deleted = await deleteUserShoesForUser(ctx, "user-1" as any);

    expect(deleted).toBe(2);
    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-1");
    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-2");
    expect(ctx.db.patch).toHaveBeenCalledTimes(2);
  });
});

describe("deleteUserShoesForShoe", () => {
  it("deletes every row for the shoe and removes the popularity row", async () => {
    const ctx = createContext({
      userShoes: [
        { _id: "user-shoe-1", userId: "user-1", shoeId: "shoe-1" },
        { _id: "user-shoe-2", userId: "user-2", shoeId: "shoe-1" },
      ],
    });

    const deleted = await deleteUserShoesForShoe(ctx, "shoe-1" as any);

    expect(deleted).toBe(2);
    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-1");
    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-2");
    expect(ctx.db.delete).toHaveBeenCalledWith("popularity-1");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("deletes the popularity row even when no userShoes rows exist", async () => {
    const ctx = createContext({ userShoes: [] });

    const deleted = await deleteUserShoesForShoe(ctx, "shoe-1" as any);

    expect(deleted).toBe(0);
    expect(ctx.db.delete).toHaveBeenCalledTimes(1);
    expect(ctx.db.delete).toHaveBeenCalledWith("popularity-1");
  });

  it("leaves no popularity write when the shoe has no popularity row", async () => {
    const ctx = createContext({ popularityRow: null, userShoes: [] });

    await deleteUserShoesForShoe(ctx, "shoe-1" as any);

    expect(ctx.db.delete).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
