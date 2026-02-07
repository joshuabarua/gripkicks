import { betterAuth } from 'better-auth';
import { polar, checkout, portal, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import convexAdapter from './convex-adapter';

const convexUrl = process.env.CONVEX_URL || 'https://peaceful-marten-189.convex.cloud';

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: (process.env.POLAR_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
});

export const auth = betterAuth({
  database: convexAdapter({
    convexUrl,
    debugLogs: process.env.NODE_ENV !== 'production',
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
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8000',
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: process.env.POLAR_PRODUCT_MONTHLY || '', slug: 'monthly' },
            { productId: process.env.POLAR_PRODUCT_YEARLY || '', slug: 'yearly' },
            { productId: process.env.POLAR_PRODUCT_LIFETIME || '', slug: 'lifetime' },
          ],
          successUrl: '/pricing/success?checkout_id={CHECKOUT_ID}',
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onPayload: async (payload) => {
            console.log('[Polar Webhook]', payload.type);
          },
        }),
      ],
    }),
  ],
});

export type Auth = typeof auth;
