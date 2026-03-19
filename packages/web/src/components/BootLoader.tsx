"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const transitionImages = [
  "/imgs/transition/blue_hold.png",
  "/imgs/transition/rock1.png",
  "/imgs/transition/green_hold.png",
  "/imgs/transition/yellow_hold.png",
];

const IMAGE_CYCLE_DURATION_MS = 520;
const IMAGE_TRANSITION_DURATION_S = 0.34;

export default function BootLoader({ visible }: { visible: boolean }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % transitionImages.length);
    }, IMAGE_CYCLE_DURATION_MS);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="boot-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-neutral-950"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none flex flex-col justify-center gap-4 opacity-30">
            <motion.div
              animate={{ x: [0, -500] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="flex gap-8 whitespace-nowrap"
            >
              {Array(20)
                .fill(null)
                .map((_, i) => (
                  <span
                    key={i}
                    className="font-tanker text-xl text-orange-500/20"
                  >
                    GRIP KICKS - LOADING -
                  </span>
                ))}
            </motion.div>
            <motion.div
              animate={{ x: [0, 500] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="flex gap-8 whitespace-nowrap"
            >
              {Array(20)
                .fill(null)
                .map((_, i) => (
                  <span
                    key={`mid-${i}`}
                    className="font-tanker text-xl text-orange-500/20"
                  >
                    COMMUNITY DRIVEN - CLIMBING SHOES -
                  </span>
                ))}
            </motion.div>
            <motion.div
              animate={{ x: [0, -500] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="flex gap-8 whitespace-nowrap"
            >
              {Array(20)
                .fill(null)
                .map((_, i) => (
                  <span
                    key={`bot-${i}`}
                    className="font-tanker text-xl text-orange-500/20"
                  >
                    FIND YOUR FIT -
                  </span>
                ))}
            </motion.div>
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <span className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">
              Loading
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="rounded-xl p-4 relative overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentImageIndex}
                  initial={{ scale: 1.3, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.7, opacity: 0, rotate: 10 }}
                  transition={{ duration: IMAGE_TRANSITION_DURATION_S, ease: "easeOut" }}
                >
                  <Image
                    src={transitionImages[currentImageIndex]}
                    alt="Loading climbing object"
                    width={180}
                    height={180}
                    className="w-[180px] h-[180px] object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="font-mono text-[10px] text-neutral-600">
                [{String(currentImageIndex + 1).padStart(2, "0")}/
                {String(transitionImages.length).padStart(2, "0")}]
              </span>
              <div className="w-24 h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentImageIndex + 1) / transitionImages.length) * 100}%`,
                  }}
                  transition={{ duration: IMAGE_TRANSITION_DURATION_S }}
                />
              </div>
            </div>

            <div className="font-tanker text-2xl text-white mt-6">
              GRIP <span className="text-orange-500">KICKS</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
