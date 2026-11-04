"use client";

import React from "react";
import Link from "@/components/ui/NavLink";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

export const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

export function BackButton({ href = "/test", className = "", style, children }: { href?: string; className?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`fixed top-8 left-8 z-50 flex items-center ${className}`}
      style={style}
    >
      <ArrowLeft className="w-5 h-5" />
      {children}
    </Link>
  );
}
