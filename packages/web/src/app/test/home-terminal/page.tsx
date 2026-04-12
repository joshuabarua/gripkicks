"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => <div className="text-green-500 font-mono text-xs">Loading kernel module...</div>,
});

const ACTIVITY_FEED = [
  { user: "Mika", action: "fit note", shoe: "Solutions" },
  { user: "Sage", action: "matched", shoe: "Sole Mate" },
  { user: "Rhea", action: "shared", shoe: "Foot Lab" },
  { user: "Noor", action: "saved", shoe: "Mastia" },
];

export default function TerminalHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [textStage, setTextStage] = useState(0);
  const { scrollY } = useScroll();
  const isReducedEffects = useReducedEffects();

  const heroOpacity = useTransform(scrollY, [0, 500], [0.6, 0.1]);

  useEffect(() => {
    let mounted = true;
    async function loadUserCount() {
      try {
        const response = await fetchApi<{ count: number }>("/api/v1/users/count");
        if (response.isOk() && mounted) {
          setTotalUsers(response.value.count);
        }
      } catch {
        if (mounted) setTotalUsers(null);
      }
    }
    loadUserCount();
    return () => { mounted = false; };
  }, []);

  // Simple typing effect sequencer
  useEffect(() => {
    if (isReducedEffects) {
      setTextStage(10);
      return;
    }
    const timer1 = setTimeout(() => setTextStage(1), 500);
    const timer2 = setTimeout(() => setTextStage(2), 1500);
    const timer3 = setTimeout(() => setTextStage(3), 2500);
    const timer4 = setTimeout(() => setTextStage(4), 3500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
  }, [isReducedEffects]);

  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name || "root";
  const memberCount = totalUsers ?? 0;

  const terminalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <main className="min-h-screen bg-black text-[#0f0] font-mono selection:bg-[#0f0] selection:text-black antialiased overflow-x-hidden p-6 md:p-12 relative">
      <div className="scanline-overlay opacity-30" />

      {/* Back button */}
      <div className="fixed top-24 left-6 z-50">
        <Link href="/test" className="text-xs uppercase text-white/50 hover:text-[#0f0] transition-colors flex items-center gap-2">
          &lt;cd ..&gt;
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mt-24 relative z-10">
        
        {/* Terminal Header */}
        <div className="mb-12 border-b border-[#0f0]/30 pb-4">
          <p className="text-sm">GripKicks OS v3.11.4 [Version 10.0.19045.2965]</p>
          <p className="text-sm">(c) GripKicks Corporation. All rights reserved.</p>
          <br/>
          <p className="text-sm">C:\Users\{userName}&gt; ./init_system.sh</p>
        </div>

        {/* Hero Area disguised as a terminal boot sequence */}
        <div className="relative border border-[#0f0]/20 bg-black/80 h-[50vh] mb-16 p-4 flex flex-col justify-end overflow-hidden">
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="absolute inset-0 z-0 pointer-events-none filter sepia hue-rotate-90 saturate-[2] brightness-75 mix-blend-screen"
          >
            <Scene />
            {/* Overlay grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          </motion.div>
          
          <div className="relative z-10 text-sm md:text-base leading-loose drop-shadow-[0_0_5px_rgba(0,255,0,1)]">
            <motion.div variants={terminalVariants} initial="hidden" animate={textStage >= 1 ? "visible" : "hidden"}>
              <span className="text-white/50">[OK]</span> Mounting 3D visualization engine...
            </motion.div>
            <motion.div variants={terminalVariants} initial="hidden" animate={textStage >= 2 ? "visible" : "hidden"}>
              <span className="text-white/50">[OK]</span> Calibrating precise fit system...
            </motion.div>
            <motion.div variants={terminalVariants} initial="hidden" animate={textStage >= 3 ? "visible" : "hidden"}>
              <span className="text-brand-red font-bold">[WARN]</span> Standard sizing is obsolete.
            </motion.div>
            <motion.div variants={terminalVariants} initial="hidden" animate={textStage >= 4 ? "visible" : "hidden"} className="mt-4">
              <span className="text-white">SYS_PROMPT: </span> 
              Find the shoe that fits <span className="text-brand-red underline">your</span> foot.
              <span className="animate-pulse inline-block w-2 bg-[#0f0] ml-1">_</span>
            </motion.div>
          </div>
        </div>

        {/* Data readout section instead of "cards" */}
        <div className="flex flex-col gap-8 mb-16">
          <div className="border border-[#0f0]/30 p-6 bg-[#0f0]/[0.02]">
            <h2 className="text-xl border-b border-[#0f0]/30 pb-2 mb-6">/usr/bin/services</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => router.push(isAuthenticated ? "/dashboard" : "/auth/signup")}>
                <span className="text-white group-hover:text-brand-red transition-colors">./foot_lab.exe</span>
                <span className="text-white/40text-[10px] uppercase">Analyze morphology. Know your shape.</span>
                <span className="text-brand-red opacity-0 group-hover:opacity-100">&lt;EXECUTE&gt;</span>
              </div>
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => router.push("/findmyshoe")}>
                <span className="text-white group-hover:text-brand-red transition-colors">./smart_match.sh</span>
                <span className="text-white/40 text-[10px] uppercase">Data-driven recommendations.</span>
                <span className="text-brand-red opacity-0 group-hover:opacity-100">&lt;EXECUTE&gt;</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-[#0f0]/30 p-6">
              <h2 className="text-lg border-b border-[#0f0]/30 pb-2 mb-4">SYSTEM_STATUS</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-white/50">Active Users</td>
                    <td className="py-2 text-right">{memberCount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white/50">Data Ownership</td>
                    <td className="py-2 text-right text-brand-red">Verified</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-white/50">Community Power</td>
                    <td className="py-2 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-[#0f0]/30 p-6 relative overflow-hidden">
              <h2 className="text-lg border-b border-[#0f0]/30 pb-2 mb-4">LIVE_FEED.log</h2>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-10 w-full h-full p-6 pb-0"></div>
              <motion.div
                {...(!isReducedEffects ? { animate: { y: ["0%", "-50%"] } } : {})}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="space-y-2 text-xs"
              >
                {[...ACTIVITY_FEED, ...ACTIVITY_FEED, ...ACTIVITY_FEED].map((log, i) => (
                  <div key={i} className="flex gap-4 opacity-70">
                    <span className="text-white/30">[{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]</span>
                    <span className="text-white">{log.user}</span>
                    <span className="text-brand-red">{log.action}</span>
                    <span>{log.shoe}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-white/30 border-t border-[#0f0]/30 pt-8 pb-12">
          End of transmission block. Awaiting input.
        </div>

      </div>
    </main>
  );
}
