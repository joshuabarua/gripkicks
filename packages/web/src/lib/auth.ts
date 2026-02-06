import { createAuthClient } from 'better-auth/react';
import { polarClient } from '@polar-sh/better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  plugins: [polarClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;