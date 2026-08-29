import { describe, expect, it, vi } from "vitest";
import { requireAdmin, requireCurrentUser, requireUserAccess, requireUserShoeAccess } from "./authorization";

const owner = {
  _id: "user-owner",
  _creationTime: 1,
  betterAuthId: "auth-owner",
  email: "owner@example.com",
  emailVerified: true,
  onboardingComplete: true,
  isAdmin: false,
};

const admin = {
  ...owner,
  _id: "user-admin",
  betterAuthId: "auth-admin",
  email: "admin@example.com",
  isAdmin: true,
};

function createContext({
  subject,
  directUser = null,
  indexedUser = null,
  userShoe = null,
}: {
  subject?: string;
  directUser?: typeof owner | null;
  indexedUser?: typeof owner | null;
  userShoe?: { _id: string; userId: string; shoeId: string } | null;
}) {
  const first = vi.fn().mockResolvedValue(indexedUser);
  const withIndex = vi.fn().mockReturnValue({ first });
  const query = vi.fn().mockReturnValue({ withIndex });
  const get = vi.fn(async (id: string) => {
    if (id === userShoe?._id) return userShoe;
    return directUser;
  });

  return {
    auth: {
      getUserIdentity: vi.fn().mockResolvedValue(subject ? { subject } : null),
    },
    db: {
      normalizeId: vi.fn((_table: string, id: string) =>
        id.startsWith("user-") ? id : null,
      ),
      get,
      query,
    },
  } as any;
}

describe("Convex authorization", () => {
  it("rejects unauthenticated requests", async () => {
    await expect(requireCurrentUser(createContext({}))).rejects.toMatchObject({
      data: { code: "UNAUTHENTICATED" },
    });
  });

  it("resolves users from a Convex ID subject", async () => {
    await expect(
      requireCurrentUser(createContext({ subject: owner._id, directUser: owner })),
    ).resolves.toMatchObject({ _id: owner._id });
  });

  it("resolves users from a Better Auth subject", async () => {
    await expect(
      requireCurrentUser(createContext({ subject: owner.betterAuthId, indexedUser: owner })),
    ).resolves.toMatchObject({ _id: owner._id });
  });

  it("rejects access to another user's data", async () => {
    await expect(
      requireUserAccess(
        createContext({ subject: owner._id, directUser: owner }),
        "user-other" as any,
      ),
    ).rejects.toMatchObject({ data: { code: "FORBIDDEN" } });
  });

  it("allows admins to access another user's data", async () => {
    await expect(
      requireUserAccess(
        createContext({ subject: admin._id, directUser: admin }),
        owner._id as any,
      ),
    ).resolves.toMatchObject({ _id: admin._id });
  });

  it("checks ownership through a user shoe", async () => {
    const userShoe = { _id: "user-shoe", userId: owner._id, shoeId: "shoe" };
    await expect(
      requireUserShoeAccess(
        createContext({ subject: owner._id, directUser: owner, userShoe }),
        userShoe._id as any,
      ),
    ).resolves.toEqual(userShoe);
  });

  it("requires an admin user", async () => {
    await expect(
      requireAdmin(createContext({ subject: owner._id, directUser: owner })),
    ).rejects.toMatchObject({ data: { code: "FORBIDDEN" } });
  });
});
