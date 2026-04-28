"use client";

import { motion } from "framer-motion";

export function LoadingBar({
  progress,
  showLabel = false,
  size = "md",
}: {
  progress?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-16 h-px",
    md: "w-24 h-px",
    lg: "w-32 h-px",
  };

  const isIndeterminate = progress === undefined;
  const indeterminateStyle = isIndeterminate ? { width: "50%" } : {};

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className="font-sora text-[10px] text-brand-putty/30">
          {isIndeterminate ? "···" : `${Math.round(progress)}%`}
        </span>
      )}
      <div className={`${sizeClasses[size]} bg-white/10 overflow-hidden`}>
        <motion.div
          className="h-full bg-brand-red/60"
          initial={{ width: "0%", x: 0 }}
          animate={
            isIndeterminate
              ? { x: ["-100%", "200%"] }
              : { width: `${progress}%` }
          }
          transition={
            isIndeterminate
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.15 }
          }
          {...(isIndeterminate ? { style: indeterminateStyle } : {})}
        />
      </div>
    </div>
  );
}

export function FullPageLoading({ text = "Loading" }: { text?: string }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black">
      <div className="relative flex flex-col items-center gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="w-3 h-3 rounded-full bg-brand-red animate-hal-pulse" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-brand-red blur-md opacity-60 animate-hal-pulse" />
        </motion.div>

        <div className="flex flex-col items-center gap-6">
          <div className="font-ball-pill text-xl tracking-wider text-white/90">
            GRIP KICKS
          </div>

          <div className="w-32 h-px bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-brand-red/60"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <span className="font-sora text-[9px] uppercase tracking-[0.4em] text-white/20">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
