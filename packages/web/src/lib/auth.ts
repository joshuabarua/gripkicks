import { useCallback, useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const SESSION_TIMEOUT_MS = 15000;
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
    if (!session.isPending) {
      setTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimedOut(true);
    }, SESSION_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
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
