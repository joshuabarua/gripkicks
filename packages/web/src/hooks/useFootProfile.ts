import { useMemo } from "react";
import { useCurrentUser } from "./useCurrentUser";

export interface FootProfile {
  shape: "Egyptian" | "Roman" | "Greek" | "Germanic" | "Celtic";
  volume: "Low" | "Medium" | "High";
}

type BackendFootShape = "egyptian" | "roman" | "greek" | "germanic" | "celtic";
type BackendFootVolume = "low" | "medium" | "high";

const shapeMap: Record<BackendFootShape, FootProfile["shape"]> = {
  egyptian: "Egyptian",
  roman: "Roman",
  greek: "Greek",
  germanic: "Germanic",
  celtic: "Celtic",
};

const volumeMap: Record<BackendFootVolume, FootProfile["volume"]> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function normalizeBackendFootProfile(profile: {
  footShape?: string | null;
  footVolume?: string | null;
}): FootProfile | null {
  if (!profile.footShape || !profile.footVolume) {
    return null;
  }

  const shape = shapeMap[profile.footShape as BackendFootShape];
  const volume = volumeMap[profile.footVolume as BackendFootVolume];

  if (!shape || !volume) {
    return null;
  }

  return { shape, volume };
}

export function useFootProfile() {
  const { convexUser, isLoading } = useCurrentUser();

  const profile = useMemo(
    () =>
      convexUser
        ? normalizeBackendFootProfile({
            footShape: convexUser.footShape ?? null,
            footVolume: convexUser.footVolume ?? null,
          })
        : null,
    [convexUser],
  );

  return { profile, isLoading };
}
