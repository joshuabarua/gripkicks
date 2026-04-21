"use client";

import React from "react";
import { useSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
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
  return (
    <section className="relative flex items-center justify-center h-svh overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 z-0 will-change-transform"
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
          <h1 className="font-tanker text-4xl md:text-6xl lg:text-7xl leading-[0.85] tracking-tight mb-4 text-white">
            gripkicks
          </h1>
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

      <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content">
        <div className="max-w-fluid-xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-fluid-lg pb-fluid-xl"
          >
            <h2 className="font-tanker text-title-lg leading-[0.85] max-w-3xl tracking-tight text-brand-chalk">
              gripkicks
            </h2>

            <button
              onClick={() =>
                router.push(isAuthenticated ? "/dashboard" : "/auth/signup")
              }
              className="group flex items-center gap-fluid-sm font-tanker text-fluid-3xl text-white hover:text-brand-red transition-colors duration-500"
            >
              {isAuthenticated ? "Dashboard" : "Enter"}
              <div className="w-fluid-xl h-fluid-xl rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-red transition-colors duration-500">
                <ArrowUpRight className="group-hover:rotate-45 transition-transform duration-700" />
              </div>
            </button>
          </motion.div>

          <div className="w-full h-px bg-white/[0.06] mb-fluid-3xl" />

          <div className="font-sora text-sm text-brand-putty/50 max-w-xl">
            Layout test. No marketing copy.
          </div>
        </div>
      </section>
    </main>
  );
}
