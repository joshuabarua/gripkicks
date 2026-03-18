"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Footprints,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fetchApi } from "@/lib/api-client";
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

const SOCIAL_STATS = [
  { label: "Community Powered", value: "100%" },
  { label: "Data Ownership", value: "Verified" },
];

export default function HomeCreative() {
  const { data: session } = useSession();
  const router = useRouter();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const isReducedEffects = useReducedEffects();
  const { scrollY } = useScroll();

  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

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
  const userName = session?.user?.name || "Climber";
  const founderSpotsTotal = 1000;
  const claimedSlots = totalUsers ?? 0;
  const remainingSlots = Math.max(0, founderSpotsTotal - claimedSlots);
  const claimedPercent = Math.min(100, (claimedSlots / founderSpotsTotal) * 100);

  // Memoize arrays to prevent recreation on every scroll tick/render
  const stats = useMemo(() => [
    ...SOCIAL_STATS,
    { label: "Active Climbers", value: claimedSlots.toLocaleString() }
  ], [claimedSlots]);

  const activityLoop = useMemo(() => [...ACTIVITY_FEED, ...ACTIVITY_FEED, ...ACTIVITY_FEED], []);
  const marqueeItems = useMemo(() => Array(10).fill(null), []);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-orange-500 selection:text-black antialiased relative">
      {/* Noise Overlay - Use contain-strict to prevent layout thrashing */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url('/imgs/noise.png')] contain-strict" />

      {/* Hero: Immersive 3D Hook */}
      <section className="relative flex items-center justify-center h-svh overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0 will-change-transform"
        >
          <Scene />
        </motion.div>

        <div className="z-10 text-center pointer-events-none px-fluid-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-tanker text-title-xl leading-[0.85] tracking-tight">
              GRIP<span className="text-orange-500">KICKS</span>
            </h1>
            <p className="font-sora text-fluid-lg text-neutral-400 mt-fluid-md max-w-lg mx-auto leading-tight tracking-tight">
              The technical soul of your climbing gear.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-12 inset-x-0 mx-auto w-fit flex flex-col items-center gap-4 opacity-30 will-change-transform"
          animate={isReducedEffects ? undefined : { y: [0, 10, 0] }}
          transition={isReducedEffects ? undefined : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-[9px] font-sora tracking-[0.5em] uppercase">Explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </section>

      {/* Dynamic Journey */}
      <section className="bg-neutral-950 py-fluid-3xl px-fluid-md relative contain-content">
        <div className="max-w-fluid-xl mx-auto space-y-fluid-3xl">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-fluid-lg border-b border-white/5 pb-fluid-xl"
          >
            <div>
              {isAuthenticated && (
                <p className="text-orange-500 font-sora text-fluid-base mb-fluid-sm tracking-tight">
                  Welcome back, {userName}
                </p>
              )}
              <h2 className="font-tanker text-title-lg leading-[0.85] max-w-3xl tracking-tight">
                Find your <span className="text-orange-500 italic">Sole</span> mate
              </h2>
            </div>
            
            <button 
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/auth/signup")}
              className="group flex items-center gap-fluid-sm font-tanker text-fluid-3xl text-orange-500 hover:text-orange-400 transition-colors duration-300"
            >
              {isAuthenticated ? "Go to Dashboard" : "Join the Labs"}
              <div className="w-fluid-xl h-fluid-xl rounded-full border border-orange-500/30 flex items-center justify-center group-hover:border-orange-500 transition-colors">
                <ArrowUpRight className="group-hover:rotate-45 transition-transform duration-500 will-change-transform" />
              </div>
            </button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-fluid-2xl">
            
            <motion.div whileHover={{ y: -5 }} className="space-y-fluid-md group cursor-default will-change-transform">
              <div className="w-fluid-3xl h-fluid-3xl flex items-center justify-center bg-orange-500/5 rounded-2xl group-hover:bg-orange-500/10 transition-all duration-500">
                <Footprints className="text-orange-500" size={32} />
              </div>
              <h3 className="font-tanker text-fluid-4xl leading-none">Foot Lab</h3>
              <p className="font-sora text-fluid-base text-neutral-500 leading-snug tracking-tight">
                Precise morphology analysis. Egyptian, Roman, Greek—know your shape, find your shoe.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="space-y-fluid-md group cursor-default will-change-transform">
              <div className="w-fluid-3xl h-fluid-3xl flex items-center justify-center bg-orange-500/5 rounded-2xl group-hover:bg-orange-500/10 transition-all duration-500">
                <Target className="text-orange-500" size={32} />
              </div>
              <h3 className="font-tanker text-fluid-4xl leading-none">Smart Match</h3>
              <p className="font-sora text-fluid-base text-neutral-500 leading-snug tracking-tight">
                Data-driven recommendations. We map your volume to the world's best rubber.
              </p>
            </motion.div>

            <div className="space-y-fluid-md">
              <div className="w-fluid-3xl h-fluid-3xl flex items-center justify-center bg-orange-500/5 rounded-2xl">
                <Activity className="text-orange-500" size={32} />
              </div>
              <h3 className="font-tanker text-fluid-4xl leading-none">Live Sync</h3>
              <div className="space-y-fluid-sm overflow-hidden h-24 relative mask-fade-vertical">
                <motion.div
                  animate={isReducedEffects ? undefined : { y: [0, -120] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="space-y-fluid-sm will-change-transform"
                >
                  {activityLoop.map((activity, i) => (
                    <div key={i} className="flex items-center gap-fluid-sm text-fluid-sm font-sora opacity-50 hover:opacity-100 transition-opacity">
                      <span className="text-orange-500 font-medium">{activity.user}</span>
                      <span className="text-neutral-500">{activity.action}</span>
                      <span className="text-white/80">{activity.shoe}</span>
                    </div>
                  ))}
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-transparent to-neutral-950 pointer-events-none" />
              </div>
            </div>

          </div>

          <div className="pt-fluid-2xl flex flex-wrap gap-x-fluid-3xl gap-y-fluid-xl justify-center md:justify-start">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-tanker text-fluid-3xl text-orange-500 leading-none">{stat.value}</span>
                <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Access */}
      <section className="bg-black py-fluid-3xl px-fluid-md relative overflow-hidden contain-content">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-fluid-xl h-fluid-xl bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-fluid-lg mx-auto text-center space-y-fluid-xl relative z-10">
          <div className="inline-flex items-center gap-fluid-sm px-fluid-md py-fluid-xs bg-orange-500/10 rounded-full border border-orange-500/20 backdrop-blur-md">
            <Sparkles size={14} className="text-orange-500 animate-pulse" />
            <span className="font-sora text-[9px] font-bold uppercase tracking-[0.4em] text-orange-500">Founders Only</span>
          </div>
          
          <h2 className="font-tanker text-title-md leading-[0.85] tracking-tight">
            {remainingSlots} spots left for <span className="text-orange-500 italic">Life</span>
          </h2>
          
          <p className="font-sora text-fluid-lg text-neutral-400 max-w-xl mx-auto leading-tight tracking-tight">
            The first 1,000 climbers get lifetime premium. No subscriptions, just better climbing.
          </p>

          <div className="max-w-md mx-auto space-y-fluid-md">
            <div className="h-2 bg-neutral-900 rounded-full overflow-hidden p-[1px]">
              <motion.div 
                className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] will-change-[width]" 
                initial={{ width: 0 }}
                whileInView={{ width: `${claimedPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="flex justify-between font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
              <span>{claimedSlots} claimed</span>
              <span>{founderSpotsTotal} total</span>
            </div>
          </div>

          <div className="pt-fluid-lg">
            <button 
              onClick={() => router.push("/auth/signup")}
              className="group relative inline-flex items-center gap-fluid-md bg-white text-black font-tanker text-fluid-3xl px-fluid-3xl py-fluid-md rounded-full hover:bg-orange-500 hover:text-white transition-all duration-700 ease-[0.22, 1, 0.36, 1] overflow-hidden shadow-2xl will-change-transform"
            >
              <span className="relative z-10 flex items-center gap-fluid-md">
                Claim my spot
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500 will-change-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Ticker: Pure Motion */}
      <div className="py-fluid-md bg-orange-500 overflow-hidden select-none relative z-10 shadow-2xl contain-strict">
        <motion.div
          animate={isReducedEffects ? undefined : { x: [0, -1000] }}
          transition={isReducedEffects ? undefined : { duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-fluid-3xl whitespace-nowrap items-center will-change-transform"
        >
          {marqueeItems.map((_, i) => (
            <span key={i} className="font-tanker text-fluid-3xl text-black leading-none py-2">
              GRIPKICKS • COMMUNITY POWERED • PRECISION FIT • BETTER RUBBER • BETTER CLIMBING •
            </span>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
