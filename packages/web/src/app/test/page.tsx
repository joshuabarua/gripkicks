"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const VARIATIONS = [
  { href: "/", id: "00", label: "Production", desc: "The current system, live and operational.", type: "CORE" },
  { href: "/test/cyber-kinetic", id: "01", label: "Cyber-Kinetic", desc: "Neo-brutalist tech. Loud, dark, neon, moving.", type: "CONCEPT" },
  { href: "/test/soft-minimal", id: "02", label: "Soft Minimal", desc: "Quiet luxury. Space, elegant typography, refined.", type: "CONCEPT" },
  { href: "/test/editorial-japanese", id: "03", label: "Japanese", desc: "Cream paper, hinomaru disc, kanji accents, halftone grain.", type: "CONCEPT" },
  { href: "/test/editorial-retro", id: "04", label: "Retro", desc: "The GripKicks Gazette — sepia studio plate, serif swashes.", type: "CONCEPT" },
  { href: "/test/editorial-gorp", id: "05", label: "Gorpcore", desc: "Field journal, topo lines, coordinates, field-verified stamp.", type: "CONCEPT" },
];

export default function HomeDesignsIndex() {
  return (
    <main className="min-h-screen bg-[#EEEBE5] text-[#111111] font-sora selection:bg-[#111111] selection:text-[#EEEBE5]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-12 md:py-24">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-end mb-32">
          <div className="lg:col-span-8">
            <p className="text-sm tracking-[0.2em] uppercase font-bold text-[#FF3800] mb-8">
              Internal Directory
            </p>
            <h1 className="font-tanker text-[15vw] sm:text-[12vw] lg:text-[10vw] leading-[0.85] uppercase tracking-tight mix-blend-multiply text-[#111111]">
              Frontend <br/>
              <span className="text-[#8C877E] italic">Archived.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 lg:mb-4">
            <p className="text-base md:text-lg leading-relaxed text-[#8C877E] max-w-sm">
              An index of visual explorations, experimental aesthetic directions, and the live production environment for GripKicks.
            </p>
          </div>
        </div>

        {/* List Section */}
        <div className="relative">
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[2px] bg-[#D4CEC4]" />
          
          <div className="flex flex-col gap-12 lg:gap-24 lg:pl-24">
            {VARIATIONS.map((v) => (
              <Link
                key={v.href}
                href={v.href}
                className="group relative block"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline relative z-10">
                  {/* ID */}
                  <div className="lg:col-span-2 font-tanker text-3xl md:text-4xl text-[#8C877E] transition-colors duration-300 group-hover:text-[#FF3800]">
                    [{v.id}]
                  </div>
                  
                  {/* Title & Desc */}
                  <div className="lg:col-span-8 relative">
                    <h2 className="font-tanker text-5xl md:text-7xl lg:text-[7rem] uppercase leading-none mb-6 lg:-ml-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-6">
                      {v.label}
                    </h2>
                    <p className="font-sora text-lg md:text-xl text-[#8C877E] max-w-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-6 group-hover:text-[#111111]">
                      {v.desc}
                    </p>
                  </div>

                  {/* Type / CTA */}
                  <div className="lg:col-span-2 flex flex-row lg:flex-col justify-between lg:justify-start lg:items-end gap-4 mt-8 lg:mt-0">
                    <span className="text-xs tracking-[0.15em] uppercase font-bold py-2 border-b-[2px] border-transparent group-hover:border-[#111111] transition-colors">
                      {v.type}
                    </span>
                    <div className="w-14 h-14 rounded-full border-[2px] border-[#D4CEC4] flex items-center justify-center transition-all duration-500 group-hover:bg-[#FF3800] group-hover:border-[#FF3800] group-hover:text-[#EEEBE5]">
                      <ArrowUpRight className="w-6 h-6 transition-transform duration-500 group-hover:rotate-45" />
                    </div>
                  </div>
                </div>
                
                {/* Decorative Line that draws across on hover */}
                <div className="absolute -bottom-6 lg:-bottom-12 left-0 right-0 h-[2px] bg-[#111111] origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 z-0" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
