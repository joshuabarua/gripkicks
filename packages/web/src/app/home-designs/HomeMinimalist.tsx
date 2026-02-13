"use client";

import React from "react";
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { FullPageLoading } from '@/components/ui/loading';

const Scene = dynamic(() => import("@/components/3d/Scene"), { 
  ssr: false,
  loading: () => <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
});

export default function HomeMinimalist() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <FullPageLoading />;
  }

  const isAuthenticated = !!session?.user;
  const userName = session?.user?.name?.toUpperCase() || 'CLIMBER';

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section - Preserved */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Scene />
        </div>
        
        <motion.div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-orange-500/60" />
        </motion.div>
      </section>

      {/* Content Section - Minimalist Design */}
      <section className="min-h-screen bg-white text-black">
        <div className="max-w-7xl mx-auto px-8 py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-24 items-start"
          >
            {/* Left Column - Typography */}
            <div className="space-y-12">
              {isAuthenticated && (
                <motion.p 
                  className="text-orange-500 text-sm tracking-[0.3em] uppercase"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Welcome back, {userName}
                </motion.p>
              )}
              
              <h2 className="font-tanker text-6xl md:text-7xl lg:text-8xl leading-[0.9]">
                {isAuthenticated ? (
                  <>
                    <span className="block">Your</span>
                    <span className="block text-orange-500">Journey</span>
                  </>
                ) : (
                  <>
                    <span className="block">Find</span>
                    <span className="block">Your</span>
                    <span className="block text-orange-500">Grip</span>
                  </>
                )}
              </h2>
              
              <p className="font-sora text-neutral-600 text-lg max-w-md leading-relaxed">
                {isAuthenticated
                  ? "Your stash is waiting. See what's next for your feet."
                  : "Tell us your foot shape and climbing style — we'll point you to shoes that actually fit."
                }
              </p>
              
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => router.push(isAuthenticated ? '/dashboard' : '/auth/signup')}
                  className="bg-black text-white hover:bg-neutral-800 rounded-none px-8 py-6 text-sm tracking-wider"
                >
                  {isAuthenticated ? 'Dashboard' : 'Get Started'}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/selector')}
                  className="border-black text-black hover:bg-black hover:text-white rounded-none px-8 py-6 text-sm tracking-wider"
                >
                  3D Selector
                </Button>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="space-y-0 border-l border-neutral-200">
              {[
                { num: '01', title: 'Foot Lab', desc: 'Map your foot shape and volume so we know what fits' },
                { num: '02', title: 'Smart Match', desc: 'Recs based on real climber ratings and your feet' },
                { num: '03', title: 'Track & Rate', desc: 'Log comfort and performance as you break shoes in' },
              ].map((item, i) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group pl-8 py-8 border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-default"
                >
                  <span className="text-orange-500 text-xs tracking-[0.2em] font-medium">{item.num}</span>
                  <h3 className="font-tanker text-2xl mt-2 mb-2">{item.title}</h3>
                  <p className="font-sora text-neutral-500 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-8 py-16">
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: '100%', label: 'Your Data' },
                { value: '0%', label: 'Data Sold' },
                { value: '1 of 1', label: 'Climber Built' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="font-tanker text-4xl md:text-5xl text-orange-500">{stat.value}</div>
                  <div className="font-sora text-xs text-neutral-500 tracking-[0.2em] uppercase mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
