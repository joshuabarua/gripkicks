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

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const PINK = "#ff4fa3";
const BLUE = "#2b5fff";
const PAPER = "#f5ecd6";

export default function RisoHome() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: PAPER, color: "#1a1a1a" }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-[60] mix-blend-multiply opacity-40"
        style={{ backgroundImage: GRAIN, backgroundSize: "240px 240px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border-2"
        style={{ borderColor: PINK, color: PINK, background: PAPER }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply opacity-80"
          style={{ background: PINK }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full mix-blend-multiply opacity-80"
          style={{ background: BLUE }}
        />

        <div className="absolute inset-0 z-10 mix-blend-multiply opacity-90">
          <Scene />
        </div>

        <div className="relative z-20 px-6 md:px-16 w-full pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto max-w-2xl"
          >
            <div
              className="inline-block font-mono text-[11px] uppercase tracking-[0.3em] mb-6 px-2 py-1"
              style={{ background: PAPER, color: PINK, border: `1px solid ${PINK}` }}
            >
              zine 01 · printed in 2 inks
            </div>
            <h1
              className="font-tanker text-7xl md:text-9xl leading-[0.85] tracking-tight mb-6"
              style={{ color: "#1a1a1a" }}
            >
              <span style={{ color: PINK }}>Find</span> the<br />
              shoe that{" "}
              <span
                style={{
                  color: BLUE,
                  textDecoration: "underline",
                  textDecorationStyle: "wavy",
                  textUnderlineOffset: "10px",
                }}
              >
                loves
              </span>
              <br />
              your foot.
            </h1>
            <p
              className="font-mono text-sm md:text-base max-w-md leading-relaxed"
              style={{ color: "#2a2a2a" }}
            >
              Hand-measured. Hand-matched. For people who care about the foot, not the hype.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div
            className="p-8 border-2"
            style={{ borderColor: "#1a1a1a", background: PAPER }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-3 inline-block px-2 py-0.5"
              style={{ background: PINK, color: PAPER }}
            >
              chapter 01
            </div>
            <h2 className="font-tanker text-4xl mb-3">the foot lab</h2>
            <p className="font-mono text-xs leading-relaxed">
              Map your shape. Know your volume. Stop buying shoes that never fit.
            </p>
          </div>

          <div
            className="p-8 border-2 md:mt-12"
            style={{ borderColor: "#1a1a1a", background: PAPER }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-3 inline-block px-2 py-0.5"
              style={{ background: BLUE, color: PAPER }}
            >
              chapter 02
            </div>
            <h2 className="font-tanker text-4xl mb-3">the sole mate</h2>
            <p className="font-mono text-xs leading-relaxed">
              A quiet algorithm, a gentle match. No hype. Just fit.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
