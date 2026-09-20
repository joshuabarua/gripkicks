import { describe, expect, it, vi } from "vitest";
import {
  addToStash,
  deleteUserShoe,
  removeFromStash,
  updateUserShoeStats,
} from "./stash";

const owner = {
  _id: "user-owner",
  _creationTime: 1,
  betterAuthId: "auth-owner",
  email: "owner@example.com",
  emailVerified: true,
  onboardingComplete: true,
  isAdmin: false,
};

function createContext({
  userShoe = null,
  existingUserShoe = null,
  shoeRatings = [],
  popularityRow = null,
}: {
  userShoe?: { _id: string; userId: string; shoeId: string } | null;
  existingUserShoe?: { _id: string; userId: string; shoeId: string } | null;
  shoeRatings?: Array<Record<string, unknown>>;
  popularityRow?: { _id: string; shoeId: string; count: number; lastUpdated: number } | null;
} = {}) {
  const first = vi.fn().mockResolvedValue(existingUserShoe);
  const collect = vi.fn().mockResolvedValue(shoeRatings);
  const unique = vi.fn().mockResolvedValue(popularityRow);
  const withIndex = vi.fn().mockReturnValue({ first, collect, unique });
  const query = vi.fn().mockReturnValue({ withIndex });
  const get = vi.fn(async (id: string) => {
    if (id === userShoe?._id) return userShoe;
    if (id === owner._id) return owner;
    return null;
  });
  const patch = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockResolvedValue("user-shoe-new");
  const del = vi.fn().mockResolvedValue(undefined);

  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue({ subject: owner._id }),
    },
    db: {
      normalizeId: vi.fn((_table: string, id: string) =>
        id.startsWith("user-") ? id : null,
      ),
      get,
      query,
      patch,
      insert,
      delete: del,
    },
  } as any;
}

describe("updateUserShoeStats", () => {
  it("persists fitLongevity and sizingDeviation", async () => {
    const userShoe = { _id: "user-shoe-1", userId: owner._id, shoeId: "shoe-1" };
    const ctx = createContext({ userShoe });

    await (updateUserShoeStats as any)._handler(ctx, {
      userShoeId: "user-shoe-1",
      fitLongevity: "3-6 months",
      sizingDeviation: -0.5,
    });

    expect(ctx.db.patch).toHaveBeenCalledWith("user-shoe-1", {
      fitLongevity: "3-6 months",
      sizingDeviation: -0.5,
    });
  });

  it("returns null and skips the patch when no fields are provided", async () => {
    const userShoe = { _id: "user-shoe-1", userId: owner._id, shoeId: "shoe-1" };
    const ctx = createContext({ userShoe });

    const result = await (updateUserShoeStats as any)._handler(ctx, {
      userShoeId: "user-shoe-1",
    });

    expect(result).toBeNull();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});

describe("addToStash", () => {
  it("inserts the userShoe and increments popularity when absent", async () => {
    const ctx = createContext();

    const result = await (addToStash as any)._handler(ctx, {
      userId: owner._id,
      shoeId: "shoe-1",
    });

    expect(result).toBe("user-shoe-new");
    expect(ctx.db.insert).toHaveBeenCalledWith("userShoes", {
      userId: owner._id,
      shoeId: "shoe-1",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "popularity",
      expect.objectContaining({ shoeId: "shoe-1", count: 1 }),
    );
  });

  it("returns the existing id without inserting when already in stash", async () => {
    const existingUserShoe = {
      _id: "user-shoe-1",
      userId: owner._id,
      shoeId: "shoe-1",
    };
    const ctx = createContext({ existingUserShoe });

    const result = await (addToStash as any)._handler(ctx, {
      userId: owner._id,
      shoeId: "shoe-1",
    });

    expect(result).toBe("user-shoe-1");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalledWith("popularity");
  });
});

describe("removeFromStash", () => {
  it("deletes the userShoe and decrements popularity when present", async () => {
    const existingUserShoe = {
      _id: "user-shoe-1",
      userId: owner._id,
      shoeId: "shoe-1",
    };
    const popularityRow = {
      _id: "popularity-1",
      shoeId: "shoe-1",
      count: 2,
      lastUpdated: 1,
    };
    const ctx = createContext({ existingUserShoe, popularityRow });

    const result = await (removeFromStash as any)._handler(ctx, {
      userId: owner._id,
      shoeId: "shoe-1",
    });

    expect(result).toBe(true);
    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "popularity-1",
      expect.objectContaining({ count: 1 }),
    );
  });

  it("returns false and deletes nothing when not in stash", async () => {
    const ctx = createContext();

    const result = await (removeFromStash as any)._handler(ctx, {
      userId: owner._id,
      shoeId: "shoe-1",
    });

    expect(result).toBe(false);
    expect(ctx.db.delete).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalledWith("popularity");
  });
});

describe("deleteUserShoe", () => {
  it("deletes the owned userShoe and decrements popularity", async () => {
    const userShoe = { _id: "user-shoe-1", userId: owner._id, shoeId: "shoe-1" };
    const popularityRow = {
      _id: "popularity-1",
      shoeId: "shoe-1",
      count: 3,
      lastUpdated: 1,
    };
    const ctx = createContext({ userShoe, popularityRow });

    await (deleteUserShoe as any)._handler(ctx, { userShoeId: "user-shoe-1" });

    expect(ctx.db.delete).toHaveBeenCalledWith("user-shoe-1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "popularity-1",
      expect.objectContaining({ count: 2 }),
    );
  });
});
