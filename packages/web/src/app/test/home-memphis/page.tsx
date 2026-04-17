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

const CHECKER =
  "repeating-conic-gradient(#111 0% 25%, #fff 0% 50%)";

const TEAL = "#3fd8c7";
const PINK = "#ff6fb3";
const YELLOW = "#ffe23f";
const PURPLE = "#8b5cf6";

export default function MemphisHome() {
  return (
    <main className="min-h-screen bg-[#fdfbf3] text-black overflow-x-hidden relative">
      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black bg-white border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative min-h-[90vh] overflow-hidden">
        <div
          className="absolute top-[8%] right-[10%] w-40 h-40"
          style={{ background: CHECKER, backgroundSize: "24px 24px" }}
        />
        <div
          className="absolute bottom-[15%] left-[6%] w-48 h-48 rounded-full"
          style={{ background: PINK }}
        />
        <div
          className="absolute top-[40%] left-[8%] w-24 h-24"
          style={{
            background: `repeating-linear-gradient(45deg, ${TEAL} 0 8px, transparent 8px 16px)`,
          }}
        />
        <svg
          className="absolute top-[50%] right-[8%]"
          width="140"
          height="80"
          viewBox="0 0 140 80"
          fill="none"
        >
          <path
            d="M5 40 Q 20 5, 35 40 T 65 40 T 95 40 T 125 40"
            stroke={PURPLE}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute bottom-[8%] right-[15%] w-20 h-20 rotate-45"
          style={{ background: YELLOW, border: "3px solid black" }}
        />

        <div className="absolute inset-0 z-10">
          <Scene />
        </div>

        <div className="relative z-20 px-6 md:px-16 pt-32 pb-12 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto max-w-3xl"
          >
            <div
              className="inline-block font-mono text-[11px] uppercase tracking-[0.3em] mb-6 px-3 py-1 border-2 border-black"
              style={{ background: YELLOW }}
            >
              hello 1986
            </div>

            <h1 className="font-tanker text-7xl md:text-9xl leading-[0.85] tracking-tight text-black mb-6">
              Fit your{" "}
              <span className="inline-block" style={{ color: PINK, WebkitTextStroke: "2px black" }}>
                funky
              </span>{" "}
              <br />
              little{" "}
              <span
                className="inline-block px-3 -skew-x-6"
                style={{ background: TEAL, color: "black", border: "3px solid black" }}
              >
                feet.
              </span>
            </h1>

            <div className="max-w-sm bg-white border-2 border-black p-4">
              <p className="font-mono text-xs leading-relaxed">
                A fit tool with <span className="font-bold" style={{ color: PURPLE }}>personality</span>.
                No more vibes-based shoe shopping.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { title: "Foot Lab", bg: PINK, shape: "rounded-full" },
            { title: "Sole Mate", bg: TEAL, shape: "" },
            { title: "Sanctuary", bg: YELLOW, shape: "rotate-3" },
          ].map((card) => (
            <div
              key={card.title}
              className={`${card.shape} border-2 border-black p-8 hover:-translate-y-1 transition-transform`}
              style={{ background: card.bg }}
            >
              <div className="font-tanker text-3xl mb-2">{card.title}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest">explore →</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
