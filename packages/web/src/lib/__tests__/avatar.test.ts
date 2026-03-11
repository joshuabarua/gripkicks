import { describe, expect, it } from "vitest";
import { getAvatarSeed, getDicebearAvatarUrl } from "@/lib/avatar";

describe("avatar utilities", () => {
  it("prefers email over userId for the avatar seed", () => {
    expect(
      getAvatarSeed({
        userId: "user_123",
        email: "climber@example.com",
        name: "Original Name",
      }),
    ).toBe("climber@example.com");
  });

  it("does not change the avatar seed when only the name changes", () => {
    const first = getAvatarSeed({
      userId: "user_123",
      email: "climber@example.com",
      name: "First Name",
    });
    const second = getAvatarSeed({
      userId: "user_123",
      email: "climber@example.com",
      name: "Renamed Climber",
    });

    expect(first).toBe(second);
  });

  it("builds stable avatar urls for the same identity", () => {
    const first = getDicebearAvatarUrl({
      userId: "user_123",
      email: "climber@example.com",
      name: "First Name",
    });
    const second = getDicebearAvatarUrl({
      userId: "user_123",
      email: "climber@example.com",
      name: "Renamed Climber",
    });

    expect(first).toBe(second);
    expect(first).toContain("seed=climber%40example.com");
  });
});
