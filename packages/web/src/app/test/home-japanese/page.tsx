"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

const HALFTONE = "radial-gradient(circle, #e4002b 1.2px, transparent 1.4px)";

export default function JapaneseHome() {
  return (
    <main className="min-h-screen bg-[#fff8ec] text-[#1a1a1a] overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20"
        style={{ backgroundImage: HALFTONE, backgroundSize: "10px 10px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-sora text-[11px] uppercase tracking-widest text-[#1a1a1a] bg-[#fff8ec] border-2 border-[#1a1a1a] px-3 py-1.5 hover:bg-[#ffe600] transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back
      </Link>

      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b-4 border-[#1a1a1a]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#ffe600]" />
          <div
            className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full"
            style={{
              background: "repeating-conic-gradient(#e4002b 0deg 12deg, transparent 12deg 24deg)",
              opacity: 0.85,
            }}
          />
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-full h-full">
            <Scene />
          </div>
        </div>

        <div className="relative z-20 px-6 md:px-16 w-full pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto max-w-3xl"
          >
            <div className="inline-block bg-[#1a1a1a] text-[#ffe600] px-3 py-1 font-sora text-xs tracking-[0.3em] uppercase mb-6">
              新発売 · New Drop
            </div>
            <h1 className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight text-[#1a1a1a] mb-6">
              足に<br />
              <span className="inline-block bg-[#e4002b] text-[#fff8ec] px-4 py-1 -skew-x-6">
                FITTO!
              </span>
            </h1>
            <p className="font-sora text-base md:text-lg max-w-md leading-relaxed text-[#1a1a1a]/80 border-l-4 border-[#e4002b] pl-4">
              The most precise fit system for climbing shoes. Made with obsession. <span className="font-bold">Stick like rubber.</span>
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3 pointer-events-none">
          <div className="font-tanker text-5xl text-[#e4002b]">★</div>
          <div className="font-sora text-[10px] uppercase tracking-widest">kirakira fit</div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16 bg-[#fff8ec]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="relative bg-[#ffe600] border-4 border-[#1a1a1a] p-8">
            <div className="absolute -top-4 -left-4 bg-[#e4002b] text-[#fff8ec] font-tanker text-2xl px-3 py-1">
              01
            </div>
            <h2 className="font-tanker text-4xl mb-3 uppercase">Foot Lab</h2>
            <p className="font-sora text-sm leading-relaxed">
              Egyptian. Roman. Greek. Know your shape. No guesswork.
            </p>
            <div className="mt-6 inline-block font-sora text-[10px] uppercase tracking-[0.3em] border-b-2 border-[#1a1a1a] pb-0.5">
              Start scan →
            </div>
          </div>

          <div className="relative bg-[#e4002b] border-4 border-[#1a1a1a] p-8 text-[#fff8ec] md:mt-16">
            <div className="absolute -top-4 -left-4 bg-[#ffe600] text-[#1a1a1a] font-tanker text-2xl px-3 py-1 border-2 border-[#1a1a1a]">
              02
            </div>
            <h2 className="font-tanker text-4xl mb-3 uppercase">Sole Mate</h2>
            <p className="font-sora text-sm leading-relaxed">
              Algorithm meets feeling. Find your shoe soulmate.
            </p>
            <div className="mt-6 inline-block font-sora text-[10px] uppercase tracking-[0.3em] border-b-2 border-[#fff8ec] pb-0.5">
              Match me →
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-16 text-center">
          <div className="inline-flex items-center gap-4 font-tanker text-3xl md:text-5xl">
            <span>GRIP</span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#e4002b]" />
            <span>KICKS</span>
            <span className="inline-block w-3 h-3 rounded-full bg-[#e4002b]" />
            <span>4EVER</span>
          </div>
        </div>
      </section>
    </main>
  );
}
