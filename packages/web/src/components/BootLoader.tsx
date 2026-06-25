"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedLogoImage } from "./AnimatedLogo";

const transitionImages = [
  "/imgs/transition/blue_hold.png",
  "/imgs/transition/rock1.png",
  "/imgs/transition/green_hold.png",
  "/imgs/transition/plastic_hold1.png",
  "/imgs/transition/yellow_hold.png",
  "/imgs/transition/dark_blue.png",
];

export default function BootLoader({ visible }: { visible: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    setCurrentImageIndex(0);
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % transitionImages.length);
    }, 460);

    return () => clearInterval(imageInterval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="boot-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,91,91,0.08),transparent_60%)]" />
          <AnimatedLogoImage currentImageIndex={currentImageIndex} transitionImages={transitionImages} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
