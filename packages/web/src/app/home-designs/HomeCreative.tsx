"use client";

import React from "react";
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { ArrowUpRight, Footprints, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { FullPageLoading } from '@/components/ui/loading';

const Scene = dynamic(() => import("@/components/3d/Scene"), { 
  ssr: false,
  loading: () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
});

export default function HomeCreative() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <FullPageLoading />;
  }

  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name || 'Climber';

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
              <Zap className="w-8 h-8 text-orange-500" />
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
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <Footprints className="w-6 h-6 text-orange-500" />
              </div>
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
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
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
