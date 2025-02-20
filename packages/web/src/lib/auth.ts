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
    .then(async () => {
        console.log('Successfully connected to database');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS "public"."sessions" (
                id BIGINT PRIMARY KEY,
                user_id BIGINT REFERENCES "public"."users"(id) ON DELETE CASCADE,
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS "public"."verification_tokens" (
                token TEXT PRIMARY KEY,
                user_id BIGINT REFERENCES "public"."users"(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Auth tables initialized');
    })
    .catch((err) => {
        console.error('Database setup failed:', err);
    });

export const auth = betterAuth({
    database: pool,
    advanced: {
        cookiePrefix: "gripkicks",
        onError: (error: any) => {
            console.error('Better Auth Error:', error);
            if (error.cause) {
                console.error('Cause:', error.cause);
            }
            if (error.stack) {
                console.error('Stack:', error.stack);
            }
        },
        tables: {
            user: {
                name: 'users',
                columns: {
                    id: 'id',
                    name: 'username',
                    email: 'email',
                    password_hash: 'password_hash',
                    email_verified: 'email_verified',
                    created_at: 'created_at',
                    updated_at: 'updated_at'
                }
            }
        }
    },
    emailAndPassword: {
        requireEmailVerification: false,
        enabled: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            console.log('Verification URL:', url);
        },
        sendOnSignUp: true
    },
    appName: "GripKicks",
    plugins: [
        twoFactor(), username(), anonymous(), nextCookies()
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            console.log('Auth request:', ctx.path, ctx.body);

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