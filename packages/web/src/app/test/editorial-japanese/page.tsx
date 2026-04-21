"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PAPER = "#f1e6ca";
const INK = "#141311";
const RED = "#c8102e";

export default function EditorialJapanese() {
  return (
    <main className="min-h-screen overflow-x-hidden relative" style={{ background: PAPER, color: INK }}>
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-45"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-[70] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: INK, background: PAPER, color: INK }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <header
        className="relative flex items-center justify-between px-6 py-3 font-mono text-[10px] uppercase tracking-widest"
        style={{ borderBottom: `1px solid ${INK}` }}
      >
        <span>第壱号 · no. 01</span>
        <span className="hidden md:inline">gripkicks · a fit quarterly</span>
        <span>東京 mmxxvi</span>
      </header>

      {/* HERO: exact Scene integration from HomeCreative */}
      <section className="relative h-svh overflow-hidden" style={{ background: PAPER, borderBottom: `1px solid ${INK}` }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] rounded-full pointer-events-none"
          style={{ background: RED }}
          aria-hidden
        />

        {/* EXACT pattern from HomeCreative */}
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-6 py-3 flex items-end justify-between font-mono text-[9px] uppercase tracking-widest z-10">
          <span>fig. 01 — specimen · solutions 40.5eu</span>
          <span className="hidden md:inline">scale 1:1 · morphology</span>
          <span>t+00:42</span>
        </div>
      </section>

      <section className="relative px-6 md:px-16 py-20" style={{ background: PAPER }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10">
          <aside className="md:col-span-3 space-y-2 font-mono text-[10px] uppercase tracking-widest">
            <div>§ 1</div>
            <div className="pt-4">by a fit quarterly</div>
          </aside>

          <div className="md:col-span-9 space-y-6">
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight italic">
              Issue one.
            </h1>

            <div className="h-px w-24" style={{ background: INK }} />

            <p className="font-mono text-xs leading-relaxed max-w-lg">
              Layout and typography test. No marketing copy.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative px-6 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between" style={{ background: PAPER }}>
        <span>gripkicks.co</span>
        <span className="hidden md:inline">printed on recycled paper</span>
        <span>p. 01 / 12</span>
      </footer>
    </main>
  );
}
