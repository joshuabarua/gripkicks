import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  // Use relative URL so Better Auth routes through Next.js proxy/rewrites
  baseURL: '',
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;