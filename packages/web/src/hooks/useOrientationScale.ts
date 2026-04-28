"use client";

import { useOrientationStore } from "@/stores/orientationStore";
import { useShallow } from "zustand/react/shallow";

interface OrientationScale {
  isPortrait: boolean;
  isLandscape: boolean;
  scale: number;
  orientation: "portrait" | "landscape";
  screenWidth: number;
  screenHeight: number;
}

export function useOrientationScale(): OrientationScale {
  return useOrientationStore(
    useShallow((state) => ({
      isPortrait: state.isPortrait,
      isLandscape: state.isLandscape,
      scale: state.scale,
      orientation: state.orientation,
      screenWidth: state.screenWidth,
      screenHeight: state.screenHeight,
    })),
  );
}

export const useOrientation = useOrientationScale;
