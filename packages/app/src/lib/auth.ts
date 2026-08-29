import { useCallback, useEffect, useState } from 'react';
import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

const SESSION_TIMEOUT_MS = 5000;

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    expoClient({
      scheme: 'gripkicks',
      storagePrefix: 'gripkicks',
      storage: SecureStore,
    }),
    jwtClient(),
  ],
});

export const { signIn, signUp, signOut } = authClient;

export function useBetterAuthForConvex() {
  const session = authClient.useSession();
  const fetchAccessToken = useCallback(async () => {
    const result = await authClient.token();
    return result.data?.token ?? null;
  }, []);

  return {
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    fetchAccessToken,
  };
}

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
