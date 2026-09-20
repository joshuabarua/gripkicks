"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useReducedEffects } from "@/hooks/useReducedEffects";
import { CommunityMilestone } from "@/components/CommunityMilestone";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => null,
});

const EtherField = dynamic(() => import("@/components/3d/EtherField"), {
  ssr: false,
  loading: () => null,
});

function HeroSection({
  isReducedEffects,
  userCount,
}: {
  isReducedEffects: boolean;
  userCount: number;
}) {
  return (
    <section id="home-hero" className="relative flex items-center justify-center h-svh overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6 }}
        className="absolute inset-0 z-0"
      >
        <EtherField
          className="absolute inset-0 w-full h-full"
          paused={isReducedEffects}
          speed={isReducedEffects ? 0 : 0.7}
          ambientColor="#0a0d18"
          accentColor="#ff5a3d"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute left-0 right-0 top-[10px] bottom-0 z-[1] will-change-transform"
      >
        <Scene />
      </motion.div>

      <div className="absolute inset-0 z-10 flex items-end pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="px-6 md:px-12 lg:px-16 pb-28 md:pb-20 max-w-3xl pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red" />
            </span>
            <span className="font-sora text-xs text-neutral-400">
              {userCount} {userCount === 1 ? "climber" : "climbers"} building the database
            </span>
          </div>
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
        <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
}

export default function HomeCreative() {
  const { data: session } = useSession();
  const router = useRouter();
  const isReducedEffects = useReducedEffects();
  const isAuthenticated = !!session?.user;
  const countData = useQuery(api.users.getCount);
  const userCount = countData?.count ?? 0;

  return (
    <main className="min-h-screen bg-black text-brand-chalk selection:bg-brand-red selection:text-black antialiased relative">
      <HeroSection isReducedEffects={isReducedEffects} userCount={userCount} />

      <PitchSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CommunityMilestone userCount={userCount} />
      <FinalCtaSection isAuthenticated={isAuthenticated} onEnter={() => router.push(isAuthenticated ? "/dashboard" : "/auth/signup")} />
    </main>
  );
}

function PitchSection() {
  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto grid md:grid-cols-12 gap-fluid-lg">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="md:col-span-5"
        >
          <h2 className="font-ball-pill text-5xl md:text-6xl leading-[0.9] text-brand-chalk">
            GRIPKICKS
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="md:col-span-7 md:pt-4 space-y-6 font-sora text-brand-putty/70 text-base md:text-lg leading-relaxed"
        >
          <p>
            GripKicks helps you find climbing shoes that fit. Log the pairs you climb in, rate their comfort, performance, and durability, and build a profile of what works on your foot.
          </p>
          <p>
            Matches come from climbers with the same foot shape.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Map your foot",
      copy: "Pick your foot shape and volume.",
    },
    {
      title: "Rate the shoes you own",
      copy: "Add your shoes and rate their comfort, performance, and durability.",
    },
    {
      title: "Find your next pair",
      copy: "See shoes ranked for your foot profile, and what climbers with the same feet rate highly.",
    },
  ];

  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="mb-fluid-2xl"
        >
          <h2 className="font-ball-pill text-4xl md:text-5xl leading-[0.9] text-brand-chalk max-w-2xl">
            How it works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="bg-black p-8 md:p-10 flex flex-col gap-6 min-h-[260px]"
            >
              <div>
                <h3 className="font-ball-pill text-2xl text-brand-chalk mb-3">{step.title}</h3>
                <p className="font-sora text-sm text-brand-putty/60 leading-relaxed">{step.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Foot Lab",
      copy: "Set your foot shape and volume.",
      href: "/footlab",
    },
    {
      title: "Sanctuary",
      copy: "Your climbing shoe collection and ratings.",
      href: "/stash",
    },
    {
      title: "Matcher",
      copy: "Shoes plotted on a comfort/performance grid.",
      href: "/matcher",
    },
    {
      title: "Sole Mate",
      copy: "See what climbers with your foot profile rate highly.",
      href: "/matcher?tab=mate",
    },
  ];

  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="mb-fluid-2xl"
        >
          <h2 className="font-ball-pill text-4xl md:text-5xl leading-[0.9] text-brand-chalk max-w-2xl">
            Features
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className="bg-black"
            >
              <Link
                href={feature.href}
                className="group relative flex flex-col justify-between gap-8 p-8 md:p-10 hover:bg-brand-surface transition-colors duration-500 min-h-[220px] overflow-hidden"
              >
                <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-red origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-out" />
                <div>
                  <h3 className="font-ball-pill text-3xl text-brand-chalk mb-3 group-hover:text-brand-red transition-colors duration-500">
                    {feature.title}
                  </h3>
                  <p className="font-sora text-sm text-brand-putty/60 leading-relaxed max-w-sm">
                    {feature.copy}
                  </p>
                </div>
                <span className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-brand-red group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({ isAuthenticated, onEnter }: { isAuthenticated: boolean; onEnter: () => void }) {
  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-fluid-lg"
        >
          <h2 className="font-ball-pill text-5xl md:text-7xl lg:text-8xl leading-[0.85] text-brand-chalk max-w-3xl">
            GET STARTED
          </h2>
          <button
            onClick={onEnter}
            className="group relative font-ball-pill text-fluid-3xl text-white hover:text-brand-red transition-colors duration-500 shrink-0 self-start md:self-end"
          >
            <span className="relative">
              {isAuthenticated ? "Dashboard" : "Get started"}
              <span className="absolute left-0 -bottom-2 h-[2px] w-full origin-left scale-x-0 bg-brand-red group-hover:scale-x-100 transition-transform duration-500 ease-out" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
