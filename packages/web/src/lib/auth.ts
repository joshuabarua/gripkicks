import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  const stillWaiting = timedOut && session.isPending;
  return { ...session, isPending: session.isPending && !timedOut, timedOut: stillWaiting };
}

export function safeCallbackPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (value && value.startsWith("/") && value[1] !== "/" && value[1] !== "\\") {
    return value;
  }
  return fallback;
}

export function useRequireAuth() {
  const session = useSession();
  const router = useRouter();
  const isRedirecting =
    !session.isPending &&
    !session.timedOut &&
    !session.error &&
    !session.data?.user;

  useEffect(() => {
    if (!isRedirecting) return;
    router.replace(
      `/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      { transitionTypes: ["page-nav"] },
    );
  }, [isRedirecting, router]);

  return { ...session, isRedirecting };
}

export function useRedirectIfAuthenticated() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.data?.user) return;
    const requested = new URLSearchParams(window.location.search).get("callbackUrl");
    router.replace(safeCallbackPath(requested), { transitionTypes: ["page-nav"] });
  }, [session.data?.user, router]);

  return session;
}
