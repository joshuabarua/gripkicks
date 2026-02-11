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
            <h1 className="text-3xl font-bold text-white mb-2">Shoe Matcher</h1>
            <p className="text-neutral-400">
              Find your perfect climbing shoe based on your style and preferences
            </p>
          </div>
          
          <div className="space-y-6 text-left">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Technical Analysis</h3>
                <p className="text-sm text-neutral-400">
                  Compare shoes across technical vs endurance characteristics
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Style Matching</h3>
                <p className="text-sm text-neutral-400">
                  Bouldering vs sport climbing specialization analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Smart Recommendations</h3>
                <p className="text-sm text-neutral-400">
                  Visual grid positioning based on shoe specifications
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
