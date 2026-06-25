"use client";

import React from "react";

type WordmarkWatermarkProps = {
  lines?: string[];
  align?: "left" | "center" | "right";
  className?: string;
};

export default function WordmarkWatermark({
  lines = ["GRIP", "KICKS"],
  align = "left",
  className = "",
}: WordmarkWatermarkProps) {
  const alignment =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-0 flex flex-col justify-center overflow-hidden ${alignment} ${className}`}
    >
      {lines.map((line) => (
        <span
          key={line}
          className="font-ball-pill text-brand-chalk/[0.035] leading-[0.8] text-[26vw] md:text-[22vw] tracking-tighter select-none whitespace-nowrap"
        >
          {line}
        </span>
      ))}
    </div>
  );
}
