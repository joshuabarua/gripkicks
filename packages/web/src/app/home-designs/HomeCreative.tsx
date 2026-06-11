"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
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
}: {
  isReducedEffects: boolean;
}) {
  return (
    <section className="relative flex items-center justify-center h-svh overflow-hidden">
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

  return (
    <main className="min-h-screen bg-black text-brand-chalk selection:bg-brand-red selection:text-black antialiased relative">
      <HeroSection isReducedEffects={isReducedEffects} />

      <PitchSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CommunityMilestone />
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
            The shoe wall<br />for climbers.
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
            Track every shoe you climb in. Rate comfort, performance, and durability the way you actually feel them. Build a profile of what works on your foot, on your style, on your wall.
          </p>
          <p>
            Then let the data find shoes you&rsquo;d never have picked off the rack &mdash; matched by climbers who share your exact foot shape and volume.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "Map your foot",
      copy: "Pick your shape and volume in 30 seconds. Egyptian, Greek, Roman — we use the same fit language as the brands.",
    },
    {
      n: "02",
      title: "Rate the shoes you own",
      copy: "Add the pairs in your rotation. Score them on what matters: comfort, edging power, durability, aggression.",
    },
    {
      n: "03",
      title: "Find your next pair",
      copy: "See shoes ranked for your foot profile and climbing style. Discover what’s working for climbers built like you.",
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
            Three steps. <span className="text-brand-red">No guesswork.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-white/[0.06]">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
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
      copy: "Lock in your foot shape and volume. Everything else flows from this.",
      href: "/footlab",
    },
    {
      title: "Sanctuary",
      copy: "Your shoe wall, digitised. Track every pair, every rating, every retirement.",
      href: "/stash",
    },
    {
      title: "Matcher",
      copy: "Visual radar map of shoes ranked for your style. Comfort to competition.",
      href: "/matcher",
    },
    {
      title: "Sole Mate",
      copy: "Climbers with your exact foot profile. See what they’re rating high.",
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
            Built for the way<br />climbers actually shop.
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
            Stop guessing.<br /><span className="text-brand-red">Start climbing.</span>
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
