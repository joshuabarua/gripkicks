"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Activity, ArrowLeft, Target, Crosshair } from "lucide-react";
import { motion } from "framer-motion";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

const ACTIVITY_FEED = [
  { user: "Mika", action: "fit note", shoe: "Solutions" },
  { user: "Sage", action: "matched", shoe: "Sole Mate" },
  { user: "Rhea", action: "shared", shoe: "Foot Lab" },
  { user: "Noor", action: "saved", shoe: "Mastia" },
];

export default function HudHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const isReducedEffects = useReducedEffects();

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

  const isAuthenticated = !!session?.user;
  const memberCount = totalUsers ?? 0;


  return (
    <main className="h-screen w-screen overflow-hidden bg-black text-[#5df] selection:bg-[#5df] selection:text-black antialiased relative">
      <div className="scanline-overlay opacity-50" />
      <div className="crt-vignette opacity-80 pointer-events-none" />

      {/* Persistent Background 3D Scene */}
      <div className="absolute inset-0 z-0 pointer-events-none contrast-150 saturate-[0.1] filter" style={{ opacity: 0.8 }}>
        <Scene />
      </div>

      {/* Overlays to give it a targeting system look */}
      <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
        {/* Center reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#5df]/20 rounded-full flex items-center justify-center">
            <div className="w-[400px] h-px bg-gradient-to-r from-transparent via-[#5df]/30 to-transparent"></div>
            <div className="absolute h-[400px] w-px bg-gradient-to-b from-transparent via-[#5df]/30 to-transparent"></div>
            <div className="absolute w-[320px] h-[320px] border border-brand-red/20 border-dashed rounded-full animate-[spin_60s_linear_infinite]"></div>
        </div>
      </div>

      {/* Frame corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#5df]/40 m-6 pointer-events-none z-20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[#5df]/40 m-6 pointer-events-none z-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[#5df]/40 m-6 pointer-events-none z-20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#5df]/40 m-6 pointer-events-none z-20"></div>

      {/* HUD UI Layout */}
      <div className="relative z-30 h-full w-full p-6 md:p-12 flex flex-col justify-between pointer-events-none">
        
        {/* Top bar / Header area */}
        <div className="flex justify-between items-start pt-16">
          <div className="pointer-events-auto">
            <Link href="/test" className="text-[10px] uppercase font-sora tracking-[0.3em] text-[#5df] hover:text-white transition-colors flex items-center gap-2 mb-4 bg-black/40 px-2 py-1 border border-[#5df]/30 w-fit">
              <ArrowLeft className="w-3 h-3" /> ABORT
            </Link>
          </div>
          
          <div className="text-right border border-[#5df]/30 bg-black/40 p-3 w-64 backdrop-blur-sm pointer-events-auto">
            <div className="text-[9px] uppercase tracking-widest text-[#5df]/60 mb-2">System Status</div>
            <div className="flex justify-between text-xs font-sora">
              <span className="text-white">CLIMBERS</span>
              <span className="text-brand-red">{memberCount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-[#5df]/20 h-1 mt-2">
              <div className="w-full bg-[#5df] h-full shadow-[0_0_5px_#5df]"></div>
            </div>
          </div>
        </div>

        {/* Center / Hero Title (Offset left) */}
        <div className="flex justify-between items-center w-full">
            <div className="max-w-xl pointer-events-auto border-l-4 border-brand-red pl-6 py-2 bg-gradient-to-r from-black/80 to-transparent backdrop-blur-sm shadow-[-10px_0_20px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-brand-red animate-hal-pulse" />
                  <span className="font-sora text-[10px] uppercase tracking-widest text-brand-red">Target Lock Established</span>
                </div>
                <h1 className="font-tanker text-6xl md:text-8xl leading-none tracking-tight text-white uppercase mb-4" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)"}}>
                    Precision<br />
                    <span className="text-brand-red">Fit.</span>
                </h1>
                <p className="font-sora text-sm md:text-base text-[#5df] uppercase tracking-widest leading-relaxed">
                    [ Find the shoe that fits your foot. ]<br />
                    [ Free for everyone. ]
                </p>
                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => router.push(isAuthenticated ? "/dashboard" : "/auth/signup")}
                    className="flex justify-center items-center font-sora text-xs uppercase tracking-widest font-bold bg-[#5df]/10 border border-[#5df] text-[#5df] py-3 px-6 hover:bg-[#5df] hover:text-black shadow-[0_0_10px_rgba(85,221,255,0.2)] transition-all"
                  >
                    Engage Scan
                  </button>
                  <button 
                    onClick={() => router.push("/findmyshoe")}
                    className="flex justify-center items-center font-sora text-xs uppercase tracking-widest font-bold border border-brand-red text-brand-red py-3 px-6 hover:bg-brand-red hover:text-black transition-all"
                  >
                    Match Database
                  </button>
                </div>
            </div>

            {/* Right pinned data panel */}
            <div className="hidden lg:flex flex-col gap-6 w-80 pointer-events-auto">
              <div className="border border-[#5df]/30 bg-black/60 p-4 relative backdrop-blur-md">
                <div className="absolute -left-1.5 top-2 w-3 h-3 border border-[#5df] bg-black rotate-45"></div>
                <div className="flex items-center gap-2 mb-4 border-b border-[#5df]/30 pb-2">
                  <Crosshair className="text-[#5df] w-4 h-4" />
                  <span className="font-sora text-[10px] uppercase tracking-widest text-[#5df]">Module [FOOT_LAB]</span>
                </div>
                <div className="font-sora text-xs text-white/70 space-y-2 uppercase leading-relaxed">
                   &gt; Morphology analysis running.<br />
                   &gt; Egyptian, Roman, Greek shapes supported.
                </div>
              </div>

              <div className="border border-[#5df]/30 bg-black/60 p-4 relative backdrop-blur-md">
                <div className="absolute -left-1.5 top-2 w-3 h-3 border border-[#5df] bg-black rotate-45"></div>
                <div className="flex items-center gap-2 mb-4 border-b border-[#5df]/30 pb-2">
                  <Activity className="text-brand-red w-4 h-4" />
                  <span className="font-sora text-[10px] uppercase tracking-widest text-brand-red">Live_Sync</span>
                </div>
                <div className="h-32 overflow-hidden relative">
                  <motion.div
                      {...(!isReducedEffects ? { animate: { y: ["0%", "-50%"] } } : {})}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="space-y-3"
                  >
                      {[...ACTIVITY_FEED, ...ACTIVITY_FEED, ...ACTIVITY_FEED].map((activity, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] font-sora uppercase tracking-widest">
                          <span className="text-white">{activity.user}</span>
                          <span className="text-[#5df]">{activity.action}</span>
                          <span className="text-brand-red">{activity.shoe}</span>
                        </div>
                      ))}
                  </motion.div>
                </div>
              </div>
            </div>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-between items-end pb-8 pointer-events-auto">
          <div className="font-mono text-xs text-[#5df]/50">
            LOC: 34.0522° N, 118.2437° W<br />
            SYS: ONLINE
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-8 w-2 ${i === 3 ? 'bg-brand-red animate-pulse' : 'bg-[#5df]/40'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
