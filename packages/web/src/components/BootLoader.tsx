"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useIsPresent } from "framer-motion";
import { AnimatedLogoImage } from "./AnimatedLogo";

const transitionImages = [
  "/imgs/transition/blue_hold.png",
  "/imgs/transition/rock1.png",
  "/imgs/transition/green_hold.png",
  "/imgs/transition/plastic_hold1.png",
  "/imgs/transition/yellow_hold.png",
  "/imgs/transition/dark_blue.png",
];

function BootLoaderContent() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isPresent = useIsPresent();

  useEffect(() => {
    if (!isPresent) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % transitionImages.length);
    }, 460);

    return () => clearInterval(imageInterval);
  }, [isPresent]);

  return (
    <motion.div
      key="boot-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-brand-red"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.18)_100%)]" />
      <AnimatedLogoImage currentImageIndex={currentImageIndex} transitionImages={transitionImages} />
    </motion.div>
  );
}

export default function BootLoader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? <BootLoaderContent /> : null}
    </AnimatePresence>
  );
}
