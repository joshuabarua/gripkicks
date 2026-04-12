"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowUpRight, Footprints, Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fetchApi } from "@/lib/api-client";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import Link from "next/link";

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

const SOCIAL_STATS = [
  { label: "Community Powered", value: "100%" },
  { label: "Data Ownership", value: "Verified" },
];

export default function AnalogHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const isReducedEffects = useReducedEffects();
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 400], [0.8, 0.2]);

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
    return () => {
      mounted = false;
    };
  }, []);

  const isAuthenticated = !!session?.user;
  const memberCount = totalUsers ?? 0;

  const stats = useMemo(() => [
    ...SOCIAL_STATS,
    { label: "Active Climbers", value: memberCount.toLocaleString() }
  ], [memberCount]);

  const activityLoop = useMemo(() => [...ACTIVITY_FEED, ...ACTIVITY_FEED, ...ACTIVITY_FEED], []);

  return (
    <main className="min-h-screen bg-black text-brand-chalk selection:bg-brand-red selection:text-black antialiased relative overflow-x-hidden">
      {/* Heavy CRT effects */}
      <div className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"></div>
      <div className="crt-vignette" />
      <div className="grain-overlay-animated opacity-70" />

      {/* Back to variations button */}
      <div className="fixed top-24 left-6 z-50 mix-blend-difference">
        <Link href="/test" className="text-[10px] uppercase tracking-widest font-sora text-white flex items-center gap-2 hover:text-brand-red transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>
      </div>

      <section className="relative flex flex-col justify-center h-svh overflow-hidden border-b-[8px] border-black pb-12">
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 z-0 will-change-transform mix-blend-screen filter contrast-125 saturate-50"
        >
          <Scene />
        </motion.div>

        {/* Glitchy transmission overlay */}
        <div className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-brand-red/10 to-transparent top-0 opacity-40 pointer-events-none animate-pulse"></div>
        <div className="absolute inset-x-0 h-1/4 bg-gradient-to-t from-black to-transparent bottom-0 pointer-events-none z-10"></div>

        <div className="absolute inset-0 z-10 flex items-center pointer-events-none px-6 md:px-12 lg:px-16 mix-blend-difference">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pointer-events-auto w-full"
          >
            <div className="flex gap-4 items-start mb-6">
              <div className="w-6 h-1 bg-brand-red animate-hal-pulse mt-1" />
              <p className="font-sora text-[10px] uppercase tracking-[0.4em] text-brand-red font-bold">REC_ <span className="animate-pulse">●</span></p>
            </div>
            
            <h1 className="font-tanker text-5xl md:text-7xl lg:text-8xl leading-[0.8] tracking-tighter mb-6 uppercase text-white" style={{ textShadow: "2px 0 0 rgba(255,0,0,0.5), -2px 0 0 rgba(0,255,255,0.5)"}}>
              Transmission <br />
              <span className="text-brand-red" style={{ textShadow: "0 0 10px rgba(244,91,91,0.8)"}}>Intercepted.</span>
            </h1>
            <p className="font-sora text-white/70 text-lg md:text-xl max-w-lg leading-snug tracking-tighter border-l-2 border-brand-red pl-4">
              A precise fit system hidden in the noise. Analog data for climbers who care about the details.
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator - noisy line */}
        <motion.div
          className="absolute bottom-0 right-16 z-20 flex flex-col items-center gap-2 opacity-50"
          {...(!isReducedEffects
            ? {
                animate: { opacity: [0.2, 0.8, 0.2] },
                transition: { duration: 0.1, repeat: Infinity, repeatType: "mirror" },
              }
            : {})}
        >
          <span className="text-[9px] font-sora tracking-widest text-[#0f0]">DATA_STREAM</span>
          <div className="w-px h-32 bg-gradient-to-b from-[#0f0] to-transparent" />
        </motion.div>
      </section>

      {/* Content Flow - Asymmetric & Broken */}
      <section className="bg-black py-24 relative p-6 md:p-12 lg:p-24 overflow-hidden">
        
        {/* Decorative noise lines */}
        <div className="absolute top-10 left-0 w-full h-[1px] bg-white/20"></div>
        <div className="absolute top-[42px] left-0 w-3/4 h-[2px] bg-brand-red/40"></div>
        <div className="absolute top-[46px] right-10 w-1/4 h-[1px] bg-white/30"></div>

        <div className="max-w-6xl mx-auto space-y-32 relative z-10 pt-16">
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="border-l-4 border-brand-red pl-8 md:pl-16 relative"
          >
            <div className="absolute -left-[2px] top-0 w-[4px] h-12 bg-white animate-pulse" />
            <h2 className="font-tanker text-4xl md:text-6xl uppercase tracking-tighter text-white mb-8" style={{ textShadow: "0 0 5px rgba(255,255,255,0.3)"}}>
              Initialize <span className="text-brand-red">Foot_Lab</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="flex-1 bg-[#111] border border-[#333] p-8 relative overflow-hidden group">
                <Footprints className="text-brand-red mb-6 w-12 h-12 opacity-80 mix-blend-screen" />
                <p className="font-sora text-lg text-white/70 mb-8 leading-relaxed font-bold tracking-tight">
                  <span className="text-brand-red">&gt;</span> Analyzing morphology...<br/>
                  <span className="text-brand-red">&gt;</span> Egyptian, Roman, Greek shapes detected.<br/>
                  <span className="text-brand-red">&gt;</span> Match sequence ready.
                </p>
                <div className="w-full h-1 bg-gradient-to-r from-brand-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="flex-1 flex flex-col justify-end h-full mt-auto">
                <button 
                  onClick={() => router.push(isAuthenticated ? "/dashboard" : "/auth/signup")}
                  className="group flex items-center justify-between w-full border-2 border-brand-red bg-brand-red/10 p-6 hover:bg-brand-red transition-all duration-300"
                >
                  <span className="font-tanker text-3xl text-brand-red group-hover:text-black uppercase">Run Sequence</span>
                  <ArrowUpRight className="text-brand-red group-hover:text-black w-8 h-8 group-hover:rotate-45 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row-reverse gap-12 items-center"
          >
            <div className="flex-1 w-full border-r-4 border-brand-red pr-8 md:pr-16 text-right">
              <h2 className="font-tanker text-4xl md:text-6xl uppercase tracking-tighter text-white mb-6" style={{ textShadow: "0 0 5px rgba(255,255,255,0.3)"}}>
                Target <span className="text-[#0f0]">Acquired</span>
              </h2>
              <p className="font-sora text-sm md:text-base text-white/50 tracking-widest uppercase mb-12">
                &lt;&lt; Data-driven recommendations. Mapping volume to rubber.
              </p>
              
              {/* Noisy stats block */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-[#111] p-6 border border-[#222]">
                    <span className="font-tanker text-4xl text-white block mb-2">{stat.value}</span>
                    <span className="font-sora text-[10px] uppercase text-[#0f0] tracking-widest">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 border border-brand-red/20 rotate-1"></div>
              <div className="absolute inset-0 border border-[#0f0]/20 -rotate-1"></div>
              <div className="bg-[#111] border border-white/10 p-8 relative z-10 m-2">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                  <Activity className="text-white w-6 h-6" />
                  <span className="font-sora tracking-widest uppercase text-xs text-white">Live_Sync</span>
                </div>
                
                <div className="space-y-4 overflow-hidden h-40 relative">
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#111] to-transparent z-10"></div>
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#111] to-transparent z-10"></div>
                  
                  <motion.div
                    {...(!isReducedEffects ? { animate: { y: ["0%", "-33.33%"] } } : {})}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="space-y-4 pt-4 will-change-transform"
                  >
                    {activityLoop.map((activity, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#222] p-3 text-xs font-sora opacity-70 hover:opacity-100 uppercase tracking-widest border-l-2 border-[#0f0]">
                        <span className="text-white font-bold">{activity.user}</span>
                        <span className="text-white/40">{activity.action}</span>
                        <span className="text-[#0f0] truncate max-w-[100px]">{activity.shoe}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Footer analog ticker */}
      <div className="border-y-[4px] border-[#333] bg-[#111] py-4 overflow-hidden relative z-10">
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10"></div>
        <motion.div
          {...(!isReducedEffects
            ? {
                animate: { x: [0, -1000] },
                transition: { duration: 30, repeat: Infinity, ease: "linear" },
              }
            : {})}
          className="flex gap-16 whitespace-nowrap items-center will-change-transform"
        >
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-sora text-sm font-bold uppercase tracking-[0.5em] text-[#0f0] drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]">
              &gt; SYNC &lt; ANALYZE &lt; MATCH &lt;
            </span>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
