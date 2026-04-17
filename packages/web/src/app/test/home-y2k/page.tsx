"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Sparkles, Droplets, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function Y2KHome() {
  return (
    <main
      className="min-h-screen text-white overflow-x-hidden relative"
      style={{
        background:
          "linear-gradient(180deg, #87ceeb 0%, #b6e3f4 30%, #d4f4dd 70%, #7fc89c 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <div className="absolute top-[10%] left-[20%] w-80 h-80 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute top-[50%] right-[10%] w-96 h-96 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute bottom-[20%] left-[40%] w-72 h-72 rounded-full bg-green-200/40 blur-3xl" />
      </div>

      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-sora text-[11px] uppercase tracking-widest text-slate-900 bg-white/40 backdrop-blur-xl border border-white/70 px-3 py-1.5 rounded-full shadow-lg hover:bg-white/60 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back
      </Link>

      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Scene />
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-[15%] right-[10%] w-48 h-48 rounded-full bg-gradient-to-br from-white/70 via-cyan-100/40 to-transparent blur-sm" />
          <div className="absolute bottom-[25%] left-[15%] w-32 h-32 rounded-full bg-gradient-to-tr from-white/80 to-transparent" />
        </div>

        <div className="relative z-20 px-6 md:px-16 w-full pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-1.5 shadow-lg mb-8">
              <Sparkles className="w-3 h-3 text-cyan-600" />
              <span className="font-sora text-[11px] tracking-widest uppercase text-slate-700">
                Pure Performance
              </span>
            </div>

            <h1
              className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight mb-6 text-white"
              style={{
                textShadow:
                  "0 2px 20px rgba(135, 206, 235, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)",
              }}
            >
              Feel the<br />
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #7fc8ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                flow.
              </span>
            </h1>
            <p className="font-sora text-base md:text-lg max-w-md leading-relaxed text-slate-800 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl px-5 py-3 shadow-lg">
              Smart fit technology that syncs with your climb. Breathe easy, stick harder.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Droplets, label: "Hydrofoil", desc: "Moisture-mapped fit" },
            { icon: Sparkles, label: "CrystalSync", desc: "Shape detection" },
            { icon: Zap, label: "PowerGrip", desc: "Pressure calibration" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/30 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl hover:bg-white/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-tanker text-2xl text-slate-900 mb-1">{item.label}</h3>
              <p className="font-sora text-xs text-slate-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
