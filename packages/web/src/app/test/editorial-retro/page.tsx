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
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.15 0 0 0 0 0.10 0 0 0 0 0.05 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PAPER = "#efe3c8";
const INK = "#2a1f0f";
const ACCENT = "#a8381e";

export default function EditorialRetro() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: PAPER, color: INK }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-60"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-[70] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: INK, background: PAPER }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section
        className="relative grid grid-cols-12 grid-rows-12 min-h-screen"
        style={{ borderBottom: `2px double ${INK}` }}
      >
        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderBottom: `1px solid ${INK}` }}
        >
          <span className="font-serif italic">The GripKicks Gazette</span>
          <span>vol. i · no. 01</span>
          <span className="hidden md:inline">all the fit that&apos;s fit to print</span>
          <span>est. mmxxvi</span>
        </div>

        <div className="col-span-12 md:col-span-5 row-span-10 p-8 md:p-10 flex flex-col justify-between" style={{ borderRight: `1px solid ${INK}` }}>
          <div className="space-y-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
              · featured story ·
            </div>
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight">
              A Quiet Revolution
              <br />
              <span className="italic">in How We Fit</span>
              <br />
              <span className="font-tanker uppercase text-4xl md:text-5xl" style={{ color: ACCENT }}>
                the climber&apos;s foot.
              </span>
            </h1>
            <div className="h-px w-32" style={{ background: INK }} />
            <p className="font-serif text-sm md:text-base leading-relaxed max-w-sm italic">
              &ldquo;For a hundred years, we handed climbers a shoe and told them to suffer.
              GripKicks does what cobblers used to do: they look at your foot.&rdquo;
            </p>
            <p className="font-mono text-[11px] uppercase tracking-widest">
              — a correspondent in chamonix
            </p>
          </div>

          <div className="mt-8 pt-6 grid grid-cols-3 gap-3 text-center" style={{ borderTop: `1px solid ${INK}` }}>
            {[
              { n: "01", s: "Foot Lab" },
              { n: "02", s: "Sole Mate" },
              { n: "03", s: "Sanctuary" },
            ].map((x) => (
              <div key={x.n}>
                <div className="font-tanker text-3xl" style={{ color: ACCENT }}>
                  {x.n}
                </div>
                <div className="font-serif italic text-xs">{x.s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 row-span-10 relative" style={{ background: "#e6d8b7" }}>
          <div className="absolute inset-0" style={{ filter: "sepia(0.3) saturate(0.85) contrast(1.05)" }}>
            <Scene />
          </div>
          <div
            className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{ background: `linear-gradient(180deg, ${PAPER} 0%, transparent 100%)` }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: `linear-gradient(0deg, ${PAPER} 0%, transparent 100%)` }}
          />
          <div className="absolute bottom-4 left-6 right-6 flex justify-between font-mono text-[9px] uppercase tracking-widest">
            <span className="font-serif italic normal-case tracking-normal text-xs">
              Plate I. — &ldquo;The Solutions, in studio.&rdquo;
            </span>
            <span>photographed on tri-x</span>
          </div>
        </div>

        <div
          className="col-span-12 row-span-1 flex items-center justify-between px-6 font-mono text-[10px] uppercase tracking-widest"
          style={{ borderTop: `1px solid ${INK}` }}
        >
          <span>↓ continue</span>
          <span className="font-serif italic normal-case tracking-normal">turn the page</span>
          <span>p. 01</span>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8">
          <div className="md:col-span-3 font-mono text-[10px] uppercase tracking-widest">
            chapter i
            <div className="mt-1 font-serif italic text-sm normal-case tracking-normal" style={{ color: ACCENT }}>
              Method
            </div>
          </div>
          <div className="md:col-span-9 space-y-5">
            <p className="font-serif text-2xl md:text-4xl leading-snug italic">
              To fit a foot well is to respect its history —
              <span className="not-italic">every bunion, every arch, every season it has walked.</span>
            </p>
            <p className="font-mono text-xs leading-relaxed max-w-lg" style={{ color: "#5a4a2a" }}>
              GripKicks maps morphology, matches rubber, and keeps an archive. Like a cobbler
              and an archivist had a child who understood climbing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
