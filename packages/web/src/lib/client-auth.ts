import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient({
    plugins: [
    ],
    baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.DATABASE_URL,
    pathPrefix: "/api/auth",
    advanced: {
        onError: (error: any) => {
            console.error('Auth error:', error);
        },
    }
});

export const {
    signIn,
    signOut,
    signUp,
    useSession,
} = authClient;