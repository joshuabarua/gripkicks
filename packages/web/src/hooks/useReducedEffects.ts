"use client";

import { useEffect, useState } from "react";
import { useAnimationsEnabled } from "@/stores/useAppStore";

export function useReducedEffects() {
  const animationsEnabled = useAnimationsEnabled();
  const [isReducedEffects, setIsReducedEffects] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const lowCoreCount = (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowMemory = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    const smallViewport = window.innerWidth < 1024;

    setIsReducedEffects(Boolean(!animationsEnabled || prefersReducedMotion || lowCoreCount || lowMemory || smallViewport));
  }, [animationsEnabled]);

  return isReducedEffects;
}
