import { betterAuth } from 'better-auth';
import { convexAdapter } from './convex-adapter';

// Get Convex URL from environment
const convexUrl = process.env.CONVEX_URL || 'https://peaceful-marten-189.convex.cloud';

export const auth = betterAuth({
  // Use Convex as the database via HTTP adapter
  database: convexAdapter({
    convexUrl,
    debugLogs: process.env.NODE_ENV !== 'production',
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      // TODO: Send an email to the user with a link to reset their password
      console.log('Password reset requested for:', data.user.email);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day - update session if older than this
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
});

// Export type for Hono RPC
export type Auth = typeof auth;
