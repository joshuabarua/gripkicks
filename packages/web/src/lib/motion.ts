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

export const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: EASE_OUT },
} as const;

export const slideUpBarMotion = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: { type: "spring", stiffness: 400, damping: 35 },
} as const;

export const menuCloseTransition = {
  duration: 0.4,
  delay: 0,
  type: "tween",
  ease: [0.76, 0, 0.24, 1],
} as const;
