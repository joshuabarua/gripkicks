import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { UserShoe } from "@/types/api";
import { useCurrentUser } from "./useCurrentUser";

export function useUserData() {
  const { convexUser, isLoading } = useCurrentUser();
  const userStashData = useQuery(
    api.stash.getUserStash,
    convexUser ? { userId: convexUser._id } : "skip",
  ) as UserShoe[] | undefined;

  return { userData: convexUser, userStashData, isLoading };
}
