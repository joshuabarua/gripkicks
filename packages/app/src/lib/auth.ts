import { useEffect, useState } from 'react';
import { createAuthClient } from 'better-auth/react';

const SESSION_TIMEOUT_MS = 5000;

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const authClient = createAuthClient({
  baseURL: API_URL,
});

export const { signIn, signUp, signOut } = authClient;

export function useSession() {
  const session = authClient.useSession();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!session.isPending) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      console.warn(
        '[auth] Session request timed out; treating user as signed out until the next refresh.',
      );
      setTimedOut(true);
    }, SESSION_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [session.isPending]);

  if (!timedOut) {
    return session;
  }

  return {
    ...session,
    data: null,
    isPending: false,
  };
}
