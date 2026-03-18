"use client";

import { useSession } from '@/lib/auth';
import { FullPageLoading } from '@/components/ui/loading';
import { ShoeRadarMatcher } from '@/components/shoe/ShoeRadarMatcher';
import { motion } from 'framer-motion';
import { Target, Zap, Activity, Clock } from 'lucide-react';

export default function ShoeMatcherPage() {
  const { data: session, isPending: sessionLoading } = useSession();

  if (sessionLoading) {
    return <FullPageLoading text="Loading Matcher" />;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-orange-500" />
            </div>
            <p className="font-mono text-xs text-orange-500 mb-2 tracking-[0.3em]">[MATCHER]</p>
            <h1 className="font-tanker text-5xl text-white mb-2">SHOE MATCHER</h1>
            <p className="font-sora text-neutral-400">
              See where every shoe lands based on how it actually performs
            </p>
          </div>
          
          <div className="space-y-6 text-left">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-sora font-semibold text-white mb-1">See How Shoes Compare</h3>
                <p className="text-sm text-neutral-400">
                  Every shoe plotted on a grid by comfort, performance, and aggressiveness
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-sora font-semibold text-white mb-1">Find Your Style</h3>
                <p className="text-sm text-neutral-400">
                  Bouldering, sport, all-around — see what fits your climbing
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-sora font-semibold text-white mb-1">Visual Grid</h3>
                <p className="text-sm text-neutral-400">
                  Shoe images placed on a quadrant so you can spot the right zone fast
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-sm text-neutral-400 text-center">
              Please sign in to access the Shoe Matcher tool
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ShoeRadarMatcher />
    </div>
  );
}
