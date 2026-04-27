"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useSession } from "@/lib/auth";
import {
  useFootProfileStore,
  normalizeBackendFootProfile,
} from "@/stores/footProfileStore";

export default function FootProfileSync() {
  const { data: session } = useSession();
  const profile = useFootProfileStore((s) => s.profile);
  const setProfile = useFootProfileStore((s) => s.setProfile);

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    session?.user?.id ? { betterAuthId: session.user.id } : "skip",
  );

  useEffect(() => {
    if (!convexUser) return;
    const next = normalizeBackendFootProfile({
      footShape: convexUser.footShape ?? null,
      footVolume: convexUser.footVolume ?? null,
    });
    if (!next) return;
    if (profile?.shape === next.shape && profile.volume === next.volume) return;
    setProfile(next);
  }, [convexUser, profile, setProfile]);

  return null;
}
