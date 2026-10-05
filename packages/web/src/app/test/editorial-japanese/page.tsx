"use client";

import React from "react";
import { Scene } from "../test-utils";
import { EditorialLayout, EditorialFooter } from "../test-utils/editorial-layout";
import { EditorialContent } from "../test-utils/editorial-content";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PAPER = "#f1e6ca";
const INK = "#141311";
const RED = "#c8102e";

export default function EditorialJapanese() {
  const header = (
    <header
      className="relative flex items-center justify-between px-6 py-3 font-mono text-[10px] uppercase tracking-widest"
      style={{ borderBottom: `1px solid ${INK}` }}
    >
      <span>第壱号 · no. 01</span>
      <span className="hidden md:inline">gripkicks · a fit quarterly</span>
      <span>東京 mmxxvi</span>
    </header>
  );

  const hero = (
    <section className="relative h-svh overflow-hidden" style={{ background: PAPER, borderBottom: `1px solid ${INK}` }}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] rounded-full pointer-events-none"
        style={{ background: RED }}
        aria-hidden
      />

      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-6 py-3 flex items-end justify-between font-mono text-[9px] uppercase tracking-widest z-10">
        <span>fig. 01, specimen · solutions 40.5eu</span>
        <span className="hidden md:inline">scale 1:1 · morphology</span>
        <span>t+00:42</span>
      </div>
    </section>
  );

  const content = (
    <EditorialContent
      sectionNumber="1"
      asideContent="by a fit quarterly"
      heading="Issue one."
      description="Layout and typography test. No marketing copy."
      ink={INK}
      paper={PAPER}
    />
  );

  const footer = (
    <EditorialFooter paper={PAPER} leftText="gripkicks.co" centerText="printed on recycled paper" rightText="p. 01 / 12" />
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
