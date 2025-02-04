import { APIError, betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactor, username, anonymous, createAuthMiddleware } from "better-auth/plugins";
import { Pool } from "pg";



export const auth = betterAuth({
    database: new Pool({
        connectionString: `${process.env.DIRECT_URL}`
    }),
    emailAndPassword: { 
        requireEmailVerification: false,
        enabled: true, 
      }, 
      emailVerification: {
        sendVerificationEmail: async ( { user, url, token }, request) => {
        //   await sendEmail({
        //     to: user.email,
        //     subject: "Verify your email address",
        //     text: `Click the link to verify your email: ${url}`,
        //   });
        },
        async sendResetPassword(data: any, request: any) {
        console.log(data, request);
            // Send an email to the user with a link to reset their password

        },
        sendOnSignUp: true
      },
    appName: "GripKicks", 
    plugins: [
        twoFactor(), username(), anonymous(),nextCookies()
    ],
    advanced: {
        cookiePrefix: "gripkicks",
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            const newSession = ctx.context.newSession

            if (ctx.path !== "/sign-up/email") {
                return;
            }
            if (!ctx.body?.email.endsWith("@example.com")) {
                throw new APIError("BAD_REQUEST", {
                    message: "Email must end with @example.com",
                });
            }
        }),
    },
    secret: process.env.BETTER_AUTH_SECRET
});