"use client";

import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth";
import AmbientField from "@/components/brand/AmbientField";
import WordmarkWatermark from "@/components/brand/WordmarkWatermark";

const ChromaticGlassMark = dynamic(
  () => import("@/components/brand/ChromaticGlassMark"),
  { ssr: false, loading: () => null },
);

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const features = [
  "Shoe Sanctuary",
  "Foot Lab",
  "Sole Mate",
  "Reality Check",
];

export default function PricingPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="min-h-screen bg-black text-brand-chalk overflow-x-hidden selection:bg-brand-red selection:text-black">
      <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-16 overflow-hidden">
        <AmbientField intensity={0.3} />
        <WordmarkWatermark lines={["FREE"]} align="center" />
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-white/[0.06]" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-white/[0.06]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <ChromaticGlassMark size={200} />
          </motion.div>
          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}>
            <h1 className="font-ball-pill text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 text-brand-chalk">
              $0 forever
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-brand-surface border border-white/[0.06] rounded-3xl p-8 md:p-10"
          >
            <div className="flex items-baseline gap-3 mb-6">
              <h3 className="font-ball-pill text-6xl text-brand-chalk">$0</h3>
              <span className="font-sora text-brand-putty/50 text-sm">forever</span>
            </div>

            <ul className="space-y-3 mb-10">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-red/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-red" />
                  </div>
                  <span className="font-sora text-sm text-brand-putty/80">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full bg-brand-chalk hover:bg-brand-red text-black font-ball-pill text-xl py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {isAuthenticated ? "Dashboard" : "Enter"}
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          <p className="font-sora text-sm text-brand-putty/50 mt-8 text-center">
            Everything, free. Built by climbers, for the community.
          </p>
        </div>
      </section>
    </main>
  );
}
