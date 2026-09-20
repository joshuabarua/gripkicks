import { useCallback, useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const SESSION_TIMEOUT_MS = 5000;
const authBaseUrl = process.env["NEXT_PUBLIC_API_URL"] || "";

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [jwtClient()],
});

export const {
  signIn,
  signUp,
  signOut,
} = authClient;

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
    const resetTimer = window.setTimeout(() => {
      setTimedOut(false);
    }, 0);

    if (!session.isPending) {
      return () => window.clearTimeout(resetTimer);
    }

    const timeoutTimer = window.setTimeout(() => {
      setTimedOut(true);
    }, SESSION_TIMEOUT_MS);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timeoutTimer);
    };
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
