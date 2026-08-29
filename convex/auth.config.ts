import type { AuthConfig } from "convex/server";

const issuer = process.env["BETTER_AUTH_URL"];
if (!issuer) {
  throw new Error("BETTER_AUTH_URL is required for Convex authentication");
}

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "convex",
      issuer,
      jwks: `${issuer.replace(/\/$/, "")}/api/auth/jwks`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
