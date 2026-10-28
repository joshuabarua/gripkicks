import type { CSSProperties } from "react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const riseDelay = (index: number, stepMs = 50) =>
  ({ "--rise-delay": `${index * stepMs}ms` }) as CSSProperties;

export const expandMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.28, ease: EASE_OUT },
} as const;

export const slideUpBarMotion = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: { type: "spring", stiffness: 400, damping: 35 },
} as const;
