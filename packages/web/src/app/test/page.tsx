"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const VARIATIONS = [
  { href: "/", label: "Original", desc: "Current dashboard look" },
  { href: "/test/editorial-japanese", label: "Editorial · Japanese", desc: "Cream paper, hinomaru disc, kanji accents, halftone grain" },
  { href: "/test/editorial-retro", label: "Editorial · Retro", desc: "The GripKicks Gazette — sepia studio plate, serif swashes" },
  { href: "/test/editorial-gorp", label: "Editorial · Gorpcore", desc: "Field journal, topo lines, coordinates, field-verified stamp" },
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
