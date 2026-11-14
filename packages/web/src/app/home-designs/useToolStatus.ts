import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { normalizeVolume } from "convex/utils/scoring";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { FootShape, FootVolume } from "@/components/foot/FootGlyphs";

export interface PreviewShoe {
  brand: string;
  name: string;
  imageUrl?: string;
}

export interface ToolStatus {
  footProfile: { shape: FootShape; volume: FootVolume } | null;
  stashShoes: PreviewShoe[];
  labels: Record<"/matcher" | "/footlab" | "/stash" | "/matcher?tab=mate", string>;
}

// Signed-in summary for the homepage Tools cards. Returns null for visitors
// and while the account is loading, so cards keep their demo loops.
export function useToolStatus(): ToolStatus | null {
  const { session, convexUser } = useCurrentUser();
  const user = session?.user ? convexUser : null;
  const shape = user?.footShape as FootShape | undefined;
  const volume = normalizeVolume(user?.footVolume);
  const hasProfile = !!(shape && volume);

  const stash = useQuery(api.stash.getUserStash, user ? { userId: user._id } : "skip");
  const soleMateCount = useQuery(
    api.stash.getSoleMateUserCount,
    user?.footShape && user.footVolume ? { footShape: user.footShape, footVolume: user.footVolume } : "skip",
  );

  if (!user || !Array.isArray(stash)) return null;

  const rated = stash.filter((entry) => entry.comfortScore && entry.performanceRating && entry.durabilityRating).length;
  const climbers = Math.max(0, (typeof soleMateCount === "number" ? soleMateCount : 1) - 1);

  return {
    footProfile: hasProfile ? { shape: shape!, volume: volume! } : null,
    stashShoes: stash.flatMap((entry) => (entry.shoe ? [{ brand: entry.shoe.brand, name: entry.shoe.name, ...(entry.shoe.imageUrl ? { imageUrl: entry.shoe.imageUrl } : {}) }] : [])).slice(0, 3),
    labels: {
      "/matcher": !hasProfile ? "Needs foot profile" : rated >= 3 ? "Preferences learned" : `${rated}/3 shoes rated`,
      "/footlab": hasProfile ? `${shape} · ${volume}` : "Not set",
      "/stash": `${stash.length} ${stash.length === 1 ? "shoe" : "shoes"}`,
      "/matcher?tab=mate": !hasProfile ? "Needs foot profile" : `${climbers} ${climbers === 1 ? "climber" : "climbers"} with your profile`,
    },
  };
}
