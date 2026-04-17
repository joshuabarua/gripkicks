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
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.8 0 0 0 0 1 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const INK = "#0a0f18";
const PAPER = "#f0f4fa";
const CYAN = "#4fc3ff";
const DIM = "#7a8499";

export default function EditorialScifi() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: INK, color: PAPER }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-screen opacity-50"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[61] opacity-15"
        style={{
          backgroundImage: `linear-gradient(${PAPER} 1px, transparent 1px), linear-gradient(90deg, ${PAPER} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-[70] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: PAPER, background: INK, color: PAPER }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative grid grid-cols-12 grid-rows-12 min-h-screen" style={{ borderBottom: `1px solid ${DIM}` }}>
        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderBottom: `1px solid ${DIM}`, color: CYAN }}
        >
          <span>⟁ gripkicks · lab report</span>
          <span className="hidden md:inline">specimen_id: GK-0001</span>
          <span>t+00:42:18 utc</span>
        </div>

        <div className="col-span-12 md:col-span-7 row-span-10 relative" style={{ borderRight: `1px solid ${DIM}` }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="50" y1="0" x2="50" y2="100" stroke={CYAN} strokeWidth="0.1" strokeDasharray="1 1" />
            <line x1="0" y1="50" x2="100" y2="50" stroke={CYAN} strokeWidth="0.1" strokeDasharray="1 1" />
            <circle cx="50" cy="50" r="30" stroke={CYAN} strokeWidth="0.1" fill="none" />
            <circle cx="50" cy="50" r="20" stroke={CYAN} strokeWidth="0.1" fill="none" />
          </svg>

          <div className="absolute inset-0 z-10">
            <Scene />
          </div>

          <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-widest" style={{ color: CYAN }}>
            ▲ fig. 01 — morphology scan
          </div>
          <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest space-y-1" style={{ color: DIM }}>
            <div>shape · <span style={{ color: PAPER }}>roman</span></div>
            <div>volume · <span style={{ color: PAPER }}>medium</span></div>
            <div>arch · <span style={{ color: PAPER }}>medium-high</span></div>
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[9px] uppercase tracking-widest text-right" style={{ color: DIM }}>
            <div>δ · <span style={{ color: PAPER }}>0.3mm</span></div>
            <div>σ · <span style={{ color: PAPER }}>0.12</span></div>
            <div>conf · <span style={{ color: CYAN }}>97.4%</span></div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 row-span-10 flex flex-col justify-between p-8 md:p-10">
          <div className="space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: CYAN }}>
              field report · vol. i
            </div>
            <h1 className="font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-tight">
              A measurement science
              <span className="not-italic font-tanker" style={{ color: CYAN }}> for the foot</span>
            </h1>
            <div className="h-px w-24" style={{ background: CYAN }} />
            <p className="font-mono text-xs leading-relaxed max-w-sm" style={{ color: DIM }}>
              Morphology. Volume. Pressure. GripKicks quantifies what fit tools pretend not to
              see and builds a calibration system around it.
            </p>
          </div>

          <div className="mt-10 space-y-0">
            {[
              { code: "FL-01", ja: "foot_lab", en: "morphology scan" },
              { code: "SM-02", ja: "sole_mate", en: "rubber match" },
              { code: "SC-03", ja: "sanctuary", en: "archive" },
            ].map((row) => (
              <div
                key={row.code}
                className="flex justify-between items-baseline py-3"
                style={{ borderTop: `1px solid ${DIM}` }}
              >
                <span className="font-mono text-[10px] tracking-widest" style={{ color: CYAN }}>
                  {row.code}
                </span>
                <span className="font-mono text-xs" style={{ color: PAPER }}>
                  {row.ja}
                </span>
                <span className="font-serif italic text-sm" style={{ color: DIM }}>
                  {row.en}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderTop: `1px solid ${DIM}`, color: DIM }}
        >
          <span>↓ descent</span>
          <span style={{ color: CYAN }}>transmit_continue()</span>
          <span>seq. 01 / 12</span>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8">
          <div className="md:col-span-3 font-mono text-[10px] uppercase tracking-widest" style={{ color: DIM }}>
            § 1.1
            <div className="mt-1 font-serif italic text-sm normal-case tracking-normal" style={{ color: CYAN }}>
              Abstract
            </div>
          </div>
          <div className="md:col-span-9 space-y-4">
            <p className="font-serif italic text-2xl md:text-4xl leading-snug">
              The foot is a three-dimensional object.
              <span className="not-italic font-tanker" style={{ color: CYAN }}> Your fit should be too.</span>
            </p>
            <p className="font-mono text-xs leading-relaxed max-w-lg" style={{ color: DIM }}>
              Legacy systems reduce the foot to a single length measurement. We reject this
              compression. GripKicks preserves the full morphological signal.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
