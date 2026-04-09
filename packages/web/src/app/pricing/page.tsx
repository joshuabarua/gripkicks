"use client";

import { motion } from "framer-motion";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const features = [
  "Shoe Sanctuary \u2014 manage your full climbing shoe collection",
  "Foot Lab \u2014 profile your foot shape and volume",
  "Smart Match \u2014 data-driven shoe recommendations",
  "Sole Mate \u2014 find climbers with the same feet as you",
  "Reality Check \u2014 brand claims vs. community truth",
  "Rate shoes on comfort, performance, and fit",
  "Full recommendation list \u2014 every shoe that fits your feet",
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
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">
              Pricing
            </p>
            <h1 className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8">
              EVERYTHING
              <br />
              <span className="text-brand-red">FREE</span>
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed"
          >
            Every feature. Every tool. No paywalls, no tiers, no credit card.
            Built by climbers, for climbers.
          </motion.p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-neutral-900 border border-brand-red/30 rounded-3xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            </div>

            <div className="relative mb-8">
              <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-brand-red mb-2">
                Full access
              </p>
              <div className="flex items-baseline gap-3 mb-1">
                <h3 className="font-tanker text-6xl">$0</h3>
                <span className="font-sora text-neutral-500 text-sm">forever</span>
              </div>
              <p className="font-sora text-neutral-500 text-sm">
                No catch. Your data powers better recommendations for everyone.
              </p>
            </div>

            <ul className="space-y-3 mb-10 relative">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-red/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-red" />
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
                className="relative w-full bg-brand-red hover:bg-brand-red/80 text-black font-tanker text-xl py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {isAuthenticated ? "GO TO DASHBOARD" : "JOIN FOR FREE"}
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">
              How it works
            </p>
            <h2 className="font-tanker text-4xl md:text-6xl mb-6">
              MEET YOUR
              <br />
              <span className="text-brand-red">SOLE MATE</span>
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6 font-sora text-lg text-neutral-400 leading-relaxed"
          >
            <p>
              Imagine someone out there has the{" "}
              <span className="text-white">exact same feet</span> as you. Same
              shape, same volume, same size. They&apos;ve already tried dozens
              of shoes and rated them all.
            </p>
            <p>
              With{" "}
              <span className="text-brand-red font-medium">Sole Mate</span>, we
              match you with your foot twin. When someone with your exact foot
              profile shares a shoe in common with you and has rated other shoes
              \u2014 you get notified. Their experience becomes your shortcut.
            </p>
            <p className="text-neutral-500">
              No more guessing. No more expensive trial and error. Just real
              data from someone who walks in your shoes \u2014 literally.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                step: "01",
                title: "MATCH",
                desc: "We look for climbers with the same foot shape and volume as you",
              },
              {
                step: "02",
                title: "VERIFY",
                desc: "You both own at least one shoe in common and rated it similarly",
              },
              {
                step: "03",
                title: "SHORTCUT",
                desc: "See what else they rate highly \u2014 skip the trial and error",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
              >
                <span className="font-tanker text-3xl text-brand-red/20">
                  {item.step}
                </span>
                <h4 className="font-tanker text-lg mt-2 mb-1">{item.title}</h4>
                <p className="font-sora text-xs text-neutral-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">
              No BS
            </p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-12">
              STRAIGHT
              <br />
              <span className="text-brand-red">TALK</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "Why is it free?",
                a: "Because we believe every climber deserves better-fitting shoes. The platform is community-powered \u2014 your anonymous, aggregated data helps everyone find their perfect fit.",
              },
              {
                q: "Will it stay free?",
                a: "Yes. Every consumer feature will remain free forever. Our business model is B2B \u2014 shoe brands pay for anonymised community insights, not climbers.",
              },
              {
                q: "What happens to my data?",
                a: "Your data stays yours. We only share anonymised, aggregated insights with brands. Individual reviews are never attributable to a specific user.",
              },
              {
                q: "How do you keep the lights on?",
                a: "Shoe brands pay for access to community perception data \u2014 things like how their shoes really fit versus what they claim. Climbers never pay.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
              >
                <h4 className="font-sora font-medium text-white mb-2">
                  {item.q}
                </h4>
                <p className="font-sora text-sm text-neutral-500 leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <AnimatedIcon
              animation="float"
              trigger="scroll"
              className="mx-auto mb-6"
            >
              <Sparkles className="w-8 h-8 text-brand-red" />
            </AnimatedIcon>
            <h2 className="font-tanker text-5xl md:text-7xl mb-6">
              FIND YOUR
              <br />
              <span className="text-brand-red">PERFECT FIT</span>
            </h2>
            <p className="font-sora text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
              Every tool, every feature, completely free. Jump in and find the shoes that fit your feet.
            </p>
            <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand-red hover:bg-brand-red/80 text-black font-tanker text-xl px-10 py-4 rounded-2xl transition-colors inline-flex items-center gap-2"
              >
                {isAuthenticated ? "GO TO DASHBOARD" : "JOIN FOR FREE"}
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
