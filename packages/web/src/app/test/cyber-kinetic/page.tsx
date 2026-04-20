"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

export default function CyberKinetic() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#E0E0E0] overflow-x-hidden selection:bg-[#00FF41] selection:text-[#050505] font-mono">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 border-[#333] border-b"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }}
      />

      <Link
        href="/test"
        className="fixed top-8 left-8 z-[100] flex items-center justify-center w-12 h-12 bg-[#00FF41] text-[#050505] rounded-none hover:bg-white transition-colors uppercase font-bold text-xs"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <section className="relative min-h-screen flex flex-col justify-between pt-24 px-8 pb-8 z-10 w-full mb-32">
        <div className="w-full flex justify-end">
             <div className="text-[10px] uppercase text-[#00FF41] tracking-[0.3em] flex flex-col items-end gap-2 text-right">
                 <span>System_Online.</span>
                 <span>GripKicks_Core_V2</span>
             </div>
        </div>

        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex items-center justify-center opacity-30 z-0">
             <div className="w-full h-[60vh] max-w-7xl relative mix-blend-screen pointer-events-none">
                 <Scene />
             </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end relative z-10">
          <div className="flex flex-col gap-0 max-w-4xl mix-blend-difference">
            <h1 className="text-[12vw] leading-[0.75] font-tanker text-[#00FF41] uppercase mix-blend-plus-lighter tracking-tighter">
              Dimensional
              <br />
              <span className="text-white">Analysis.</span>
            </h1>
          </div>
          
          <div className="text-sm mt-12 md:max-w-sm uppercase text-[#888] space-y-4">
             <p>Scan real-world objects. Process 3D data. Inject directly to matrix.</p>
             <div className="h-px bg-[#00FF41] w-1/3 opacity-50" />
             <p className="text-[10px] text-[#00FF41] pt-2">STATUS: AWAITING_INPUT</p>
          </div>
        </div>
      </section>

      <section className="relative px-8 py-32 z-10 w-full border-t border-[#333] bg-[#050505]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-[1800px] mx-auto">
             <div className="col-span-1 lg:col-span-3 text-[#00FF41] text-xl font-tanker uppercase flex lg:items-start lg:justify-end">
                {"// SYSTEM_MODULES"}
             </div>
             
             <div className="col-span-1 lg:col-span-9 flex flex-col gap-4">
                {[
                  { num: "01", name: "Laser Targeting", stat: "ACTIVE" },
                  { num: "02", name: "Volume Mapping", stat: "ACTIVE" },
                  { num: "03", name: "Mesh Generator", stat: "STANDBY" },
                ].map((item) => (
                  <div key={item.num} className="group flex justify-between items-end border-b border-[#333] hover:border-[#00FF41] hover:bg-[#00FF41]/10 px-4 py-8 transition-colors cursor-crosshair">
                     <div>
                        <span className="text-xs text-[#555] mb-2 block tracking-widest">{item.num} /</span>
                        <h2 className="font-tanker text-5xl md:text-7xl uppercase text-white group-hover:text-[#00FF41] transition-colors">{item.name}</h2>
                     </div>
                     <span className="text-[10px] tracking-widest text-[#888] group-hover:text-[#00FF41]">{item.stat}</span>
                  </div>
                ))}
             </div>
          </div>
      </section>
    </main>
  );
}
