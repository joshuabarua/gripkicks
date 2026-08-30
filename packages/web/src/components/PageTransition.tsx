"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useIsPresent, useReducedMotion } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";
import { AnimatedLogoImage } from "./AnimatedLogo";

const transitionImages = [
  "/imgs/transition/blue_hold.png",
  "/imgs/transition/green_hold.png",
  "/imgs/transition/yellow_hold.png",
  "/imgs/transition/dark_blue.png",
];

function TransitionOverlay({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isPresent = useIsPresent();

  useEffect(() => {
    if (shouldReduceMotion || !isPresent) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % transitionImages.length);
    }, 230);

    return () => clearInterval(imageInterval);
  }, [isPresent, shouldReduceMotion]);

  return (
    <motion.div
      key="transition"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.28,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.22,
          ease: [0.25, 1, 0.5, 1],
        },
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-red"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.18)_100%)]" />
      <AnimatedLogoImage
        currentImageIndex={currentImageIndex}
        transitionImages={transitionImages}
        reducedMotion={shouldReduceMotion}
      />
    </motion.div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading();
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <>
      <AnimatePresence>
        {isLoading && <TransitionOverlay shouldReduceMotion={shouldReduceMotion} />}
      </AnimatePresence>
      {children}
    </>
  );
}
