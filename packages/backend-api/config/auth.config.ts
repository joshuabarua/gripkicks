import { betterAuth } from "better-auth";
import convexAdapter from "./convex-adapter";
import { getAllowedOrigins } from "./cors-origins";

const convexUrl =
  process.env.CONVEX_URL || "https://decisive-ermine-92.convex.cloud";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Derive auth base URL: explicit env var, then FRONTEND_URL-derived API URL,
// then localhost fallback.  This prevents Better Auth from generating
// localhost OAuth redirect URIs in production when BETTER_AUTH_URL is missing.
const authBaseUrl =
  process.env.BETTER_AUTH_URL ||
  (process.env.FRONTEND_URL
    ? `https://api.${process.env.FRONTEND_URL.replace(/^https?:\/\//, "").split(",")[0]}`
    : undefined) ||
  "http://localhost:3001";

if (!googleClientId || !googleClientSecret) {
  // Google OAuth disabled — missing env vars
}

export const auth = betterAuth({
  database: convexAdapter({
    convexUrl,
    debugLogs: process.env.AUTH_DEBUG_LOGS === "true",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword() {
      // Password reset email logic goes here
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            redirectURI: `${authBaseUrl}/api/auth/callback/google`,
          },
        }
      : {},
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        process.env.NODE_ENV === "production" ||
        !authBaseUrl.includes("localhost")
          ? "grip-kicks.com"
          : undefined,
    },
  },
  trustedOrigins: [
    ...getAllowedOrigins(),
    "http://localhost:8000",
    "http://192.168.0.71:8000",
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: authBaseUrl,
  rateLimit: {
    window: 60,
    max: process.env.NODE_ENV === "production" ? 20 : 1000,
    storage: "memory",
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
});

type Auth = typeof auth;
