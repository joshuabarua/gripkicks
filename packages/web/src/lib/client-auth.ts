import { createAuthClient } from "better-auth/client";
 
const authClient =  createAuthClient({
    plugins: [
        // Add your client plugins here
    ],
    baseURL: process.env.DATABASE_URL,
});

export const {

    signIn,

    signOut,

    signUp,

    useSession

} = authClient;