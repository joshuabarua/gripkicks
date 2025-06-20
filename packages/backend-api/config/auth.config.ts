import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from "better-auth/next-js";
import prisma from '@/db/index';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.APP_URL,
  // Allow requests from the frontend development server
  trustedOrigins: [process.env.APP_URL || 'http://localhost:3000'],
  user: {
    modelName: 'user',
    additionalFields: {
      isAdmin: { type: 'boolean', default: false, returned: true },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, modelName: 'session' },
    account: {
      modelName: 'account',
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'email-password'],
        allowDifferentEmails: false,
        // sendAccountLinkingEmail: async ({ user, url, token }) => {
        //   // Send account linking email
        //   sendEmail({
        //     to: user.email,
        //     subject: 'Link your account',
        //     text: `Click the link to confirm linking your account: ${url}`,
        //   })
        // },
      },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    plugins: [nextCookies()],
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});