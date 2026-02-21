import { betterAuth } from "better-auth";
import convexAdapter from "./convex-adapter";
import { getAllowedOrigins } from "./cors-origins";

const convexUrl =
  process.env.CONVEX_URL || "https://peaceful-marten-189.convex.cloud";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.warn(
    "[auth] Google OAuth is disabled. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.",
  );
}

export const auth = betterAuth({
  database: convexAdapter({
    convexUrl,
    debugLogs: true,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      console.log("Password reset requested for:", data.user.email);
    },
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
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
  trustedOrigins: [
    ...getAllowedOrigins(),
    "http://localhost:8000",
    "http://192.168.0.71:8000",
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  rateLimit: {
    window: 60,
    max: process.env.NODE_ENV === "production" ? 20 : 1000,
    storage: "memory",
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
});

export type Auth = typeof auth;
