import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { UserShoe } from "@/types/api";

export function useUserData(session: { user: { id: string } } | null | undefined) {
  const userData = useQuery(
    api.users.findByBetterAuthId,
    session?.user ? { betterAuthId: session.user.id } : "skip",
  );
  const userStashData = useQuery(
    api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip",
  ) as UserShoe[] | undefined;

  return { userData, userStashData };
}
