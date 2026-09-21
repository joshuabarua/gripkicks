import { describe, expect, it, vi } from "vitest";
import { findOrLinkUserByAuth } from "./userHelpers";

const owner = {
  _id: "user-1",
  _creationTime: 1,
  betterAuthId: "auth-1",
  email: "shared@example.com",
  emailVerified: true,
};

const unclaimed = {
  _id: "user-2",
  _creationTime: 1,
  email: "legacy@example.com",
  emailVerified: true,
};

function createContext({
  byAuthId = null,
  byEmail = null,
}: {
  byAuthId?: Record<string, unknown> | null;
  byEmail?: Record<string, unknown> | null;
}) {
  const patch = vi.fn();
  const withIndex = vi.fn((indexName: string) => ({
    first: vi.fn().mockResolvedValue(
      indexName === "by_betterAuthId" ? byAuthId : byEmail,
    ),
  }));
  return {
    db: { query: vi.fn().mockReturnValue({ withIndex }), patch },
  } as any;
}

describe("findOrLinkUserByAuth", () => {
  it("returns the row matching the auth identity", async () => {
    const ctx = createContext({ byAuthId: owner });
    await expect(
      findOrLinkUserByAuth(ctx, "auth-1", "shared@example.com", true),
    ).resolves.toMatchObject({ _id: owner._id });
  });

  it("returns null when nothing matches", async () => {
    const ctx = createContext({});
    await expect(
      findOrLinkUserByAuth(ctx, "auth-new", "new@example.com", true),
    ).resolves.toBeNull();
  });

  it("claims an unlinked email row only when the email is verified", async () => {
    const verifiedCtx = createContext({ byEmail: unclaimed });
    await expect(
      findOrLinkUserByAuth(verifiedCtx, "auth-new", "legacy@example.com", true),
    ).resolves.toMatchObject({ _id: unclaimed._id, betterAuthId: "auth-new" });
    expect(verifiedCtx.db.patch).toHaveBeenCalledWith(unclaimed._id, {
      betterAuthId: "auth-new",
    });

    const unverifiedCtx = createContext({ byEmail: unclaimed });
    await expect(
      findOrLinkUserByAuth(unverifiedCtx, "auth-new", "legacy@example.com", false),
    ).resolves.toBeNull();
    expect(unverifiedCtx.db.patch).not.toHaveBeenCalled();
  });

  it("links a verified second identity to the shared-email row without rebinding it", async () => {
    const ctx = createContext({ byEmail: owner });
    await expect(
      findOrLinkUserByAuth(ctx, "auth-2", "shared@example.com", true),
    ).resolves.toMatchObject({ _id: owner._id });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("refuses an unverified identity when the email is already bound", async () => {
    const ctx = createContext({ byEmail: owner });
    await expect(
      findOrLinkUserByAuth(ctx, "auth-2", "shared@example.com", false),
    ).resolves.toBeNull();
  });
});
