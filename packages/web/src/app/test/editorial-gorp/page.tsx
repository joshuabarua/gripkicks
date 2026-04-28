"use client";

import React from "react";
import { Scene } from "../test-utils";
import { EditorialLayout } from "../test-utils/editorial-layout";
import { EditorialContent } from "../test-utils/editorial-content";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.14 0 0 0 0 0.08 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const TOPO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%23463622' stroke-width='0.6' opacity='0.3'%3E%3Cpath d='M0 60 Q100 40 200 80 T400 60'/%3E%3Cpath d='M0 120 Q100 100 200 140 T400 120'/%3E%3Cpath d='M0 180 Q100 160 200 200 T400 180'/%3E%3Cpath d='M0 240 Q100 220 200 260 T400 240'/%3E%3Cpath d='M0 300 Q100 280 200 320 T400 300'/%3E%3Cpath d='M0 360 Q100 340 200 380 T400 360'/%3E%3C/g%3E%3C/svg%3E\")";

const PAPER = "#e4d9ba";
const INK = "#231c10";
const ORANGE = "#d2571b";

export default function EditorialGorp() {
  const extraBackgrounds = (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
      style={{ backgroundImage: TOPO, backgroundSize: "400px 400px" }}
    />
  );

  const header = (
    <header
      className="relative px-6 py-3 flex items-center justify-between gap-4 flex-wrap font-mono text-[10px] uppercase tracking-widest"
      style={{ borderBottom: `1px solid ${INK}`, background: PAPER }}
    >
      <span>field journal · vol. i</span>
      <span className="hidden md:inline">N 47°16′ · E 11°23′</span>
      <span>elev. 2340m</span>
      <span>04°C</span>
    </header>
  );

  const hero = (
    <section className="relative h-svh overflow-hidden" style={{ borderBottom: `1px solid ${INK}`, background: PAPER }}>
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
  );

  const content = (
    <EditorialContent
      sectionNumber="1"
      asideContent="entry 001"
      heading="Field journal test."
      description="Layout and composition test. No marketing copy."
      ink={INK}
      paper={PAPER}
    />
  );

  const footer = (
    <footer className="relative px-6 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between" style={{ background: PAPER }}>
      <span>gripkicks · field edition</span>
      <span className="hidden md:inline">printed on kraft</span>
      <span>entry 001 / 012</span>
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
      extraBackgrounds={extraBackgrounds}
    />
  );
}
