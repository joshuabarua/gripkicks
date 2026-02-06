'use client';

import { motion } from 'framer-motion';
import { Shield, Trash2, Lock, Eye, EyeOff, Database, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const promises = [
  {
    icon: Shield,
    title: 'YOUR DATA BELONGS TO YOU',
    body: 'Every piece of data you share with GripKicks — your foot profile, shoe ratings, preferences — belongs to you. We are custodians, not owners. You can export or delete it at any time.',
  },
  {
    icon: EyeOff,
    title: 'ZERO DATA RESELLING',
    body: 'We will never sell, license, or share your personal data with third parties for advertising, marketing, or any commercial purpose. Not now, not ever. This is non-negotiable.',
  },
  {
    icon: Trash2,
    title: 'PERMANENT DELETION',
    body: 'When you delete your account, your data is permanently removed from our systems. No 30-day holds, no hidden backups kept for "analytics." Deleted means deleted.',
  },
  {
    icon: Lock,
    title: 'MINIMAL COLLECTION',
    body: 'We only collect what we need to help you find better shoes. Your foot shape, your shoe ratings, and basic account info. That\'s it. No tracking across the web, no behavioral profiling.',
  },
  {
    icon: Eye,
    title: 'TRANSPARENT USE',
    body: 'Your data is used for one purpose: helping the climbing community find shoes that fit. Your ratings contribute to aggregate recommendations. Your foot profile matches you with similar climbers.',
  },
  {
    icon: Database,
    title: 'COMMUNITY BENEFIT ONLY',
    body: 'Aggregated, anonymized data helps the whole community get better recommendations. But your individual data is never exposed to other users without your explicit consent.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-24">
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-orange-500/10" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-orange-500/10" />

        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-xs text-orange-500 mb-4 tracking-[0.3em]">[PRIVACY_PROMISE]</p>
            <h1 className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8">
              YOUR DATA<br />
              <span className="text-orange-500">YOUR RULES</span>
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora text-xl md:text-2xl text-neutral-400 max-w-2xl leading-relaxed"
          >
            This isn&apos;t a legal document designed to confuse you. It&apos;s a plain-language promise about how we treat your data.
          </motion.p>
        </div>
      </section>

      {/* The Promise Banner */}
      <section className="py-8 bg-orange-500 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-tanker text-2xl text-black/80">
              NO DATA RESELLING • PERMANENT DELETION • YOUR DATA, YOUR CONTROL • COMMUNITY FIRST •
            </span>
          ))}
        </motion.div>
      </section>

      {/* TL;DR */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-6">[TL;DR]</p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-8">
              THE SHORT<br /><span className="text-orange-500">VERSION</span>
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-neutral-900 border border-orange-500/20 rounded-3xl p-8 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { value: '0%', label: 'Data sold to third parties' },
                { value: '100%', label: 'Yours to delete anytime' },
                { value: 'ZERO', label: 'Hidden tracking or profiling' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="font-tanker text-4xl md:text-5xl text-orange-500 mb-2">{stat.value}</div>
                  <p className="font-sora text-sm text-neutral-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promises Grid */}
      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-6">[OUR_PROMISES]</p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-12">
              SIX PROMISES<br /><span className="text-orange-500">WE KEEP</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promises.map((promise, i) => (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 group hover:border-orange-500/20 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <promise.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-tanker text-xl mb-3">{promise.title}</h3>
                <p className="font-sora text-sm text-neutral-500 leading-relaxed">{promise.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Collect */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-6">[WHAT_WE_COLLECT]</p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-12">
              EXACTLY WHAT<br /><span className="text-orange-500">WE NEED</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { what: 'Account basics', why: 'Name and email so you can log in and we can reach you', kept: 'Until you delete your account' },
              { what: 'Foot profile', why: 'Shape and volume to match you with similar climbers', kept: 'Until you delete your account' },
              { what: 'Shoe ratings', why: 'Comfort, performance, and fit scores to power recommendations', kept: 'Until you delete your account' },
              { what: 'Shoe collection', why: 'Track which shoes you own or have tried', kept: 'Until you delete your account' },
            ].map((row, i) => (
              <motion.div
                key={row.what}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-1">WHAT</p>
                  <p className="font-sora text-white font-medium">{row.what}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-1">WHY</p>
                  <p className="font-sora text-neutral-400 text-sm">{row.why}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-1">HOW LONG</p>
                  <p className="font-sora text-neutral-400 text-sm">{row.kept}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6"
          >
            <p className="font-sora text-sm text-neutral-400">
              <span className="text-orange-500 font-medium">What we don&apos;t collect:</span> browsing habits, location data, device fingerprints, contacts, photos, or anything else that isn&apos;t directly needed to help you find climbing shoes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <h2 className="font-tanker text-5xl md:text-7xl mb-6">
              QUESTIONS?<br /><span className="text-orange-500">ASK US</span>
            </h2>
            <p className="font-sora text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
              We believe in transparency. If you have questions about your data or our practices, we&apos;re happy to answer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl px-10 py-4 rounded-2xl transition-colors inline-flex items-center gap-2"
                >
                  JOIN GRIPKICKS
                  <ArrowUpRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-orange-500 font-sora px-10 py-4 rounded-2xl transition-all"
                >
                  Why we built this
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
