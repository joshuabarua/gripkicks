"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const EtherField = dynamic(() => import("@/components/3d/EtherField"), {
  ssr: false,
  loading: () => null,
});

type AmbientFieldProps = {
  className?: string;
  intensity?: number;
};

export default function AmbientField({
  className = "",
  intensity = 0.35,
}: AmbientFieldProps) {
  const isReducedEffects = useReducedEffects();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      <EtherField
        className="absolute inset-0 w-full h-full"
        paused={isReducedEffects}
        speed={isReducedEffects ? 0 : 0.4}
        ambientColor="#0a0d18"
        accentColor="#ff5a3d"
      />
    </div>
  );
}
