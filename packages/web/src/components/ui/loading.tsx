"use client";

import { motion } from "framer-motion";

const CLIMBING_LOADING_MESSAGES = [
  "Hunting for traction...",
  "Resoling memories...",
  "Mapping your crusade...",
  "Finding your grip...",
  "Chalking up...",
  "Reading the rock...",
  "Tying in...",
];

function getClimbingMessage(): string {
  return CLIMBING_LOADING_MESSAGES[
    Math.floor(Math.random() * CLIMBING_LOADING_MESSAGES.length)
  ] as string;
}

interface LoadingProps {
  text?: string;
  showProgress?: boolean;
  progress?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "full";
}

function Loading({ ...props }: LoadingProps) {
  const text = props.text?.trim() ? props.text : getClimbingMessage();
  const {
    showProgress = false,
    progress = 0,
    size = "md",
    variant = "default",
  } = props;
  const sizeClasses = {
    sm: "w-16",
    md: "w-24",
    lg: "w-32",
  };

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  const textSizes = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`${sizeClasses[size]} h-px bg-white/10 overflow-hidden`}
        >
          <motion.div
            className="h-full bg-brand-red/60"
            initial={{ width: "0%" }}
            animate={{
              width: showProgress ? `${progress}%` : ["0%", "100%", "0%"],
            }}
            transition={
              showProgress
                ? { duration: 0.15 }
                : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-8">
          <div className="w-3 h-3 rounded-full bg-brand-red animate-hal-pulse" />
          <div className="flex flex-col items-center gap-3">
            <span className="font-sora text-[9px] uppercase tracking-[0.4em] text-white/20">
              {text}
            </span>
            <div
              className={`${sizeClasses[size]} h-px bg-white/10 overflow-hidden`}
            >
              <motion.div
                className="h-full bg-brand-red/60"
                initial={{ width: "0%" }}
                animate={{
                  width: showProgress ? `${progress}%` : ["0%", "100%", "0%"],
                }}
                transition={
                  showProgress
                    ? { duration: 0.15 }
                    : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} bg-brand-red rounded-full`}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span
        className={`font-sora ${textSizes[size]} uppercase tracking-[0.3em] text-brand-putty/30`}
      >
        {text}
      </span>
      {showProgress && (
        <div
          className={`${sizeClasses[size]} h-px bg-white/10 overflow-hidden`}
        >
          <motion.div
            className="h-full bg-brand-red/60"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      )}
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      className={`${sizes[size]} border border-white/10 border-t-brand-red rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    />
  );
}

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
