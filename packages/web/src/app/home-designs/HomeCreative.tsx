"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowUpRight, Footprints, Target, Activity } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fetchApi } from "@/lib/api-client";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

function HeroSection({
  isReducedEffects,
}: {
  isReducedEffects: boolean;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(true);
  const { scrollY } = useScroll({ layoutEffect: false });
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  useEffect(() => {
    const target = heroRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? true),
      { rootMargin: "100px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex items-center justify-center h-svh overflow-hidden"
    >
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <Scene active={isInView} />
      </motion.div>

      <div className="absolute inset-0 z-10 flex items-end pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="px-6 md:px-12 lg:px-16 pb-28 md:pb-20 max-w-3xl pointer-events-auto"
        >
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">
            Precision fit system
          </p>
          <h1 className="font-tanker text-4xl md:text-6xl lg:text-7xl leading-[0.85] tracking-tight mb-4">
            Find the shoe that fits{" "}
            <span className="text-brand-red italic">your</span> foot.
          </h1>
          <p className="font-sora text-brand-putty text-base md:text-lg max-w-md leading-snug tracking-tight">
            A precise fit system for climbers who care about detail. Free for
            everyone.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-12 right-8 md:right-16 z-10 flex flex-col items-center gap-4 opacity-30"
        {...(!isReducedEffects
          ? {
            animate: { y: [0, 10, 0] },
            transition: {
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }
          : {})}
      >
        <span className="text-[9px] font-sora tracking-[0.5em] uppercase">
          Explore
        </span>
        <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
}

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

  useEffect(() => {
    let mounted = true;
    async function loadUserCount() {
      try {
        const response = await fetchApi<{ count: number }>(
          "/api/v1/users/count",
        );
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
  const memberCount = totalUsers ?? 0;

  // Memoize arrays to prevent recreation on every scroll tick/render
  const stats = useMemo(
    () => [
      ...SOCIAL_STATS,
      { label: "Active Climbers", value: memberCount.toLocaleString() },
    ],
    [memberCount],
  );

  const activityLoop = useMemo(
    () => [...ACTIVITY_FEED, ...ACTIVITY_FEED, ...ACTIVITY_FEED],
    [],
  );
  const marqueeItems = useMemo(() => Array(5).fill(null), []);

  return (
    <main className="min-h-screen bg-black text-brand-chalk selection:bg-brand-red selection:text-black antialiased relative">
      <div className="scanline-overlay" />

      {/* Hero: Immersive 3D Hook — PRESERVED */}
      <HeroSection isReducedEffects={isReducedEffects} />

      {/* Journey — Monolithic layout */}
      <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content">
        <div className="max-w-fluid-xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-fluid-lg pb-fluid-xl"
          >
            <div>
              {isAuthenticated && (
                <p className="text-brand-red font-sora text-fluid-base mb-fluid-sm tracking-tight">
                  Welcome back, {userName}
                </p>
              )}
              <h2 className="font-tanker text-title-lg leading-[0.85] max-w-3xl tracking-tight text-brand-chalk">
                Find your <span className="text-brand-red italic">Sole</span>{" "}
                mate
              </h2>
            </div>

            <button
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/auth/signup")
              }
              className="group flex items-center gap-fluid-sm font-tanker text-fluid-3xl text-brand-red hover:text-white transition-colors duration-500"
            >
              {isAuthenticated ? "Go to Dashboard" : "Join the Labs"}
              <div className="w-fluid-xl h-fluid-xl rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-red transition-colors duration-500">
                <ArrowUpRight className="group-hover:rotate-45 transition-transform duration-700" />
              </div>
            </button>
          </motion.div>

          <div className="w-full h-px bg-white/[0.06] mb-fluid-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/[0.06]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-black p-fluid-2xl group cursor-default"
            >
              <div className="flex items-center gap-3 mb-fluid-lg">
                <div className="w-2 h-2 rounded-full bg-brand-red animate-hal-pulse" />
                <span className="font-sora text-[9px] uppercase tracking-[0.35em] text-brand-putty/50">
                  01
                </span>
              </div>
              <Footprints
                className="text-brand-red mb-fluid-md"
                size={28}
                strokeWidth={1.5}
              />
              <h3 className="font-tanker text-fluid-4xl leading-none text-brand-chalk mb-fluid-sm">
                Foot Lab
              </h3>
              <p className="font-sora text-fluid-base text-brand-putty/60 leading-relaxed tracking-tight">
                Precise morphology analysis. Egyptian, Roman, Greek—know your
                shape, find your shoe.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="bg-black p-fluid-2xl group cursor-default"
            >
              <div className="flex items-center gap-3 mb-fluid-lg">
                <div className="w-2 h-2 rounded-full bg-brand-red animate-hal-pulse" />
                <span className="font-sora text-[9px] uppercase tracking-[0.35em] text-brand-putty/50">
                  02
                </span>
              </div>
              <Target
                className="text-brand-red mb-fluid-md"
                size={28}
                strokeWidth={1.5}
              />
              <h3 className="font-tanker text-fluid-4xl leading-none text-brand-chalk mb-fluid-sm">
                Smart Match
              </h3>
              <p className="font-sora text-fluid-base text-brand-putty/60 leading-relaxed tracking-tight">
                Data-driven recommendations. We map your volume to the
                world&apos;s best rubber.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-black p-fluid-2xl group cursor-default"
            >
              <div className="flex items-center gap-3 mb-fluid-lg">
                <div className="w-2 h-2 rounded-full bg-brand-red animate-hal-pulse" />
                <span className="font-sora text-[9px] uppercase tracking-[0.35em] text-brand-putty/50">
                  03
                </span>
              </div>
              <Activity
                className="text-brand-red mb-fluid-md"
                size={28}
                strokeWidth={1.5}
              />
              <h3 className="font-tanker text-fluid-4xl leading-none text-brand-chalk mb-fluid-sm">
                Live Sync
              </h3>
              <div className="space-y-fluid-sm overflow-hidden h-24 mask-fade-vertical">
                <motion.div
                  {...(!isReducedEffects
                    ? { animate: { y: ["0%", "-33.33%"] } }
                    : {})}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="space-y-fluid-sm"
                >
                  {activityLoop.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-fluid-sm text-fluid-sm font-sora opacity-40 hover:opacity-100 transition-opacity duration-500"
                    >
                      <span className="text-brand-red font-medium">
                        {activity.user}
                      </span>
                      <span className="text-brand-putty/40">
                        {activity.action}
                      </span>
                      <span className="text-brand-chalk/70">
                        {activity.shoe}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="w-full h-px bg-white/[0.06] mt-fluid-3xl mb-fluid-2xl" />

          <div className="flex flex-wrap gap-x-fluid-3xl gap-y-fluid-xl justify-center md:justify-start">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2">
                <span className="font-tanker text-fluid-3xl text-brand-chalk leading-none">
                  {stat.value}
                </span>
                <span className="font-sora text-[9px] uppercase tracking-[0.3em] text-brand-putty/40">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission — Democratizing climbing data */}
      <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content">
        <div className="max-w-fluid-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row gap-fluid-2xl items-start"
          >
            <div className="flex-1">
              <span className="font-sora text-[9px] uppercase tracking-[0.35em] text-brand-red/50 mb-fluid-sm block">
                Our Mission
              </span>
              <h2 className="font-tanker text-fluid-3xl leading-[0.85] tracking-tight text-brand-chalk mb-fluid-md">
                Better data.{" "}
                <span className="text-brand-red italic">Better</span> climbing.
              </h2>
              <p className="font-sora text-brand-putty/60 leading-relaxed max-w-lg">
                Every climber deserves access to the data that makes shoe
                decisions easier. GripKicks exists to democratize climbing fit
                data — keeping every feature free, every stash accessible, every
                match open. No paywalls. No locked data. Just the community
                powering better decisions together.
              </p>
            </div>
            <div className="flex-1 bg-white/[0.03] p-fluid-xl">
              <div className="grid grid-cols-2 gap-fluid-lg">
                <div className="space-y-1">
                  <span className="font-tanker text-fluid-xl text-brand-red">
                    100%
                  </span>
                  <span className="font-sora text-[9px] uppercase tracking-[0.25em] text-brand-putty/40 block">
                    Free forever
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-tanker text-fluid-xl text-brand-red">
                    Open
                  </span>
                  <span className="font-sora text-[9px] uppercase tracking-[0.25em] text-brand-putty/40 block">
                    Data access
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-tanker text-fluid-xl text-brand-red">
                    Community
                  </span>
                  <span className="font-sora text-[9px] uppercase tracking-[0.25em] text-brand-putty/40 block">
                    Owned
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-tanker text-fluid-xl text-brand-red">
                    0
                  </span>
                  <span className="font-sora text-[9px] uppercase tracking-[0.25em] text-brand-putty/40 block">
                    Paywalls
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community — Monolith CTA */}
      <section className="bg-black py-fluid-3xl px-fluid-md relative overflow-hidden contain-content">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-red/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-fluid-lg mx-auto text-center space-y-fluid-xl relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center gap-fluid-xl"
          >
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-brand-red/30 to-transparent" />

            <span className="font-sora text-[9px] uppercase tracking-[0.5em] text-brand-red/60">
              Community Powered
            </span>

            <h2 className="font-tanker text-title-md leading-[0.85] tracking-tight text-brand-chalk">
              Real climbers. <span className="text-brand-red italic">Real</span>{" "}
              fit data.
            </h2>
            <p className="font-sora text-fluid-lg text-brand-putty/50 max-w-xl mx-auto leading-relaxed tracking-tight">
              Every stash, rating, and foot profile makes GripKicks smarter.
              Every feature is free — forever.
            </p>

            <button
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/auth/signup")
              }
              className="group relative inline-flex items-center gap-fluid-md border border-white/10 text-brand-chalk font-tanker text-fluid-2xl px-fluid-3xl py-fluid-md hover:border-brand-red hover:text-brand-red transition-all duration-700"
            >
              <span className="relative z-10 flex items-center gap-fluid-md">
                {isAuthenticated ? "Go to dashboard" : "Join the crew"}
                <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-700" />
              </span>
            </button>

            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Ticker — Thin red line */}
      <div className="py-fluid-sm border-y border-white/[0.06] overflow-hidden select-none relative z-10">
        <motion.div
          {...(!isReducedEffects
            ? {
              animate: { x: [0, -1000] },
              transition: { duration: 50, repeat: Infinity, ease: "linear" },
            }
            : {})}
          className="flex gap-fluid-3xl whitespace-nowrap items-center"
        >
          {marqueeItems.map((_, i) => (
            <span
              key={i}
              className="font-sora text-[10px] uppercase tracking-[0.4em] text-brand-putty/20 leading-none py-2"
            >
              GRIPKICKS &mdash; COMMUNITY POWERED &mdash; PRECISION FIT &mdash;
              BETTER RUBBER &mdash; BETTER CLIMBING &mdash;
            </span>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
