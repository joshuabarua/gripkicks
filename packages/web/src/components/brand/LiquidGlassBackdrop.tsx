"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const EtherField = dynamic(() => import("@/components/3d/EtherField"), {
  ssr: false,
  loading: () => null,
});

const IRIDESCENT_RIM =
  "conic-gradient(from 0deg, rgba(244,91,91,0.5), rgba(106,155,204,0.5), rgba(120,140,93,0.45), rgba(244,91,91,0.5))";

const GLASS_BACKGROUND =
  "linear-gradient(150deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02) 45%, rgba(0,0,0,0.12))";

const GLASS_SHADOW =
  "inset 0 2px 2px rgba(255,255,255,0.3), inset 0 -30px 60px rgba(0,0,0,0.35), 0 30px 80px rgba(0,0,0,0.4)";

const BLOB_RADII = [
  "62% 38% 42% 58% / 56% 44% 56% 44%",
  "44% 56% 60% 40% / 48% 60% 40% 52%",
  "58% 42% 38% 62% / 60% 40% 58% 42%",
  "62% 38% 42% 58% / 56% 44% 56% 44%",
];

function GlassForm({
  size,
  className,
  duration,
  delay = 0,
}: {
  size: number;
  className?: string;
  duration: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      style={{ width: size, height: size }}
      animate={{
        borderRadius: BLOB_RADII,
        rotate: [0, 18, -12, 0],
        scale: [1, 1.06, 0.97, 1],
        y: [0, -24, 12, 0],
        x: [0, 16, -10, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          background: GLASS_BACKGROUND,
          boxShadow: GLASS_SHADOW,
          backdropFilter: "blur(36px) saturate(150%)",
          WebkitBackdropFilter: "blur(36px) saturate(150%)",
          filter:
            "drop-shadow(3px 0 0 rgba(244,91,91,0.35)) drop-shadow(-3px 0 0 rgba(106,155,204,0.35))",
        }}
      />
      <motion.div
        className="absolute -inset-px"
        style={{
          borderRadius: "inherit",
          padding: 1.5,
          background: IRIDESCENT_RIM,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0.55,
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: duration * 1.4, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          background:
            "radial-gradient(120% 80% at 30% 18%, rgba(255,255,255,0.45), rgba(255,255,255,0.05) 32%, transparent 58%)",
        }}
      />
    </motion.div>
  );
}

type LiquidGlassBackdropProps = {
  className?: string;
  align?: "left" | "center" | "right";
};

export default function LiquidGlassBackdrop({
  className = "",
  align = "center",
}: LiquidGlassBackdropProps) {
  const isReducedEffects = useReducedEffects();

  const anchor =
    align === "left"
      ? "left-[-6%] md:left-[6%]"
      : align === "right"
        ? "right-[-6%] md:right-[6%]"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 opacity-50">
        <EtherField
          className="absolute inset-0 h-full w-full"
          paused={isReducedEffects}
          speed={isReducedEffects ? 0 : 0.45}
          ambientColor="#0a0d18"
          accentColor="#ff5a3d"
        />
      </div>

      {!isReducedEffects && (
        <div className={`absolute top-1/2 -translate-y-1/2 ${anchor}`}>
          <GlassForm size={420} duration={18} className="opacity-90" />
          <GlassForm
            size={200}
            duration={14}
            delay={1.5}
            className="left-[55%] top-[58%] opacity-70"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_85%)]" />
    </div>
  );
}
