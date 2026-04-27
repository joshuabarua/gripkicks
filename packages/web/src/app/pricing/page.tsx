"use client";

import { motion } from "framer-motion";
import { Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth";

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
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-16">
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-white/[0.06]" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-white/[0.06]" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <h1 className="font-ball-pill text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 text-white">
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
            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 md:p-10"
          >
            <div className="flex items-baseline gap-3 mb-6">
              <h3 className="font-ball-pill text-6xl text-white">$0</h3>
              <span className="font-sora text-neutral-500 text-sm">forever</span>
            </div>

            <ul className="space-y-3 mb-10">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white/50" />
                  </div>
                  <span className="font-sora text-sm text-neutral-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full bg-white hover:bg-white/80 text-black font-ball-pill text-xl py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {isAuthenticated ? "Dashboard" : "Enter"}
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          <p className="font-sora text-sm text-neutral-500 mt-8 text-center">
            Layout test. No marketing copy.
          </p>
        </div>
      </section>
    </main>
  );
}
