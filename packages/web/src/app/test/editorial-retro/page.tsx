"use client";

import React from "react";
import { Scene } from "../test-utils";
import { EditorialLayout } from "../test-utils/editorial-layout";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.15 0 0 0 0 0.10 0 0 0 0 0.05 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PAPER = "#ece0c0";
const INK = "#26190d";

export default function EditorialRetro() {
  const header = (
    <header className="relative px-6 py-5" style={{ borderBottom: `3px double ${INK}` }}>
      <div className="max-w-6xl mx-auto flex items-end justify-between gap-6 flex-wrap">
        <div className="font-serif italic text-xl md:text-2xl">The GripKicks Gazette</div>
        <div className="font-mono text-[10px] uppercase tracking-widest hidden md:block">all the fit that&apos;s fit to print</div>
        <div className="font-mono text-[10px] uppercase tracking-widest">vol. i · no. 01 · mmxxvi</div>
      </div>
    </header>
  );

  const hero = (
    <section className="relative h-svh overflow-hidden" style={{ background: "#d9c79f", borderBottom: `1px solid ${INK}` }}>
      <div className="absolute inset-0 z-0" style={{ filter: "sepia(0.25) contrast(1.05) saturate(0.9)" }}>
        <Scene />
      </div>

      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none z-10"
        style={{ background: `linear-gradient(180deg, ${PAPER}cc 0%, transparent 100%)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-20 pointer-events-none z-10"
        style={{ background: `linear-gradient(0deg, ${PAPER}cc 0%, transparent 100%)` }}
      />

      <div className="absolute inset-x-0 bottom-0 px-6 py-3 flex items-end justify-between font-mono text-[10px] uppercase tracking-widest z-10">
        <span className="font-serif italic normal-case tracking-normal text-xs md:text-sm">Plate I. — &ldquo;The Solutions, in studio.&rdquo;</span>
        <span className="hidden md:inline">photographed on tri-x</span>
      </div>
    </section>
  );

  const content = (
    <section className="relative px-6 md:px-16 py-16" style={{ background: PAPER }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-4xl italic">
          Gazette test layout.
        </h1>

        <div className="h-px w-40 mt-10" style={{ background: INK }} />

        <p className="font-mono text-xs leading-relaxed uppercase tracking-widest mt-6 max-w-lg">
          Typography and composition test. No marketing copy.
        </p>
      </div>
    </section>
  );

  const footer = (
    <footer className="relative px-6 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between" style={{ background: PAPER }}>
      <span>gripkicks.co</span>
      <span className="hidden md:inline">est. mmxxvi</span>
      <span>p. 01 / 16</span>
    </footer>
  );

  return (
    <EditorialLayout
      grain={GRAIN}
      paper={PAPER}
      ink={INK}
      header={header}
      hero={hero}
      content={content}
      footer={footer}
    />
  );
}
