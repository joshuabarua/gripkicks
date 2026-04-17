"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function BrutalistHome() {
  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">
      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black bg-white border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative min-h-[90vh] border-b border-black grid grid-cols-12 grid-rows-12">
        <div className="col-span-12 row-span-1 border-b border-black px-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <span>issue №01 · fit protocol</span>
          <span>gripkicks.co</span>
          <span>mmxxvi</span>
        </div>

        <div className="col-span-12 md:col-span-7 row-span-10 relative border-r border-black">
          <div className="absolute inset-0">
            <Scene />
          </div>
          <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-widest">
            fig. 01 — solutions 40.5eu · preview model
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 row-span-10 flex flex-col justify-between p-6 md:p-10">
          <div className="space-y-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em]">
              A fit system, honestly
            </div>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight italic">
              Every foot is a different architecture.
            </h1>
            <div className="h-px bg-black w-24" />
            <p className="font-mono text-xs leading-relaxed max-w-sm">
              GripKicks measures what other fit tools ignore. Shape. Volume. Ritual.
              The result: you stop guessing shoes and start picking them.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            <div className="flex justify-between items-baseline border-t border-black pt-3">
              <span className="font-mono text-[10px] uppercase tracking-widest">section</span>
              <span className="font-serif italic text-lg">Foot Lab</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-black pt-3">
              <span className="font-mono text-[10px] uppercase tracking-widest">service</span>
              <span className="font-serif italic text-lg">Sole Mate</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-b border-black py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest">archive</span>
              <span className="font-serif italic text-lg">Sanctuary</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 row-span-1 border-t border-black px-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <span>↓ scroll</span>
          <span>continue reading</span>
          <span>p. 01 / 48</span>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 border-b border-black">
        <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-6">
          <div className="md:col-span-3 font-mono text-[10px] uppercase tracking-widest">
            § 1.1
            <div className="mt-1 font-serif italic text-sm normal-case tracking-normal">Method</div>
          </div>
          <div className="md:col-span-9 space-y-4">
            <p className="font-serif text-2xl md:text-4xl leading-snug">
              <span className="italic">Forget guessing sizes.</span> The foot is a 3D body; your fit should
              match it in three dimensions. Shape. Volume. Pressure.
            </p>
            <p className="font-mono text-xs text-black/60 leading-relaxed max-w-lg">
              A lab for your foot, a matchmaker for your rubber, an archive for your shelf.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
