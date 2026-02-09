'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSession, authClient } from '@/lib/auth';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { fetchApi } from '@/lib/api-client';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

interface PlanFeature {
  text: string;
  included: boolean;
}

const freePlan: PlanFeature[] = [
  { text: 'Shoe Sanctuary — manage your collection', included: true },
  { text: 'Foot Lab — profile your feet', included: true },
  { text: 'Find My Shoe — top 1 recommendation', included: true },
  { text: 'Rate shoes on comfort & performance', included: true },
  { text: 'Full recommendation list', included: false },
  { text: 'Sole Mate matching', included: false },
];

const premiumPlan: PlanFeature[] = [
  { text: 'Everything in Free', included: true },
  { text: 'Full recommendation list — all matching shoes', included: true },
  { text: 'Sole Mate — find your foot twin', included: true },
  { text: 'Priority community support', included: true },
  { text: 'Early access to new features', included: true },
  { text: 'Cancel anytime, no questions asked', included: true },
];

const pricingOptions = [
  { id: 'monthly', label: 'Monthly', price: '1', period: '/mo', savings: '' },
  { id: 'yearly', label: 'Yearly', price: '10', period: '/yr', savings: 'Save 17%' },
  { id: 'lifetime', label: 'Lifetime', price: '50', period: 'once', savings: 'Best value' },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const founderSpotsTotal = 1000;

  useEffect(() => {
    async function loadUserCount() {
      try {
        const response = await fetchApi<{ count: number }>('/api/v1/users/count');
        if (response.isOk()) {
          setTotalUsers(response.value.count);
        }
      } catch {
        setTotalUsers(null);
      }
    }
    loadUserCount();
  }, []);

  const spotsRemaining = totalUsers !== null ? Math.max(0, founderSpotsTotal - totalUsers) : null;
  const founderProgress = totalUsers !== null ? Math.min(100, (totalUsers / founderSpotsTotal) * 100) : 0;

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-16">
        <div className="absolute top-12 left-12 w-24 h-24 border-l-2 border-t-2 border-orange-500/10" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-r-2 border-b-2 border-orange-500/10" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-xs text-orange-500 mb-4 tracking-[0.3em]">[PRICING]</p>
            <h1 className="font-tanker text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8">
              SIMPLE<br />
              <span className="text-orange-500">PRICING</span>
            </h1>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sora text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed"
          >
            Support the community. Unlock the full experience. Cancel whenever you want — seriously.
          </motion.p>
        </div>
      </section>

      {/* Founder Banner */}
      <section className="px-6 md:px-12 lg:px-16 pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <AnimatedIcon animation="float" trigger="scroll">
                  <Crown className="w-6 h-6 text-black" />
                </AnimatedIcon>
                <p className="font-tanker text-2xl text-black">FOUNDER MEMBERS</p>
              </div>
              <p className="font-sora text-black/80 mb-6">
                The first <span className="font-bold text-black">1,000 users</span> get lifetime premium access — completely free. 
                No catch. You believed in us early, we believe in rewarding that.
              </p>
              <div className="bg-black/10 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-black/60 tracking-[0.2em]">[FOUNDER_SPOTS]</span>
                  <span className="font-sora text-sm text-black font-medium">
                    {spotsRemaining !== null ? `${spotsRemaining} remaining` : 'Loading...'}
                  </span>
                </div>
                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-black rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${founderProgress}%` }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono text-[10px] text-black/40">0</span>
                  <span className="font-mono text-[10px] text-black/40">1,000</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Toggle */}
      <section className="px-6 md:px-12 lg:px-16 pb-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="flex justify-center gap-2 mb-12"
          >
            {pricingOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(option.id)}
                className={`relative px-6 py-3 rounded-2xl font-sora text-sm transition-all ${
                  selectedPlan === option.id
                    ? 'bg-orange-500 text-black font-medium'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-orange-500/30'
                }`}
              >
                {option.label}
                {option.savings && (
                  <span className={`absolute -top-2 -right-2 text-[9px] px-2 py-0.5 rounded-full font-mono ${
                    selectedPlan === option.id ? 'bg-black text-orange-500' : 'bg-orange-500 text-black'
                  }`}>
                    {option.savings}
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col"
            >
              <div className="mb-8">
                <AnimatedIcon animation="pop" trigger="scroll" delay={0.1}>
                  <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-neutral-400" />
                  </div>
                </AnimatedIcon>
                <p className="font-mono text-[10px] text-neutral-500 tracking-[0.2em] mb-2">[FREE_TIER]</p>
                <h3 className="font-tanker text-4xl mb-1">FREE</h3>
                <p className="font-sora text-neutral-500 text-sm">Forever. No credit card needed.</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {freePlan.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      feature.included ? 'bg-neutral-800' : 'bg-neutral-800/50'
                    }`}>
                      {feature.included ? (
                        <Check className="w-3 h-3 text-neutral-400" />
                      ) : (
                        <span className="w-2 h-px bg-neutral-600" />
                      )}
                    </div>
                    <span className={`font-sora text-sm ${feature.included ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border border-neutral-700 hover:border-orange-500/30 text-neutral-400 hover:text-white font-sora py-4 rounded-2xl transition-all"
                >
                  Get Started Free
                </motion.button>
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-neutral-900 border border-orange-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="font-mono text-[9px] bg-orange-500 text-black px-3 py-1 rounded-full tracking-[0.1em]">RECOMMENDED</span>
              </div>

              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              </div>

              <div className="relative mb-8">
                <AnimatedIcon animation="pop" trigger="scroll" delay={0.2}>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                </AnimatedIcon>
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-2">[PREMIUM]</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="font-tanker text-5xl">
                    €{pricingOptions.find(p => p.id === selectedPlan)?.price}
                  </h3>
                  <span className="font-sora text-neutral-500 text-sm">
                    {pricingOptions.find(p => p.id === selectedPlan)?.period}
                  </span>
                </div>
                <p className="font-sora text-neutral-500 text-sm">
                  {selectedPlan === 'lifetime' ? 'One payment. Yours forever.' : 'Cancel anytime. We mean it.'}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1 relative">
                {premiumPlan.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-500" />
                    </div>
                    <span className="font-sora text-sm text-neutral-300">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  if (!session?.user) {
                    window.location.href = '/auth/signup';
                    return;
                  }
                  await authClient.checkout({ slug: selectedPlan });
                }}
                className="relative w-full bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {session?.user ? 'UPGRADE NOW' : 'GET STARTED'}
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sole Mate Feature Highlight */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-6">[PREMIUM_FEATURE]</p>
            <h2 className="font-tanker text-4xl md:text-6xl mb-6">
              MEET YOUR<br /><span className="text-orange-500">SOLE MATE</span>
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6 font-sora text-lg text-neutral-400 leading-relaxed"
          >
            <p>
              Imagine someone out there has the <span className="text-white">exact same feet</span> as you. 
              Same shape, same volume, same size. They&apos;ve already tried dozens of shoes and rated them all.
            </p>
            <p>
              With <span className="text-orange-500 font-medium">Sole Mate</span>, we match you with your foot twin. 
              When someone with your exact foot profile shares a shoe in common with you and has rated other shoes — 
              you get notified. Their experience becomes your shortcut.
            </p>
            <p className="text-neutral-500">
              No more guessing. No more expensive trial and error. Just real data from someone who walks in your shoes — literally.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { step: '01', title: 'MATCH', desc: 'We find users with identical foot profiles to yours' },
              { step: '02', title: 'VERIFY', desc: 'You share at least one shoe in common with matching ratings' },
              { step: '03', title: 'DISCOVER', desc: 'See every shoe they love — ranked by their real experience' },
            ].map((item) => (
              <div key={item.step} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <span className="font-tanker text-3xl text-orange-500/20">{item.step}</span>
                <h4 className="font-tanker text-lg mt-2 mb-1">{item.title}</h4>
                <p className="font-sora text-xs text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ / Transparency */}
      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-6">[NO_BS]</p>
            <h2 className="font-tanker text-4xl md:text-5xl mb-12">
              STRAIGHT<br /><span className="text-orange-500">TALK</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel immediately after one month?',
                a: 'Absolutely. Pay for one month, use it, cancel. No hard feelings, no retention tricks. We\'d rather you come back because you want to.',
              },
              {
                q: 'What happens to my data if I downgrade?',
                a: 'Your data stays yours. You keep your shoe collection, ratings, and foot profile. You just lose access to the full recommendation list and Sole Mate matching.',
              },
              {
                q: 'Why is it so cheap?',
                a: 'Because this is a community project, not a VC-backed startup. We charge just enough to keep the servers running and the project alive. The goal is helping climbers, not maximizing revenue.',
              },
              {
                q: 'What about the first 1,000 users?',
                a: 'If you signed up before we hit 1,000 users, you get lifetime premium access for free. Forever. Even if you leave and come back. It\'s our way of saying thanks for believing in this early.',
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
                <h4 className="font-sora font-medium text-white mb-2">{item.q}</h4>
                <p className="font-sora text-sm text-neutral-500 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-16 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.8 }}>
            <AnimatedIcon animation="float" trigger="scroll" className="mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-orange-500" />
            </AnimatedIcon>
            <h2 className="font-tanker text-5xl md:text-7xl mb-6">
              FIND YOUR<br /><span className="text-orange-500">PERFECT FIT</span>
            </h2>
            <p className="font-sora text-neutral-500 text-lg mb-10 max-w-xl mx-auto">
              Join the community. Start free. Upgrade when you&apos;re ready — or don&apos;t. We&apos;re glad you&apos;re here either way.
            </p>
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-orange-500 hover:bg-orange-600 text-black font-tanker text-xl px-10 py-4 rounded-2xl transition-colors inline-flex items-center gap-2"
              >
                GET STARTED FREE
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
