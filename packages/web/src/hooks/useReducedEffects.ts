"use client";

import { useSyncExternalStore } from "react";
import { useAnimationsEnabled } from "@/stores/useAppStore";

const subscribe = () => () => undefined;

const getReducedEffectsSnapshot = () => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const lowCoreCount = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
  const smallViewport = window.innerWidth < 1024;

  return Boolean(prefersReducedMotion || lowCoreCount || lowMemory || smallViewport);
};

export function useReducedEffects() {
  const animationsEnabled = useAnimationsEnabled();
  const hasReducedDeviceEffects = useSyncExternalStore(
    subscribe,
    getReducedEffectsSnapshot,
    () => false,
  );

  return !animationsEnabled || hasReducedDeviceEffects;
}
