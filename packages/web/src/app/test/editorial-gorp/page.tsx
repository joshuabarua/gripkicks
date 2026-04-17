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
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.14 0 0 0 0 0.08 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const TOPO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%235a4a2a' stroke-width='0.6' opacity='0.35'%3E%3Cpath d='M0 60 Q100 40 200 80 T400 60'/%3E%3Cpath d='M0 120 Q100 100 200 140 T400 120'/%3E%3Cpath d='M0 180 Q100 160 200 200 T400 180'/%3E%3Cpath d='M0 240 Q100 220 200 260 T400 240'/%3E%3Cpath d='M0 300 Q100 280 200 320 T400 300'/%3E%3Cpath d='M0 360 Q100 340 200 380 T400 360'/%3E%3C/g%3E%3C/svg%3E\")";

const PAPER = "#e9dfc4";
const INK = "#2a2418";
const ORANGE = "#d2571b";
const OLIVE = "#5e5a3a";

export default function EditorialGorp() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: PAPER, color: INK }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{ backgroundImage: TOPO, backgroundSize: "400px 400px" }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-50"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-[70] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: INK, background: PAPER }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative grid grid-cols-12 grid-rows-12 min-h-screen" style={{ borderBottom: `1px solid ${INK}` }}>
        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderBottom: `1px solid ${INK}`, background: PAPER }}
        >
          <span>field journal · vol. i</span>
          <span className="hidden md:inline">N 47°16′ · E 11°23′</span>
          <span>elev. 2340m</span>
          <span>04°C</span>
        </div>

        <div className="col-span-12 md:col-span-7 row-span-10 relative" style={{ borderRight: `1px solid ${INK}` }}>
          <div className="absolute inset-0 z-10">
            <Scene />
          </div>
          <div
            className="absolute top-4 right-4 font-mono text-[9px] uppercase tracking-widest text-right space-y-1 px-2 py-1 border"
            style={{ borderColor: INK, background: PAPER, color: INK }}
          >
            <div>specimen · solutions 40.5eu</div>
            <div>observed · t+00:42</div>
            <div>surface · granite / t2</div>
          </div>
          <div className="absolute bottom-4 left-6 right-6 flex justify-between font-mono text-[9px] uppercase tracking-widest">
            <span>fig. 01 — fit scan, in the field</span>
            <span style={{ color: ORANGE }}>◆ active signal</span>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 row-span-10 flex flex-col justify-between p-8 md:p-10" style={{ background: PAPER }}>
          <div className="space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: ORANGE }}>
              § field report · entry 001
            </div>
            <h1 className="font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-tight">
              Built for the ground
              <span className="not-italic font-tanker" style={{ color: ORANGE }}> under your foot.</span>
            </h1>
            <div className="h-px w-24" style={{ background: INK }} />
            <p className="font-mono text-xs leading-relaxed max-w-sm" style={{ color: OLIVE }}>
              A fit system engineered like a topo map — precise, layered, and honest about the
              terrain. Shape. Volume. Rubber. Surface.
            </p>
          </div>

          <div className="mt-10 space-y-0">
            {[
              { code: "FL-01", en: "Foot Lab", spec: "morphology" },
              { code: "SM-02", en: "Sole Mate", spec: "rubber match" },
              { code: "SC-03", en: "Sanctuary", spec: "archive" },
            ].map((row) => (
              <div
                key={row.code}
                className="flex justify-between items-baseline py-3"
                style={{ borderTop: `1px solid ${INK}` }}
              >
                <span className="font-mono text-[10px] tracking-widest" style={{ color: ORANGE }}>
                  {row.code}
                </span>
                <span className="font-serif italic text-sm">{row.en}</span>
                <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: OLIVE }}>
                  {row.spec}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderTop: `1px solid ${INK}`, background: PAPER }}
        >
          <span>↓ descend</span>
          <span className="font-serif italic normal-case tracking-normal">continue the route</span>
          <span>p. 01 / 12</span>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 relative" style={{ background: PAPER }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8">
          <div className="md:col-span-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: OLIVE }}>
            § 1.1
            <div className="mt-1 font-serif italic text-sm normal-case tracking-normal" style={{ color: ORANGE }}>
              Method
            </div>
          </div>
          <div className="md:col-span-9 space-y-4">
            <p className="font-serif italic text-2xl md:text-4xl leading-snug">
              Read the foot like you read a slab —
              <span className="not-italic font-tanker"> with respect for every feature.</span>
            </p>
            <p className="font-mono text-xs leading-relaxed max-w-lg" style={{ color: OLIVE }}>
              GripKicks logs morphology, matches rubber to surface, and keeps a field record.
              No hype. Just data that earns your trust.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
