"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest opacity-40">
      loading plate…
    </div>
  ),
});

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.15 0 0 0 0 0.10 0 0 0 0 0.05 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PAPER = "#ece0c0";
const INK = "#26190d";

export default function EditorialRetro() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: PAPER, color: INK }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-55"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-[70] inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: INK, background: PAPER, color: INK }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <header className="relative px-6 py-5" style={{ borderBottom: `3px double ${INK}` }}>
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div className="font-serif italic text-xl md:text-2xl">
            The GripKicks Gazette
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest hidden md:block">
            all the fit that&apos;s fit to print
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest">
            vol. i · no. 01 · mmxxvi
          </div>
        </div>
      </header>

      <section
        className="relative h-[78vh] w-full overflow-hidden"
        style={{ background: "#d9c79f", borderBottom: `1px solid ${INK}` }}
      >
        <div
          className="absolute inset-0 z-10"
          style={{ filter: "sepia(0.25) contrast(1.05) saturate(0.9)" }}
        >
          <Scene />
        </div>

        <div className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(180deg, ${PAPER}cc 0%, transparent 100%)` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(0deg, ${PAPER}cc 0%, transparent 100%)` }}
        />

        <div className="absolute inset-x-0 bottom-0 px-6 py-3 flex items-end justify-between font-mono text-[10px] uppercase tracking-widest">
          <span className="font-serif italic normal-case tracking-normal text-xs md:text-sm">
            Plate I. — &ldquo;The Solutions, in studio.&rdquo;
          </span>
          <span className="hidden md:inline">photographed on tri-x</span>
        </div>
      </section>

      <section className="relative px-6 md:px-16 py-16" style={{ background: PAPER }}>
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-4">
            · featured story ·
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-4xl">
            A quiet revolution
            <br />
            <span className="italic">in how we fit </span>
            <span className="font-tanker uppercase">the climber&apos;s foot.</span>
          </h1>

          <div className="h-px w-40 mt-10 mb-10" style={{ background: INK }} />

          <div className="grid md:grid-cols-3 gap-10">
            <p className="font-serif text-base md:text-lg leading-relaxed italic">
              For a hundred years, the climbing shoe came in one of three widths and the
              climber was told to suffer. Suffering was part of the sport. One apprenticed to
              a shoe the way one apprenticed to a route.
            </p>
            <p className="font-serif text-base md:text-lg leading-relaxed">
              <span className="font-tanker text-4xl leading-none float-left mr-1">G</span>
              ripKicks does what cobblers used to do — it looks at your foot first, and the
              catalog second. Shape, volume, history. The shoe wall is no longer a
              guessing game.
            </p>
            <p className="font-mono text-xs leading-relaxed uppercase tracking-widest">
              Filed from chamonix. Dispatch received 0600h.
              A correspondent observed the apparatus in use for three days.
              She did not go back to her old shoes.
            </p>
          </div>
        </div>
      </section>

      <section className="relative px-6 md:px-16 py-14" style={{ background: PAPER, borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}` }}>
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { n: "i.", s: "Foot Lab", desc: "the measuring room" },
            { n: "ii.", s: "Sole Mate", desc: "the matchmaker" },
            { n: "iii.", s: "Sanctuary", desc: "the archive" },
          ].map((x) => (
            <div key={x.n} className="space-y-2">
              <div className="font-serif italic text-2xl">{x.n}</div>
              <div className="font-tanker text-2xl md:text-3xl uppercase">{x.s}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest">
                {x.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative px-6 py-4 font-mono text-[10px] uppercase tracking-widest flex justify-between"
        style={{ background: PAPER }}
      >
        <span>gripkicks.co</span>
        <span className="hidden md:inline">est. mmxxvi</span>
        <span>p. 01 / 16</span>
      </footer>
    </main>
  );
}
