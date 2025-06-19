import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './db.config';
import { nextCookies } from "better-auth/next-js";
import { Hono } from 'hono';
// import { BETTER_AUTH_URL, APP_URL, sendEmail } from '../libs'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [process.env.APP_URL!],
  user: {
    modelName: 'users',
    additionalFields: {
      isAdmin: { type: 'boolean', default: false, returned: true },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, modelName: 'sessions' },
    account: {
      modelName: 'accounts',
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
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});