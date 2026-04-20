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
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.14 0 0 0 0 0.08 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const TOPO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%23463622' stroke-width='0.6' opacity='0.3'%3E%3Cpath d='M0 60 Q100 40 200 80 T400 60'/%3E%3Cpath d='M0 120 Q100 100 200 140 T400 120'/%3E%3Cpath d='M0 180 Q100 160 200 200 T400 180'/%3E%3Cpath d='M0 240 Q100 220 200 260 T400 240'/%3E%3Cpath d='M0 300 Q100 280 200 320 T400 300'/%3E%3Cpath d='M0 360 Q100 340 200 380 T400 360'/%3E%3C/g%3E%3C/svg%3E\")";

const PAPER = "#e4d9ba";
const INK = "#231c10";
const ORANGE = "#d2571b";

export default function EditorialGorp() {
  return (
    <main className="min-h-screen overflow-x-hidden relative" style={{ background: PAPER, color: INK }}>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{ backgroundImage: TOPO, backgroundSize: "400px 400px" }}
      />
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
        className="relative px-6 py-3 flex items-center justify-between gap-4 flex-wrap font-mono text-[10px] uppercase tracking-widest"
        style={{ borderBottom: `1px solid ${INK}`, background: PAPER }}
      >
        <span>field journal · vol. i</span>
        <span className="hidden md:inline">N 47°16′ · E 11°23′</span>
        <span>elev. 2340m</span>
        <span>04°C</span>
      </header>

      {/* HERO: exact Scene integration from HomeCreative */}
      <section className="relative h-svh overflow-hidden" style={{ borderBottom: `1px solid ${INK}`, background: PAPER }}>
        {/* EXACT pattern from HomeCreative */}
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>

        <div
          className="absolute top-6 right-6 z-10 px-3 py-2 border font-mono text-[10px] uppercase tracking-widest text-right space-y-1"
          style={{ borderColor: INK, background: PAPER }}
        >
          <div>specimen · solutions 40.5eu</div>
          <div>observed · t+00:42</div>
          <div>surface · granite / t2</div>
        </div>

        <div
          className="absolute bottom-6 left-6 z-10 w-20 h-20 rounded-full flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-center leading-tight rotate-[-8deg]"
          style={{ background: ORANGE, color: PAPER, border: `2px solid ${INK}` }}
          aria-hidden
        >
          field<br />verified<br />001
        </div>

        <div className="absolute inset-x-0 bottom-0 px-6 py-3 flex items-end justify-end font-mono text-[9px] uppercase tracking-widest z-10">
          <span>fig. 01 — fit scan, in the field</span>
        </div>
      </section>

      <section className="relative px-6 md:px-16 py-20" style={{ background: PAPER }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-10">
          <aside className="md:col-span-3 space-y-2 font-mono text-[10px] uppercase tracking-widest">
            <div>§ 1</div>
            <div className="font-serif italic text-base normal-case tracking-normal">A field note.</div>
            <div className="pt-4">entry 001</div>
          </aside>

          <div className="md:col-span-9 space-y-6">
            <h1 className="font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-tight">
              Built for the ground
              <span className="not-italic font-tanker"> under your foot.</span>
            </h1>

            <div className="h-px w-24" style={{ background: INK }} />

            <p className="font-serif text-xl md:text-2xl leading-snug max-w-2xl">
              A fit system engineered like a topographic map — precise, layered, and honest about the terrain.
            </p>

            <p className="font-mono text-xs leading-relaxed max-w-lg">
              Logged from the crag, not the lab. Every reading earns its place in the record. No hype. Just measurements you can trust at the base of a route.
            </p>
          </div>
        </div>
      </section>

      <section
        className="relative px-6 md:px-16 py-14"
        style={{ background: PAPER, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}
      >
        <div className="max-w-5xl mx-auto space-y-0">
          {[
            { code: "FL-01", en: "Foot Lab", desc: "morphology" },
            { code: "SM-02", en: "Sole Mate", desc: "rubber match" },
            { code: "SC-03", en: "Sanctuary", desc: "archive" },
          ].map((row, i) => (
            <div
              key={row.code}
              className="grid grid-cols-12 items-baseline py-5 gap-4"
              style={{ borderTop: i === 0 ? "none" : `1px dashed ${INK}` }}
            >
              <span className="col-span-3 font-mono text-[11px] tracking-widest">{row.code}</span>
              <span className="col-span-5 font-tanker text-xl md:text-3xl uppercase">{row.en}</span>
              <span className="col-span-4 text-right font-serif italic text-base md:text-lg">{row.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative px-6 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between" style={{ background: PAPER }}>
        <span>gripkicks · field edition</span>
        <span className="hidden md:inline">printed on kraft</span>
        <span>entry 001 / 012</span>
      </footer>
    </main>
  );
}
