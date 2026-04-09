"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function BootLoader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="boot-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
        >
          <div className="relative z-10 flex flex-col items-center gap-10">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="w-3 h-3 rounded-full bg-[#f45b5b] animate-hal-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#f45b5b] blur-md opacity-60 animate-hal-pulse" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="font-tanker text-xl tracking-wider text-white/90">
                GRIP KICKS
              </div>

              <div className="w-32 h-px bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-[#f45b5b]/60"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <span className="font-sora text-[9px] uppercase tracking-[0.4em] text-white/20">
                Initializing
              </span>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
