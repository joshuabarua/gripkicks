'use client';

import { motion } from 'framer-motion';
import LiquidGlassBackdrop from '@/components/brand/LiquidGlassBackdrop';
import WordmarkWatermark from '@/components/brand/WordmarkWatermark';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

function SectionHeader({ heading }: { heading: string }) {
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
      <h2 className="font-ball-pill text-4xl md:text-5xl mb-12 text-brand-chalk">
        {heading}
      </h2>
    </motion.div>
  );
}

const promises = [
  {
    title: 'YOUR DATA BELONGS TO YOU',
    body: 'Your foot profile, shoe ratings, and preferences belong to you. Export or delete them anytime.',
  },
  {
    title: 'ZERO DATA RESELLING',
    body: 'We do not sell or share your personal data with third parties.',
  },
  {
    title: 'PERMANENT DELETION',
    body: 'Deleting your account removes your data permanently.',
  },
  {
    title: 'MINIMAL COLLECTION',
    body: 'We collect only what is needed to match shoes: your foot shape, your shoe ratings, and basic account info.',
  },
  {
    title: 'TRANSPARENT USE',
    body: 'Your ratings feed aggregate recommendations. Your foot profile matches you with similar climbers.',
  },
  {
    title: 'COMMUNITY BENEFIT ONLY',
    body: 'Aggregated, anonymized data improves recommendations. Your individual data is never shared without your consent.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-brand-chalk overflow-x-hidden selection:bg-brand-red selection:text-black">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center px-6 md:px-12 lg:px-16 pt-32 pb-24 overflow-hidden">
        <LiquidGlassBackdrop align="right" />
        <WordmarkWatermark lines={['PRIVACY']} align="right" />
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-white/6" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-white/6" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.25 }}>
            <h1 className="font-ball-pill text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 text-brand-chalk">
              PRIVACY
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-mono text-xl md:text-2xl text-brand-putty/70 max-w-2xl leading-relaxed"
          >
            How GripKicks handles your data.
          </motion.p>
        </div>
      </section>

      {/* TL;DR */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <h2 className="font-ball-pill text-4xl md:text-5xl mb-8">
              TL;DR
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="bg-black border border-brand-red/20 rounded-3xl p-8 md:p-10"
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
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.25 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="font-ball-pill text-4xl md:text-5xl text-brand-chalk mb-2">{stat.value}</div>
                  <p className="font-mono text-sm text-brand-putty/50">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promises Grid */}
      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <SectionHeader heading="OUR PROMISES" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promises.map((promise, i) => (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.22 }}
                viewport={{ once: true }}
                className="bg-brand-surface border border-white/6 rounded-3xl p-8 group hover:border-brand-red/20 transition-colors"
              >
                <h3 className="font-ball-pill text-xl mb-3 text-brand-chalk">{promise.title}</h3>
                <p className="font-mono text-sm text-brand-putty/60 leading-relaxed">{promise.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Collect */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <SectionHeader heading="WHAT WE COLLECT" />

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
                transition={{ duration: 0.5, delay: i * 0.25 }}
                viewport={{ once: true }}
                className="bg-black border border-white/6 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-putty/40 mb-1">What</p>
                  <p className="font-mono text-brand-chalk font-medium">{row.what}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-putty/40 mb-1">Why</p>
                  <p className="font-mono text-brand-putty/60 text-sm">{row.why}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-putty/40 mb-1">How long</p>
                  <p className="font-mono text-brand-putty/60 text-sm">{row.kept}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-brand-red/5 border border-brand-red/20 rounded-2xl p-6"
          >
            <p className="font-mono text-sm text-brand-putty/60">
              <span className="text-brand-chalk font-medium">What we don&apos;t collect:</span> browsing habits, location data, device fingerprints, contacts, photos, or anything else not needed to match climbing shoes.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
