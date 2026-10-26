import { describe, expect, it } from "vitest";
import { toConvexSiteUrl } from "./convexClient";

describe("toConvexSiteUrl", () => {
  it("maps a cloud hostname to the site domain and trims a trailing slash", () => {
    expect(toConvexSiteUrl("https://x.convex.cloud/")).toBe(
      "https://x.convex.site",
    );
  });

  it("leaves a site hostname unchanged", () => {
    expect(toConvexSiteUrl("https://x.convex.site")).toBe(
      "https://x.convex.site",
    );
  });

  it("leaves a local URL unchanged", () => {
    expect(toConvexSiteUrl("http://127.0.0.1:3210")).toBe(
      "http://127.0.0.1:3210",
    );
  });
});
