import { describe, expect, it, vi } from "vitest";
import { deleteSessionByTokenOrId } from "./authDb";

function createContext({
  sessionByToken = null,
  validId = false,
  sessionById = null,
}: {
  sessionByToken?: { _id: string; token: string } | null;
  validId?: boolean;
  sessionById?: { _id: string; token: string } | null;
} = {}) {
  const first = vi.fn().mockResolvedValue(sessionByToken);
  const withIndex = vi.fn().mockReturnValue({ first });
  const query = vi.fn().mockReturnValue({ withIndex });
  const get = vi.fn().mockResolvedValue(sessionById);
  const del = vi.fn().mockResolvedValue(undefined);
  const normalizeId = vi
    .fn()
    .mockReturnValue(validId ? "session-id-1" : null);

  return {
    ctx: {
      db: { query, get, delete: del, normalizeId },
    } as any,
    del,
    normalizeId,
  };
}

describe("deleteSessionByTokenOrId", () => {
  it("deletes by token index when the value matches a session token", async () => {
    const { ctx, del, normalizeId } = createContext({
      sessionByToken: { _id: "session-doc-1", token: "tok123" },
    });

    await (deleteSessionByTokenOrId as any)._handler(ctx, {
      value: "tok123",
    });

    expect(del).toHaveBeenCalledWith("session-doc-1");
    expect(normalizeId).not.toHaveBeenCalled();
  });

  it("falls back to the document id when no token matches", async () => {
    const { ctx, del } = createContext({
      validId: true,
      sessionById: { _id: "session-id-1", token: "othertoken" },
    });

    await (deleteSessionByTokenOrId as any)._handler(ctx, {
      value: "k1726gnwrvqwjh4488jt1wknhd80768a",
    });

    expect(del).toHaveBeenCalledWith("session-id-1");
  });

  it("deletes nothing when the value is neither a token nor a valid id", async () => {
    const { ctx, del } = createContext();

    await (deleteSessionByTokenOrId as any)._handler(ctx, {
      value: "not-a-real-value",
    });

    expect(del).not.toHaveBeenCalled();
  });

  it("deletes nothing when the id is valid but the session is gone", async () => {
    const { ctx, del } = createContext({ validId: true });

    await (deleteSessionByTokenOrId as any)._handler(ctx, {
      value: "k1726gnwrvqwjh4488jt1wknhd80768a",
    });

    expect(del).not.toHaveBeenCalled();
  });
});
