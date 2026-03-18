'use client';

import { motion } from 'framer-motion';
import { Heart, Mountain, Users, Footprints, ArrowUpRight } from 'lucide-react';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import Link from 'next/link';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-24">
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-orange-500/10" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-orange-500/10" />

        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Why GripKicks</p>
            <h1 className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8">
              BORN FROM<br />
              <span className="text-orange-500">FRUSTRATION</span>
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora text-xl md:text-2xl text-neutral-400 max-w-2xl leading-relaxed"
          >
            Every climber deserves a shoe that fits. Not every climber gets one.
          </motion.p>
        </div>
      </section>

      {/* The Story */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }} className="mb-16">
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">The Story</p>
            <div className="space-y-8 font-sora text-lg text-neutral-300 leading-relaxed">
              <p>
                I have extremely weird climbing feet. Low volume, narrow, but big. 
                Every shoe I tried was a compromise — too wide here, too tight there, 
                never quite right. I spent years and hundreds of euros trying shoes 
                that other people swore by, only to find they were built for completely 
                different feet.
              </p>
              <p>
                The problem wasn&apos;t the shoes. The problem was that there was no way 
                to find people with feet like mine and learn what actually worked for them.
              </p>
              <p className="text-white text-xl font-medium">
                So I built GripKicks.
              </p>
              <p>
                The idea is simple: <span className="text-orange-500">why not democratize the shoe-finding process?</span> Instead 
                of relying on marketing, brand loyalty, or one person&apos;s review — what if we 
                could match climbers by their actual foot shape and volume, and share real 
                comfort and performance data across the community?
              </p>
              <p>
                No AI gimmicks. No foot-scanning hardware. Just real climbers helping 
                real climbers find shoes that actually fit.
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent my-16" />

          {/* Values Grid */}
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">What We Believe</p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-12">
              BUILT ON<br /><span className="text-orange-500">PRINCIPLES</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Users,
                title: 'COMMUNITY FIRST',
                body: 'Every feature exists to help climbers help each other. Your ratings, your foot data, your experience — it all contributes to a collective knowledge base that makes shoe-finding better for everyone.',
              },
              {
                icon: Heart,
                title: 'HONEST & TRANSPARENT',
                body: 'No inflated stats. No fake reviews. No partnerships that bias recommendations. The data speaks for itself, and it comes directly from climbers like you.',
              },
              {
                icon: Mountain,
                title: 'REAL PROBLEMS, REAL SOLUTIONS',
                body: 'This isn\'t a tech demo. It\'s a tool built by a climber who couldn\'t find shoes that fit. Every feature solves a real problem that real climbers face.',
              },
              {
                icon: Footprints,
                title: 'YOUR DATA BELONGS TO YOU',
                body: 'We don\'t sell your data. We don\'t share it with advertisers. When you delete your account, your data is permanently removed. Full stop.',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 group hover:border-orange-500/20 transition-colors"
              >
                <AnimatedIcon animation="pop" trigger="scroll" delay={i * 0.1}>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <card.icon className="w-6 h-6 text-orange-500" />
                  </div>
                </AnimatedIcon>
                <h3 className="font-tanker text-xl mb-3">{card.title}</h3>
                <p className="font-sora text-sm text-neutral-500 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">How It Works</p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-16">
              SIMPLE BY<br /><span className="text-orange-500">DESIGN</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'PROFILE YOUR FEET',
                desc: 'Tell us your foot shape and volume. No scanning equipment needed — just look at your feet and pick from well-documented foot types.',
              },
              {
                step: '02',
                title: 'RATE YOUR SHOES',
                desc: 'Add the climbing shoes you own or have tried. Rate them on comfort, performance, and fit. Your honest experience helps the whole community.',
              },
              {
                step: '03',
                title: 'FIND YOUR MATCH',
                desc: 'We connect you with climbers who have similar feet. See what shoes they love, what fits them well, and discover your next perfect pair — based on real data from real feet.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="flex gap-8 items-start"
              >
                <div className="font-tanker text-6xl text-orange-500/20 leading-none shrink-0 w-20">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-tanker text-2xl mb-2">{item.title}</h3>
                  <p className="font-sora text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <h2 className="font-tanker text-5xl md:text-7xl mb-6">
              LET&apos;S FIND YOUR<br /><span className="text-orange-500">PERFECT FIT</span>
            </h2>
            <p className="font-sora text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
              Join a community of climbers who are tired of guessing and ready to share what actually works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl px-10 py-4 rounded-2xl transition-colors inline-flex items-center gap-2"
                >
                  GET STARTED
                  <ArrowUpRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/privacy">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-orange-500 font-sora px-10 py-4 rounded-2xl transition-all"
                >
                  Read our privacy promise
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <section className="py-6 bg-orange-500 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-tanker text-xl text-black/80">
              BY CLIMBERS • FOR CLIMBERS • NO AI • NO GIMMICKS • YOUR DATA IS YOURS •
            </span>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
