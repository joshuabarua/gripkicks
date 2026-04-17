"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const VARIATIONS = [
  { href: "/", label: "Original", desc: "Current dashboard look" },
  { href: "/test/home-japanese", label: "Shōwa Pop Art", desc: "Japanese retro ad posters — halftones, burst shapes, kirakira" },
  { href: "/test/home-y2k", label: "Frutiger Aero", desc: "Glossy bubbles, chrome, aqua gradients, translucent glass" },
  { href: "/test/home-brutalist", label: "Brutalist Editorial", desc: "Huge type, raw grids, mono + serif clash" },
  { href: "/test/home-riso", label: "Risograph Zine", desc: "2-ink overprint, paper grain, fluoro pink + blue" },
  { href: "/test/home-skate", label: "90s Skate Mag", desc: "Collage, xerox, sticker bomb, marker scribble" },
  { href: "/test/home-gorp", label: "Gorpcore Trail", desc: "Topo maps, spec sheets, safety orange" },
  { href: "/test/home-memphis", label: "Memphis 80s", desc: "Geometric squiggles, checkerboard, pastel neon" },
];

export default function HomeDesignsIndex() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col items-center justify-center p-12">
      <div className="max-w-3xl w-full">
        <h1 className="font-tanker text-6xl mb-2">Home Designs</h1>
        <p className="font-sora text-sm text-neutral-500 mb-12">Pick a theme to preview.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VARIATIONS.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="group border border-neutral-300 bg-white p-6 hover:border-neutral-900 transition-all"
            >
              <div className="flex justify-between items-start gap-3">
                <h2 className="font-tanker text-xl">{v.label}</h2>
                <ArrowUpRight className="w-5 h-5 shrink-0 group-hover:rotate-45 transition-transform" />
              </div>
              <p className="font-sora text-xs text-neutral-500 mt-2 leading-relaxed">{v.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
