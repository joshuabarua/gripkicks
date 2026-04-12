"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/contexts/LoadingContext";

const transitionImages = [
  "/imgs/transition/blue_hold.png",
  "/imgs/transition/rock1.png",
  "/imgs/transition/green_hold.png",
  "/imgs/transition/plastic_hold1.png",
  "/imgs/transition/yellow_hold.png",
  "/imgs/transition/dark_blue.png",
];

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    setCurrentImageIndex(0);
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev >= transitionImages.length - 1 ? prev : prev + 1));
    }, 180);

    return () => clearInterval(imageInterval);
  }, [isLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950"
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentImageIndex}
                src={transitionImages[currentImageIndex]}
                alt=""
                className="w-[180px] h-[180px] object-contain"
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
