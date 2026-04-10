"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function HomeDesignsIndex() {
  return (
    <main className="min-h-screen bg-black text-brand-chalk flex flex-col items-center justify-center p-12">
      <div className="max-w-2xl w-full">
        <h1 className="font-tanker text-5xl text-brand-chalk mb-8">
          Home Page <span className="text-brand-red">Variations</span>
        </h1>
        <p className="font-sora text-brand-putty/50 mb-12">
          Select a retro sci-fi variation below to preview it.
        </p>

        <div className="flex flex-col gap-6">
          <Link href="/" className="group border border-white/10 p-6 hover:border-brand-red hover:bg-brand-red/5 transition-all">
            <div className="flex justify-between items-center">
              <h2 className="font-tanker text-2xl text-white group-hover:text-brand-red transition-colors">Original Dashboard Look</h2>
              <ArrowUpRight className="w-5 h-5 text-brand-red group-hover:rotate-45 transition-transform" />
            </div>
          </Link>
          <Link href="/test/home-analog" className="group border border-white/10 p-6 hover:border-brand-red hover:bg-brand-red/5 transition-all">
            <div className="flex justify-between items-center">
              <h2 className="font-tanker text-2xl text-white group-hover:text-brand-red transition-colors">Variation 1: Analog / Worn VHS</h2>
              <ArrowUpRight className="w-5 h-5 text-brand-red group-hover:rotate-45 transition-transform" />
            </div>
            <p className="font-sora text-sm text-brand-putty/50 mt-2">Degraded CRT, phosphor glow, heavy scanlines.</p>
          </Link>
          <Link href="/test/home-terminal" className="group border border-white/10 p-6 hover:border-brand-red hover:bg-brand-red/5 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-tanker text-2xl text-white group-hover:text-brand-red transition-colors">Variation 2: Command Line Terminal</h2>
              </div>
              <ArrowUpRight className="w-5 h-5 text-brand-red group-hover:rotate-45 transition-transform" />
            </div>
            <p className="font-sora text-sm text-brand-putty/50 mt-2">Raw data feed, monospaced text, hacker console.</p>
          </Link>
          <Link href="/test/home-hud" className="group border border-white/10 p-6 hover:border-brand-red hover:bg-brand-red/5 transition-all">
            <div className="flex justify-between items-center">
              <h2 className="font-tanker text-2xl text-white group-hover:text-brand-red transition-colors">Variation 3: 80s Sci-Fi Console HUD</h2>
              <ArrowUpRight className="w-5 h-5 text-brand-red group-hover:rotate-45 transition-transform" />
            </div>
            <p className="font-sora text-sm text-brand-putty/50 mt-2">Pinned edge panels, targeting computers, structured UI.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
