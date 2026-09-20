import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth";

const SYNCED_USER_STORAGE_KEY = "gripkicks:synced-user-id";

export function useUserSync() {
  const { data: session, isPending } = useSession();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const sessionUser = session?.user;
    if (!sessionUser || isPending || typeof window === "undefined") return;

    const alreadySynced =
      syncedUserIdRef.current === sessionUser.id ||
      window.localStorage.getItem(SYNCED_USER_STORAGE_KEY) === sessionUser.id;
    if (alreadySynced) {
      syncedUserIdRef.current = sessionUser.id;
      return;
    }

    const syncUserToConvex = async () => {
      try {
        const response = await fetch(
          `${process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001"}/api/v1/sync-user`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: sessionUser.id,
              email: sessionUser.email,
              name: sessionUser.name || "",
              image: sessionUser.image || "",
              emailVerified: sessionUser.emailVerified || false,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error(
            "useUserSync: Failed to sync user to Convex:",
            errorData,
          );
          return;
        }

        await response.json();
        syncedUserIdRef.current = sessionUser.id;
        window.localStorage.setItem(SYNCED_USER_STORAGE_KEY, sessionUser.id);
      } catch (error) {
        console.error("useUserSync: Error syncing user to Convex:", error);
      }
    };

    const idleSync = () => {
      void syncUserToConvex();
    };

    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (cb: () => void) => number;
        }
      ).requestIdleCallback(idleSync);
    } else {
      setTimeout(idleSync, 250);
    }
  }, [session?.user, isPending]);
}
