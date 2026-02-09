"use client";

import React from "react";
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { ArrowUpRight, Footprints, Zap, Target, Activity, Sparkles, Clock, Flame } from 'lucide-react';
import { AnimatedNavIcon } from '@/components/ui/AnimatedNavIcon';
import { motion } from 'framer-motion';
import { FullPageLoading } from '@/components/ui/loading';

const Scene = dynamic(() => import("@/components/3d/Scene"), { 
  ssr: false,
  loading: () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
});

export default function HomeCreative() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = React.useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  React.useEffect(() => {
    const target = new Date('2026-03-01T00:00:00Z').getTime();
    const updateCountdown = () => {
      const diff = Math.max(target - Date.now(), 0);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isPending) {
    return <FullPageLoading />;
  }

  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name || 'Climber';
  const totalLifetimeSlots = 1000;
  const claimedSlots = 823;
  const remainingSlots = totalLifetimeSlots - claimedSlots;
  const remainingPercent = (remainingSlots / totalLifetimeSlots) * 100;

  const tierOptions = [
    {
      name: 'Free',
      price: '€0',
      subLabel: '',
      tagline: 'Instant access to Shoe Sanctuary and Foot Lab previews.',
      features: ['1 top recommendation', 'Community comfort notes', 'Save favorite shoes'],
      highlight: false,
      cta: 'Explore free',
      href: '/stash',
    },
    {
      name: 'Premium',
      price: '€1/mo',
      subLabel: 'or €10/yr',
      tagline: 'Full match engine, Sole Mate, and lifetime data ownership.',
      features: ['Unlimited recommendations', 'Foot Lab deep dive', 'Sole Mate matching', 'Sizing heatmaps'],
      highlight: true,
      cta: 'Unlock premium',
      href: '/auth/signup',
    },
  ];

  const activityFeed = [
    { user: 'Mika', action: 'logged a fit note on Solutions', time: '1m ago' },
    { user: 'Sage', action: 'matched with Sole Mate duo', time: '3m ago' },
    { user: 'Rhea', action: 'shared Foot Lab measurements', time: '5m ago' },
    { user: 'Noor', action: 'saved Tenaya Mastia to stash', time: '8m ago' },
  ];

  const spotlightArticles = [
    {
      tag: 'Guide',
      title: 'Decoding downturn & tension for steep projects',
      summary: 'How elite setters pick midsoles for toe hooks and paddle dynos.',
      readingTime: '6 min read',
      href: '/stories/downturn-guide',
    },
    {
      tag: 'Interview',
      title: 'Foot Lab with Lynn: keeping comfort at V12',
      summary: 'A candid chat on balancing aggressive shapes with long sessions.',
      readingTime: '4 min read',
      href: '/stories/lynn-foot-lab',
    },
    {
      tag: 'Drop',
      title: 'Rubber report: 2026 compounds ranked by grip',
      summary: 'Community wear tests reveal which soles stay sticky indoors.',
      readingTime: '5 min read',
      href: '/stories/rubber-report',
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section - Preserved */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Scene />
        </div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] tracking-[0.3em] text-orange-500/60 uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-orange-500/60 to-transparent" />
        </motion.div>
      </section>

      <section className="bg-black border-y border-neutral-900 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="font-sora text-xs tracking-[0.4em] uppercase text-neutral-500">Live feed</p>
              <p className="font-tanker text-2xl">Climbers in motion</p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: [0, -600] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="flex gap-6 whitespace-nowrap"
            >
              {[...activityFeed, ...activityFeed].map((activity, index) => (
                <div key={`${activity.user}-${index}`} className="px-4 py-2 border border-neutral-800 rounded-2xl bg-neutral-900/40">
                  <span className="font-tanker text-lg text-white mr-2">{activity.user}</span>
                  <span className="font-sora text-sm text-neutral-400">{activity.action}</span>
                  <span className="font-sora text-xs text-orange-400 ml-3">{activity.time}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Creative Bento Grid Section */}
      <section className="min-h-screen bg-neutral-950 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            {isAuthenticated && (
              <p className="text-orange-500 font-sora text-sm mb-4">Hey {userName} 👋</p>
            )}
            <h2 className="font-tanker text-5xl md:text-7xl lg:text-8xl">
              {isAuthenticated ? (
                <>Ready to<br /><span className="text-orange-500">climb?</span></>
              ) : (
                <>Your perfect<br /><span className="text-orange-500">fit awaits</span></>
              )}
            </h2>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-4 auto-rows-[140px]">
            {/* Large Feature Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              onClick={() => router.push(isAuthenticated ? '/dashboard' : '/auth/signup')}
              className="col-span-12 md:col-span-8 row-span-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-black/60 text-sm font-medium mb-2">
                    {isAuthenticated ? 'Continue your journey' : 'Start your journey'}
                  </p>
                  <h3 className="font-tanker text-4xl md:text-5xl text-black">
                    {isAuthenticated ? 'Dashboard' : 'Get Started'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <ArrowUpRight className="w-6 h-6 text-black group-hover:rotate-45 transition-transform" />
                </div>
              </div>
              <p className="font-sora text-black/70 max-w-md">
                {isAuthenticated 
                  ? 'View your shoe collection, ratings, and personalized recommendations.'
                  : 'Create your profile and discover shoes matched to your unique climbing style.'
                }
              </p>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between"
            >
              <AnimatedNavIcon icon={<Zap className="w-8 h-8 text-orange-500" />} animation="pulse" size={32} />
              <div>
                <div className="font-tanker text-5xl text-white">100%</div>
                <p className="font-sora text-neutral-500 text-sm mt-1">Community powered</p>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between group hover:border-orange-500/30 transition-colors"
            >
              <AnimatedNavIcon icon={<div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center"><Footprints className="w-6 h-6 text-orange-500" /></div>} animation="wiggle" size={48} />
              <div>
                <h4 className="font-tanker text-xl text-white mb-1">Foot Lab</h4>
                <p className="font-sora text-neutral-500 text-xs">Community-driven foot profiling</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="col-span-6 md:col-span-4 row-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between group hover:border-orange-500/30 transition-colors"
            >
              <AnimatedNavIcon icon={<div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center"><Target className="w-6 h-6 text-orange-500" /></div>} animation="spin" size={48} />
              <div>
                <h4 className="font-tanker text-xl text-white mb-1">Smart Match</h4>
                <p className="font-sora text-neutral-500 text-xs">Personalized recommendations</p>
              </div>
            </motion.div>

            {/* 3D Selector CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              onClick={() => router.push('/selector')}
              className="col-span-6 md:col-span-4 row-span-2 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-3xl p-6 flex flex-col justify-between cursor-pointer group hover:border-orange-500/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] tracking-[0.2em] text-orange-500 uppercase">Interactive</span>
                <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 group-hover:rotate-45 transition-all" />
              </div>
              <div>
                <h4 className="font-tanker text-2xl text-white mb-1">3D Selector</h4>
                <p className="font-sora text-neutral-500 text-xs">Explore shoes in 3D</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center gap-16"
          >
            {[
              { value: '100%', label: 'Your Data, Your Control' },
              { value: '0%', label: 'Data Resold. Ever.' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-tanker text-3xl text-orange-500">{stat.value}</div>
                <div className="font-sora text-xs text-neutral-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="bg-neutral-950 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="font-sora text-xs uppercase tracking-[0.4em] text-orange-400">Choose your flow</p>
              <h3 className="font-tanker text-4xl md:text-5xl mt-2">Free vs Premium</h3>
            </div>
            <div className="flex items-center gap-3 text-sm font-sora text-neutral-400">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Data stays yours no matter the tier
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {tierOptions.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl border ${tier.highlight ? 'border-orange-400 bg-gradient-to-br from-orange-500/10 to-black' : 'border-neutral-800 bg-black/40'} p-8 flex flex-col gap-6`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sora text-xs uppercase tracking-[0.4em] text-neutral-500">{tier.name}</p>
                    <p className="font-tanker text-4xl mt-2">{tier.price}</p>
                    {tier.subLabel && (
                      <p className="font-sora text-sm text-neutral-500">{tier.subLabel}</p>
                    )}
                  </div>
                  {tier.highlight && (
                    <span className="flex items-center gap-2 text-xs font-sora uppercase tracking-[0.3em] text-orange-400">
                      <Flame className="w-4 h-4" />
                      Most loved
                    </span>
                  )}
                </div>
                <p className="font-sora text-neutral-400">{tier.tagline}</p>
                <div className="space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <p className="font-sora text-sm text-neutral-300">{feature}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push(tier.href)}
                  className={`w-full py-3 rounded-2xl font-tanker text-lg flex items-center justify-center gap-2 ${tier.highlight ? 'bg-orange-400 text-black hover:bg-orange-300' : 'border border-neutral-800 text-white hover:border-orange-400'}`}
                >
                  {tier.cta}
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-sora text-xs uppercase tracking-[0.4em] text-orange-400">Spotlight</p>
              <h3 className="font-tanker text-4xl md:text-5xl">Content made for climbers</h3>
            </div>
            <button
              onClick={() => router.push('/stories')}
              className="font-sora text-sm text-orange-400 flex items-center gap-2"
            >
              View archive
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-6 min-w-full">
              {spotlightArticles.map((article) => (
                <div
                  key={article.title}
                  className="min-w-[280px] md:min-w-[320px] bg-neutral-950 border border-neutral-800 rounded-3xl p-6 flex flex-col gap-4"
                >
                  <span className="text-xs font-sora uppercase tracking-[0.4em] text-neutral-500">{article.tag}</span>
                  <h4 className="font-tanker text-2xl text-white">{article.title}</h4>
                  <p className="font-sora text-sm text-neutral-400 flex-1">{article.summary}</p>
                  <div className="flex items-center justify-between text-sm font-sora text-neutral-500">
                    <span>{article.readingTime}</span>
                    <button
                      onClick={() => router.push(article.href)}
                      className="text-orange-400 flex items-center gap-1"
                    >
                      Read
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-black border-y border-orange-500/30 py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="font-sora text-xs uppercase tracking-[0.4em] text-orange-500">Early access countdown</p>
            <h3 className="font-tanker text-4xl md:text-5xl">{remainingSlots} lifetime spots left</h3>
            <p className="font-sora text-neutral-800 dark:text-neutral-200 text-lg max-w-lg">
              First 1000 climbers lock in premium forever. We keep the list transparent so you know exactly how close you are.
            </p>
            <div className="flex gap-4">
              {Object.entries(countdown).map(([label, value]) => (
                <div key={label} className="flex-1 bg-black/40 border border-neutral-800 rounded-2xl p-4 text-center">
                  <p className="font-tanker text-3xl">{value}</p>
                  <span className="font-sora text-xs uppercase tracking-[0.3em] text-neutral-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <p className="font-sora text-sm text-neutral-200">{claimedSlots} climbers already secured access</p>
            </div>
            <div className="h-3 rounded-full bg-black/30 overflow-hidden">
              <div className="h-full bg-orange-400" style={{ width: `${remainingPercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm font-sora text-neutral-300">
              <span>{claimedSlots} claimed</span>
              <span>{totalLifetimeSlots} total</span>
            </div>
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full bg-black text-white font-tanker text-xl py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-900"
            >
              Reserve lifetime premium
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-orange-500 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-tanker text-2xl text-black/80">
              FIND YOUR GRIP • COMMUNITY DRIVEN • YOUR DATA, YOUR SHOES • 
            </span>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
