"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-neutral-950"
        >
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentImageIndex}
              src={transitionImages[currentImageIndex]}
              alt=""
              className="w-[180px] h-[180px] object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
