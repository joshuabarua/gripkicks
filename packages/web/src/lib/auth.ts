import { createAuthClient } from 'better-auth/react';

// Better Auth client configuration
// Points to the backend API where Better Auth is running
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Export commonly used methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;