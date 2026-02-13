import { betterAuth } from 'better-auth';
import convexAdapter from './convex-adapter';

const convexUrl = process.env.CONVEX_URL || 'https://peaceful-marten-189.convex.cloud';

export const auth = betterAuth({
  database: convexAdapter({
    convexUrl,
    debugLogs: true,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
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
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://192.168.0.71:3000',
    'http://192.168.0.71:8000',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  rateLimit: {
    window: 60,
    max: process.env.NODE_ENV === 'production' ? 20 : 1000,
    storage: 'memory',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
});

export type Auth = typeof auth;
