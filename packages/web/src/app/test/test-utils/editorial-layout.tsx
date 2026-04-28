"use client";

import React from "react";
import { BackButton } from "../test-utils";

interface EditorialLayoutProps {
  grain: string;
  paper: string;
  ink: string;
  header: React.ReactNode;
  hero: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
  extraBackgrounds?: React.ReactNode;
}

export function EditorialLayout({ grain, paper, ink, header, hero, content, footer, extraBackgrounds }: EditorialLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-hidden relative" style={{ background: paper, color: ink }}>
      {extraBackgrounds}
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-45"
        style={{ backgroundImage: grain, backgroundSize: "240px 240px" }}
      />

      <BackButton href="/test" className="fixed top-8 left-8 z-50 text-xs tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity" style={{ borderColor: ink, background: paper, color: ink }} />

      {header}
      {hero}
      {content}
      {footer}
    </main>
  );
}

export function EditorialFooter({ paper, leftText, centerText, rightText }: { paper: string; leftText: string; centerText?: string; rightText: string }) {
  return (
    <footer className="relative px-6 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between" style={{ background: paper }}>
      <span>{leftText}</span>
      {centerText && <span className="hidden md:inline">{centerText}</span>}
      <span>{rightText}</span>
    </footer>
  );
}
