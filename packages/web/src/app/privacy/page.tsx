'use client';

import LiquidGlassBackdrop from '@/components/brand/LiquidGlassBackdrop';
import WordmarkWatermark from '@/components/brand/WordmarkWatermark';
import { riseDelay } from '@/lib/motion';

function SectionHeader({ heading, riseIndex }: { heading: string; riseIndex: number }) {
  return (
    <div className="lab-rise" style={riseDelay(riseIndex)}>
      <h2 className="font-amatic text-fluid-5xl mb-12 text-brand-chalk">
        {heading}
      </h2>
    </div>
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
      <section className="relative flex min-h-[80vh] items-center px-fluid-lg md:px-fluid-xl pt-fluid-3xl pb-fluid-3xl overflow-hidden">
        <LiquidGlassBackdrop align="right" />
        <WordmarkWatermark lines={['PRIVACY']} align="right" />
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-white/6" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-white/6" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="lab-rise" style={riseDelay(0)}>
            <h1 className="font-amatic text-fluid-9xl leading-[0.9] mb-8 text-brand-chalk">
              PRIVACY
            </h1>
          </div>

          <p
            className="lab-rise font-mono text-fluid-2xl text-brand-putty/70 max-w-2xl leading-relaxed"
            style={riseDelay(1)}
          >
            How GripKicks handles your data.
          </p>
        </div>
      </section>

      <section className="px-fluid-lg md:px-fluid-xl py-fluid-3xl bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <div className="lab-rise" style={riseDelay(2)}>
            <h2 className="font-amatic text-fluid-5xl mb-8">
              TL;DR
            </h2>
          </div>

          <div
            className="lab-rise bg-black border border-brand-red/20 rounded-3xl p-fluid-xl"
            style={riseDelay(3)}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { value: '0%', label: 'Data sold to third parties' },
                { value: '100%', label: 'Yours to delete anytime' },
                { value: 'ZERO', label: 'Hidden tracking or profiling' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-amatic text-fluid-5xl text-brand-chalk mb-2">{stat.value}</div>
                  <p className="font-mono text-fluid-sm text-brand-putty/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-fluid-lg md:px-fluid-xl py-fluid-3xl">
        <div className="max-w-4xl mx-auto">
          <SectionHeader heading="OUR PROMISES" riseIndex={4} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promises.map((promise, i) => (
              <div
                key={promise.title}
                style={riseDelay(5 + i)}
                className="lab-rise bg-brand-surface border border-white/6 rounded-3xl p-8 group hover:border-brand-red/20 transition-colors"
              >
                <h3 className="font-amatic text-xl mb-3 text-brand-chalk">{promise.title}</h3>
                <p className="font-mono text-fluid-sm text-brand-putty/60 leading-relaxed">{promise.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-fluid-lg md:px-fluid-xl py-fluid-3xl bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <SectionHeader heading="WHAT WE COLLECT" riseIndex={11} />

          <div className="space-y-4">
            {[
              { what: 'Account basics', why: 'Name and email so you can log in and we can reach you', kept: 'Until you delete your account' },
              { what: 'Foot profile', why: 'Shape and volume to match you with similar climbers', kept: 'Until you delete your account' },
              { what: 'Shoe ratings', why: 'Comfort, performance, and fit scores to power recommendations', kept: 'Until you delete your account' },
              { what: 'Shoe collection', why: 'Track which shoes you own or have tried', kept: 'Until you delete your account' },
            ].map((row, i) => (
              <div
                key={row.what}
                style={riseDelay(12 + i)}
                className="lab-rise bg-black border border-white/6 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <p className="font-mono text-fluid-xs uppercase tracking-[0.2em] text-brand-putty/40 mb-1">What</p>
                  <p className="font-mono text-brand-chalk font-medium">{row.what}</p>
                </div>
                <div>
                  <p className="font-mono text-fluid-xs uppercase tracking-[0.2em] text-brand-putty/40 mb-1">Why</p>
                  <p className="font-mono text-brand-putty/60 text-fluid-sm">{row.why}</p>
                </div>
                <div>
                  <p className="font-mono text-fluid-xs uppercase tracking-[0.2em] text-brand-putty/40 mb-1">How long</p>
                  <p className="font-mono text-brand-putty/60 text-fluid-sm">{row.kept}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="lab-rise mt-8 bg-brand-red/5 border border-brand-red/20 rounded-2xl p-6"
            style={riseDelay(16)}
          >
            <p className="font-mono text-fluid-sm text-brand-putty/60">
              <span className="text-brand-chalk font-medium">What we don&apos;t collect:</span> browsing habits, location data, device fingerprints, contacts, photos, or anything else not needed to match climbing shoes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
