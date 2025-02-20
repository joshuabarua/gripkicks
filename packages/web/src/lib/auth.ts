import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactor, username, anonymous, createAuthMiddleware } from "better-auth/plugins";
import { Pool } from "pg";

if (!process.env.DIRECT_URL) {
    throw new Error('DIRECT_URL environment variable is not set');
}

const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
});

pool.connect()
    .then(() => {
        console.log('Successfully connected to database');
    })
    .catch((err) => {
        console.error('Database setup failed:', err);
    });

export const auth = betterAuth({
    database: pool,
    emailAndPassword: {
        requireEmailVerification: false,
        enabled: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            //   await sendEmail({
            //     to: user.email,
            //     subject: "Verify your email address",
            //     text: `Click the link to verify your email: ${url}`,
            //   });
        },
        sendOnSignUp: true
    },
    appName: "GripKicks",
    plugins: [
        twoFactor(), username(), anonymous(), nextCookies()
    ],
    advanced: {
        cookiePrefix: "gripkicks",
        onError: (error: any) => {
            console.error('Auth error:', error);
        },
        tables: {
            user: {
                name: "users",
                columns: {
                    name: "username"
                }
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== "/sign-up/email") {
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(ctx.body?.email)) {
                return {
                    response: {
                        status: 400
                    },
                    body: {
                        error: {
                            message: "Please enter a valid email address"
                        }
                    },
                    _flag: "json"
                };
            }
        }),
    },
    secret: process.env.BETTER_AUTH_SECRET
});