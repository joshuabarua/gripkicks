import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";

const SESSION_TIMEOUT_MS = 15000;
const authBaseUrl = process.env["NEXT_PUBLIC_API_URL"] || "";

const authClient = createAuthClient({
  baseURL: authBaseUrl,
  fetchOptions: {
    credentials: "include",
  },
});

export const {
  signIn,
  signUp,
  signOut,
} = authClient;

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
