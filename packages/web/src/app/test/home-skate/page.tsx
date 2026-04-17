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

const XEROX =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

export default function SkateHome() {
  return (
    <main className="min-h-screen bg-[#e8e4d8] text-black overflow-x-hidden relative">
      <div
        className="pointer-events-none fixed inset-0 z-[60] opacity-40 mix-blend-multiply"
        style={{ backgroundImage: XEROX, backgroundSize: "300px 300px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-black bg-yellow-300 border-2 border-black px-3 py-1.5 -rotate-2 hover:rotate-0 transition-transform"
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-[12%] right-[8%] bg-red-500 text-white font-tanker text-xl px-3 py-1 rotate-6 border-2 border-black shadow-[4px_4px_0_black]">
            NEW!!
          </div>
          <div className="absolute bottom-[18%] left-[6%] bg-yellow-300 text-black font-tanker text-sm px-2 py-1 -rotate-3 border-2 border-black">
            MADE IN GARAGE
          </div>
          <div className="absolute top-[40%] left-[5%] w-16 h-16 rounded-full bg-lime-400 border-2 border-black flex items-center justify-center font-tanker text-2xl rotate-12">
            ★
          </div>
        </div>

        <div className="relative z-20 px-6 md:px-16 pt-32 pb-20 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-auto max-w-3xl"
          >
            <h1 className="font-tanker text-7xl md:text-[10rem] leading-[0.8] tracking-tighter uppercase">
              <span className="inline-block bg-black text-white px-2 -rotate-1">Shoes</span>
              <br />
              <span className="inline-block text-red-600 -ml-4 rotate-1" style={{ WebkitTextStroke: "2px black" }}>
                That
              </span>
              <br />
              <span className="inline-block bg-yellow-300 text-black px-2 border-4 border-black -rotate-2 shadow-[6px_6px_0_black]">
                SLAP!!
              </span>
            </h1>

            <div className="mt-8 bg-white border-2 border-black p-3 max-w-sm -rotate-1 shadow-[4px_4px_0_black]">
              <p className="font-mono text-xs leading-relaxed">
                Stop letting shoe companies guess your foot. We built the fit tool they don&apos;t
                want you to have. It&apos;s free. It rips.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { title: "FOOT LAB", color: "bg-red-500 text-white", rotate: "-rotate-2" },
            { title: "SOLE MATE", color: "bg-yellow-300 text-black", rotate: "rotate-1" },
            { title: "SANCTUARY", color: "bg-black text-yellow-300", rotate: "-rotate-1" },
          ].map((card) => (
            <div
              key={card.title}
              className={`${card.color} ${card.rotate} border-2 border-black p-6 shadow-[6px_6px_0_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_black] transition-all`}
            >
              <div className="font-tanker text-3xl uppercase mb-2">{card.title}</div>
              <div className="font-mono text-xs uppercase tracking-widest">click it →</div>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-16 flex flex-wrap gap-3 justify-center">
          {["#fitcheck", "#rubbergang", "#deathgrip", "#nomoreblisters", "#ripit"].map((tag) => (
            <span
              key={tag}
              className="font-mono text-xs bg-white border-2 border-black px-2 py-1 -rotate-1 hover:rotate-0 transition-transform"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
