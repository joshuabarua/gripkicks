import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth";
import { useUserStore } from "@/stores/userStore";

export function useUserSync() {
  const { data: session, isPending } = useSession();
  const { user: storedUser, setUser, isHydrated } = useUserStore();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only sync when we have a session, it's not pending, and store is hydrated
    if (session?.user && !isPending && isHydrated) {
      // Check if user data has changed
      const currentUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || "",
        image: session.user.image || "",
        emailVerified: session.user.emailVerified || false,
      };

      // Update store if user is different or not set
      if (!storedUser || storedUser.id !== currentUser.id) {
        setUser(currentUser);

        // Prevent multiple syncs for the same user
        if (syncedUserIdRef.current === session.user.id) {
          return;
        }

        const syncUserToConvex = async () => {
          try {
            console.log(
              "useUserSync: Syncing user to Convex:",
              session.user.email,
            );

            // Call backend which will sync to Convex
            const response = await fetch(
              `${process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001"}/api/v1/sync-user`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentUser),
              },
            );

            if (!response.ok) {
              const errorData = await response.text();
              console.error(
                "useUserSync: Failed to sync user to Convex:",
                errorData,
              );
            } else {
              const result = await response.json();
              console.log(
                "useUserSync: User synced to Convex successfully:",
                result,
              );
              syncedUserIdRef.current = session.user.id; // Mark as synced
            }
          } catch (error) {
            console.error("useUserSync: Error syncing user to Convex:", error);
          }
        };

        const idleSync = () => {
          void syncUserToConvex();
        };

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          (
            window as Window & {
              requestIdleCallback: (cb: () => void) => number;
            }
          ).requestIdleCallback(idleSync);
        } else {
          setTimeout(idleSync, 250);
        }
      }
    }
  }, [session?.user, isPending, isHydrated, storedUser, setUser]);
}
