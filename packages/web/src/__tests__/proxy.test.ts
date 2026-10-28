import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const requestFor = (path: string, cookie?: string) =>
  new NextRequest(new URL(`http://localhost${path}`), {
    ...(cookie ? { headers: { cookie } } : {}),
  });

const locationOf = (response: Awaited<ReturnType<typeof proxy>>) =>
  response.headers.get("location");

const isPassThrough = (response: Awaited<ReturnType<typeof proxy>>) =>
  response.headers.get("x-middleware-next") === "1";

describe("proxy auth redirects", () => {
  it("redirects cookie-less requests on protected routes to login", async () => {
    const footlab = await proxy(requestFor("/footlab"));
    expect(locationOf(footlab)).toBe(
      "http://localhost/auth/login?callbackUrl=%2Ffootlab",
    );

    const matcher = await proxy(requestFor("/matcher?tab=mate"));
    expect(locationOf(matcher)).toBe(
      "http://localhost/auth/login?callbackUrl=%2Fmatcher%3Ftab%3Dmate",
    );
  });

  it("passes through protected routes when the session cookie exists", async () => {
    const response = await proxy(
      requestFor("/stash", "better-auth.session_token=x"),
    );
    expect(isPassThrough(response)).toBe(true);
    expect(locationOf(response)).toBeNull();
  });

  it("passes through auth pages even with a session cookie", async () => {
    const response = await proxy(
      requestFor("/auth/login?callbackUrl=/stash", "better-auth.session_token=x"),
    );
    expect(isPassThrough(response)).toBe(true);
    expect(locationOf(response)).toBeNull();
  });

  it("passes through public routes without a cookie", async () => {
    for (const path of ["/", "/about"]) {
      const response = await proxy(requestFor(path));
      expect(isPassThrough(response)).toBe(true);
      expect(locationOf(response)).toBeNull();
    }
  });
});
