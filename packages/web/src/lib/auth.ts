import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const SESSION_TIMEOUT_MS = 5000;
const authBaseUrl = process.env["NEXT_PUBLIC_API_URL"] || "";

const authClient = createAuthClient({
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

const fetchAccessToken = async () => (await authClient.token()).data?.token ?? null;

export function useBetterAuthForConvex() {
  const session = authClient.useSession();
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
    if (!session.isPending || timedOut) return;
    const timeoutTimer = window.setTimeout(() => {
      setTimedOut(true);
    }, SESSION_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutTimer);
  }, [session.isPending, timedOut]);

  return timedOut ? { ...session, isPending: false } : session;
}
