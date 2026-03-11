"use client";

import React from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  ArrowDownRight,
  Footprints,
  Zap,
  Target,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

const MarqueeText = ({
  children,
  reverse = false,
  isReducedEffects = false,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  isReducedEffects?: boolean;
}) => (
  <motion.div
    animate={isReducedEffects ? undefined : { x: reverse ? [0, 1000] : [0, -1000] }}
    transition={
      isReducedEffects ? undefined : { duration: 20, repeat: Infinity, ease: "linear" }
    }
    className="flex gap-8 whitespace-nowrap"
  >
    {Array(10)
      .fill(null)
      .map((_, i) => (
        <span key={i} className="font-tanker text-2xl">
          {children}
        </span>
      ))}
  </motion.div>
);

export default function HomeCombined() {
  const { data: session } = useSession();
  const router = useRouter();
  const isReducedEffects = useReducedEffects();

  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name?.toUpperCase() || "CLIMBER";

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section - Preserved */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Scene />
        </div>

        <motion.div
          className="absolute bottom-8 left-8"
          animate={isReducedEffects ? undefined : { y: [0, 5, 0] }}
          transition={isReducedEffects ? undefined : { duration: 1.5, repeat: Infinity }}
        >
          <ArrowDownRight className="w-8 h-8 text-orange-500" />
        </motion.div>
      </section>

      {/* First Marquee */}
      <section className="py-4 bg-orange-500 overflow-hidden">
        <MarqueeText isReducedEffects={isReducedEffects}>
          <span className="text-black">FIND YOUR GRIP</span>
          <span className="text-black/40 mx-4">•</span>
          <span className="text-black">COMMUNITY BUILT</span>
          <span className="text-black/40 mx-4">•</span>
          <span className="text-black">COMMUNITY DRIVEN</span>
          <span className="text-black/40 mx-4">•</span>
        </MarqueeText>
      </section>

      {/* Main Content - Brutalist + Bento Hybrid */}
      <section className="min-h-screen bg-neutral-950 relative">
        {/* Large Typography Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <motion.div
            className="font-tanker text-[25vw] leading-none text-white/[0.02] absolute -top-[5vw] -left-[5vw]"
            animate={undefined}
            transition={undefined}
          >
            GRIP
          </motion.div>
          <motion.div
            className="font-tanker text-[25vw] leading-none text-white/[0.02] absolute bottom-[5vw] -right-[10vw]"
            animate={undefined}
            transition={undefined}
          >
            KICKS
          </motion.div>
        </div>

        <div className="relative z-10 p-6 md:p-12 lg:p-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-between items-start mb-12 border-b border-neutral-800 pb-8"
          >
            <div>
              {isAuthenticated && (
                <motion.p
                  className="font-mono text-xs text-orange-500 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  [LOGGED_IN: {userName}]
                </motion.p>
              )}
              <h2 className="font-tanker text-5xl md:text-7xl lg:text-8xl leading-[0.9]">
                {isAuthenticated ? (
                  <>
                    <span className="text-white">WELCOME</span>
                    <br />
                    <motion.span
                      className="text-orange-500"
                      animate={isReducedEffects ? undefined : { opacity: [1, 0.7, 1] }}
                      transition={isReducedEffects ? undefined : { duration: 2, repeat: Infinity }}
                    >
                      BACK
                    </motion.span>
                  </>
                ) : (
                  <>
                    <span className="text-white">YOUR PERFECT</span>
                    <br />
                    <motion.span
                      className="text-orange-500"
                      animate={isReducedEffects ? undefined : { opacity: [1, 0.7, 1] }}
                      transition={isReducedEffects ? undefined : { duration: 2, repeat: Infinity }}
                    >
                      FIT AWAITS
                    </motion.span>
                  </>
                )}
              </h2>
            </div>
            <div className="text-right hidden md:block">
              <p className="font-mono text-[10px] text-neutral-600">
                [EST. 2024]
              </p>
              <p className="font-mono text-[10px] text-neutral-600 mt-1">
                [COMMUNITY_BUILT]
              </p>
              <motion.div
                className="w-2 h-2 bg-orange-500 rounded-full mt-4 ml-auto"
                animate={undefined}
                transition={undefined}
              />
            </div>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-3 md:gap-4 auto-rows-[120px] md:auto-rows-[140px]">
            {/* Large CTA Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/auth/signup")
              }
              className="col-span-12 md:col-span-8 row-span-2 bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-6 md:p-8 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 10px, black 10px, black 20px)",
                }}
                animate={undefined}
                transition={undefined}
              />

              <div className="relative flex justify-between items-start">
                <div>
                  <p className="font-mono text-[10px] text-black/60 mb-2">
                    [01]
                  </p>
                  <h3 className="font-tanker text-4xl md:text-5xl lg:text-6xl text-black">
                    {isAuthenticated ? "DASHBOARD" : "GET STARTED"}
                  </h3>
                </div>
                <motion.div
                  className="w-12 h-12 md:w-16 md:h-16 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors"
                  whileHover={{ rotate: 45 }}
                >
                  <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-black" />
                </motion.div>
              </div>
              <p className="relative font-sora text-black/70 max-w-md text-sm md:text-base">
                {isAuthenticated
                  ? "Check your stash, see how your shoes stack up, and find what fits next."
                  : "Tell us about your feet, add your shoes, and we'll help you find the right pair."}
              </p>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-orange-500/30 transition-colors"
            >
              <motion.div
                animate={undefined}
                transition={undefined}
              >
                <Zap className="w-8 h-8 text-orange-500" />
              </motion.div>
              <div>
                <motion.div
                  className="font-tanker text-5xl md:text-6xl text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  viewport={{ once: true }}
                >
                  100%
                </motion.div>
                <p className="font-mono text-[10px] text-neutral-500 mt-1">
                  COMMUNITY_POWERED
                </p>
              </div>
            </motion.div>

            {/* Feature Card 1 - Foot Lab */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ x: 5, borderColor: "rgba(249, 115, 22, 0.5)" }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between cursor-default transition-all"
            >
              <div className="flex justify-between items-start">
                <motion.div
                  className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                >
                  <Footprints className="w-6 h-6 text-orange-500" />
                </motion.div>
                <span className="font-mono text-[10px] text-neutral-600">
                  [A1]
                </span>
              </div>
              <div>
                <h4 className="font-tanker text-xl md:text-2xl text-white mb-1">
                  FOOT LAB
                </h4>
                <p className="font-mono text-[10px] text-neutral-500">
                  KNOW_YOUR_FEET
                </p>
              </div>
            </motion.div>

            {/* Feature Card 2 - Smart Match */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, borderColor: "rgba(249, 115, 22, 0.5)" }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between cursor-default transition-all"
            >
              <div className="flex justify-between items-start">
                <motion.div
                  className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: -12, scale: 1.1 }}
                >
                  <Target className="w-6 h-6 text-orange-500" />
                </motion.div>
                <span className="font-mono text-[10px] text-neutral-600">
                  [A2]
                </span>
              </div>
              <div>
                <h4 className="font-tanker text-xl md:text-2xl text-white mb-1">
                  SMART MATCH
                </h4>
                <p className="font-mono text-[10px] text-neutral-500">
                  FIND_YOUR_FIT
                </p>
              </div>
            </motion.div>

            {/* Rating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between group hover:border-orange-500/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <motion.div
                  className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center"
                  animate={undefined}
                  transition={undefined}
                >
                  <Star className="w-6 h-6 text-orange-500" />
                </motion.div>
                <span className="font-mono text-[10px] text-neutral-600">
                  [A3]
                </span>
              </div>
              <div>
                <h4 className="font-tanker text-xl md:text-2xl text-white mb-1">
                  RATE & TRACK
                </h4>
                <p className="font-mono text-[10px] text-neutral-500">
                  PERFORMANCE_DATA
                </p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-neutral-800 flex flex-wrap justify-between items-end gap-8"
          >
            <div className="flex gap-8 md:gap-16">
              {[
                { value: "100%", label: "YOUR_DATA" },
                { value: "0%", label: "DATA_SOLD" },
                { value: "24/7", label: "OPEN_SOURCE" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="font-tanker text-3xl md:text-4xl text-orange-500">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-600">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-neutral-600 text-right">
              <p>GRIP_KICKS™</p>
              <p>V.2024.1</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Second Marquee - Reverse */}
      <section className="py-4 bg-white overflow-hidden">
        <MarqueeText reverse isReducedEffects={isReducedEffects}>
          <span className="text-black">BUILT BY CLIMBERS</span>
          <span className="text-orange-500 mx-4">★</span>
          <span className="text-black">FOR CLIMBERS</span>
          <span className="text-orange-500 mx-4">★</span>
          <span className="text-black">YOUR DATA STAYS YOURS</span>
          <span className="text-orange-500 mx-4">★</span>
        </MarqueeText>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-orange-500 relative overflow-hidden">
        {/* Animated diagonal lines */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 20px, black 20px, black 40px)",
          }}
          animate={undefined}
          transition={undefined}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-xs text-black/60 mb-4">[FINAL_CTA]</p>
            <h2 className="font-tanker text-6xl md:text-8xl lg:text-9xl text-black mb-8 leading-[0.85]">
              READY TO
              <br />
              <motion.span
                animate={isReducedEffects ? undefined : { opacity: [1, 0.5, 1] }}
                transition={isReducedEffects ? undefined : { duration: 1.5, repeat: Infinity }}
              >
                CLIMB?
              </motion.span>
            </h2>

            <motion.button
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/auth/signup")
              }
              className="bg-black text-orange-500 font-tanker text-xl md:text-2xl px-12 py-6 hover:bg-neutral-900 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAuthenticated ? "GO TO DASHBOARD" : "START NOW"}
              <ArrowUpRight className="inline-block ml-3 w-6 h-6 group-hover:rotate-45 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer Strip */}
      <section className="bg-black py-4 px-6 md:px-12">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-neutral-600">
            © 2024 GRIP KICKS
          </span>
          <motion.span
            className="font-mono text-[10px] text-orange-500"
            animate={undefined}
            transition={undefined}
          >
            BUILT_FOR_CLIMBERS
          </motion.span>
        </div>
      </section>
    </main>
  );
}
