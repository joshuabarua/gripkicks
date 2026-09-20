import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useSession } from "@/lib/auth";

export function useCurrentUser() {
  const { data: session, isPending: sessionPending } = useSession();
  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    session?.user?.id ? { betterAuthId: session.user.id } : "skip",
  );

  return {
    session,
    convexUser,
    isLoading: sessionPending || (!!session?.user && convexUser === undefined),
  };
}
