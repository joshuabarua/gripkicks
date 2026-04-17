"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Mountain, Compass, Activity } from "lucide-react";
import { motion } from "framer-motion";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

const TOPO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='%23594a3a' stroke-width='0.5' opacity='0.4'%3E%3Cpath d='M0 80 Q100 60 200 100 T400 80'/%3E%3Cpath d='M0 140 Q100 120 200 160 T400 140'/%3E%3Cpath d='M0 200 Q100 180 200 220 T400 200'/%3E%3Cpath d='M0 260 Q100 240 200 280 T400 260'/%3E%3Cpath d='M0 320 Q100 300 200 340 T400 320'/%3E%3C/g%3E%3C/svg%3E\")";

const OLIVE = "#5e5a3a";
const SAND = "#e8dfc4";
const ORANGE = "#ff6b1a";
const INK = "#2a2922";

export default function GorpHome() {
  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      style={{ background: SAND, color: INK }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{ backgroundImage: TOPO, backgroundSize: "400px 400px" }}
      />

      <Link
        href="/test"
        className="fixed top-24 left-6 z-50 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border"
        style={{ borderColor: INK, color: INK, background: SAND }}
      >
        <ArrowLeft className="w-3 h-3" /> back
      </Link>

      <section className="relative min-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 z-10">
          <Scene />
        </div>

        <div className="absolute top-24 right-6 z-20 font-mono text-[10px] uppercase tracking-widest text-right space-y-1"
          style={{ color: INK }}
        >
          <div>N 47°16′ · E 11°23′</div>
          <div>elev. 2340m</div>
          <div>temp. 04°C</div>
        </div>

        <div className="relative z-20 px-6 md:px-16 pt-32 pb-12 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-auto max-w-3xl"
          >
            <div
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] px-2 py-1 mb-6"
              style={{ background: ORANGE, color: "#fff" }}
            >
              <Compass className="w-3 h-3" /> field spec · v1
            </div>

            <h1 className="font-tanker text-6xl md:text-8xl leading-[0.9] tracking-tight mb-6" style={{ color: INK }}>
              Built for the{" "}
              <span
                className="inline-block border-b-4 pb-1"
                style={{ borderColor: ORANGE }}
              >
                terrain
              </span>{" "}
              under your foot.
            </h1>

            <div className="grid grid-cols-2 gap-4 max-w-md border-t border-b py-4" style={{ borderColor: INK }}>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: OLIVE }}>
                  shape
                </div>
                <div className="font-mono text-sm">Egyptian / Roman / Greek</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: OLIVE }}>
                  volume
                </div>
                <div className="font-mono text-sm">Low / Mid / High</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.3em] mb-8 pb-2 border-b"
            style={{ color: OLIVE, borderColor: OLIVE }}
          >
            § specification sheet
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mountain, label: "FOOT LAB", spec: "3D morphology scan", code: "FL-01" },
              { icon: Compass, label: "SOLE MATE", spec: "Terrain → rubber match", code: "SM-02" },
              { icon: Activity, label: "SANCTUARY", spec: "Fit history archive", code: "SC-03" },
            ].map((item) => (
              <div
                key={item.label}
                className="border p-6 hover:bg-white/40 transition-colors"
                style={{ borderColor: INK, background: "rgba(255,255,255,0.2)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <item.icon className="w-5 h-5" style={{ color: ORANGE }} />
                  <span className="font-mono text-[10px]" style={{ color: OLIVE }}>
                    {item.code}
                  </span>
                </div>
                <div className="font-tanker text-2xl mb-1" style={{ color: INK }}>{item.label}</div>
                <div className="font-mono text-xs" style={{ color: OLIVE }}>{item.spec}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
