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
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const HALFTONE = "radial-gradient(circle, #c8102e 1px, transparent 1.2px)";

const PAPER = "#f3ead5";
const INK = "#171514";
const RED = "#c8102e";

export default function EditorialJapanese() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: PAPER, color: INK }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-40"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-[70] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: INK, background: PAPER }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative min-h-screen grid grid-cols-12 grid-rows-12" style={{ borderBottom: `1px solid ${INK}` }}>
        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderBottom: `1px solid ${INK}` }}
        >
          <span>第壱号 · no. 01</span>
          <span>gripkicks.co</span>
          <span>東京 · tokyo</span>
          <span className="hidden md:inline">mmxxvi</span>
        </div>

        <div className="col-span-12 md:col-span-7 row-span-10 relative" style={{ borderRight: `1px solid ${INK}` }}>
          <div
            className="absolute top-[15%] left-[12%] w-[55%] aspect-square rounded-full mix-blend-multiply"
            style={{ background: RED, opacity: 0.95 }}
          />
          <div
            className="absolute inset-0 opacity-30 mix-blend-multiply"
            style={{ backgroundImage: HALFTONE, backgroundSize: "9px 9px" }}
          />
          <div className="absolute inset-0 z-10">
            <Scene />
          </div>
          <div className="absolute bottom-4 left-6 right-6 flex justify-between font-mono text-[9px] uppercase tracking-widest">
            <span>fig. 01 — solutions · morphology</span>
            <span>scale 1:1</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 row-span-10 flex flex-col justify-between p-8 md:p-10">
          <div className="space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: RED }}>
              fit protocol · 足の言語
            </div>
            <h1 className="font-serif italic text-5xl md:text-7xl leading-[0.9] tracking-tight">
              Every foot has its own
              <span className="not-italic font-tanker" style={{ color: RED }}> honne.</span>
            </h1>
            <div className="h-px w-24" style={{ background: INK }} />
            <p className="font-mono text-xs leading-relaxed max-w-sm">
              GripKicks reads the foot the way a tailor reads a body — shape, volume, ritual.
              Measured with care. Matched with conviction. No more guessing.
            </p>
          </div>

          <div className="mt-10 space-y-0">
            {[
              { label: "01", ja: "足の研究所", en: "Foot Lab" },
              { label: "02", ja: "相棒探し", en: "Sole Mate" },
              { label: "03", ja: "聖域", en: "Sanctuary" },
            ].map((row, i) => (
              <div
                key={row.en}
                className="flex justify-between items-baseline py-3"
                style={{
                  borderTop: `1px solid ${INK}`,
                  borderBottom: i === 2 ? `1px solid ${INK}` : "none",
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: RED }}>
                  §{row.label}
                </span>
                <span className="font-serif italic">{row.ja}</span>
                <span className="font-mono text-sm">{row.en}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderTop: `1px solid ${INK}` }}
        >
          <span>↓ 続く</span>
          <span>continue</span>
          <span>p. 01 / 12</span>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16" style={{ borderBottom: `1px solid ${INK}` }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-6">
          <div className="md:col-span-3 font-mono text-[10px] uppercase tracking-widest">
            § 1.1
            <div className="mt-1 font-serif italic text-sm normal-case tracking-normal" style={{ color: RED }}>
              Method
            </div>
          </div>
          <div className="md:col-span-9 space-y-4">
            <p className="font-serif text-2xl md:text-4xl leading-snug italic">
              The body is not a size — it is a geography.
              <span className="not-italic font-tanker"> We map it.</span>
            </p>
            <p className="font-mono text-xs text-black/60 leading-relaxed max-w-lg">
              A lab for your foot. A matchmaker for your rubber. An archive for your shelf.
              Built in open-source. Sold to no one.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
