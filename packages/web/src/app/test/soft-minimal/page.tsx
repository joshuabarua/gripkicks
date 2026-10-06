"use client";

import React from "react";
import { Scene, BackButton } from "../test-utils";

export default function SoftMinimal() {
  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#5A5856] font-mono selection:bg-[#EAE5DF] selection:text-[#5A5856]">
      <BackButton
        href="/test"
        className="top-8 left-8 lg:top-12 lg:left-12 gap-4 text-xs tracking-[0.3em] uppercase opacity-50 hover:opacity-100 transition-opacity"
      >
        <span className="hidden lg:inline">Return</span>
      </BackButton>

      <section className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden px-6 pt-32 pb-24">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl pointer-events-none opacity-[0.15]">
            <Scene />
         </div>
         
         <div className="relative text-center z-10 max-w-3xl space-y-12">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-[#3A3836] leading-tight">
               Clarity in form.<br />
               Refinement in fit.
            </h1>
            <p className="text-lg md:text-xl font-light text-[#8A8681] mx-auto max-w-lg leading-relaxed">
               An approach that removes all excess noise. We simply look at what exists, map the truth of it, and find its perfect pair.
            </p>
         </div>
      </section>

      <section className="bg-[#FAF8F5] py-32 px-6">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-24">
            {[
               { title: "Observation", text: "Before measurement, there is understanding. We perceive shape naturally." },
               { title: "Precision", text: "We analyze every contour without relying on destructive templates." },
               { title: "Harmony", text: "Finding the balance between foot and footwear is a quiet art." }
            ].map((col, i) => (
               <div key={i} className="flex flex-col gap-6">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#B5B1AB]">0{i + 1}</span>
                  <div className="h-px w-full bg-[#EAE5DF]" />
                  <h3 className="font-serif text-2xl text-[#3A3836]">{col.title}</h3>
                  <p className="font-light text-sm leading-8 text-[#8A8681]">{col.text}</p>
               </div>
            ))}
         </div>
      </section>

      <footer className="py-12 text-center text-xs tracking-[0.2em] font-light uppercase text-[#B5B1AB]">
         GripKicks © 2026
      </footer>
    </main>
  );
}
