'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Shield } from 'lucide-react';
import type { DefaultStats } from './utils';

interface PersonalStatsSectionProps {
  comfortScore?: number | undefined;
  performanceRating?: number | undefined;
  durabilityRating?: number | undefined;
  defaultStats: DefaultStats;
}

export default function PersonalStatsSection({
  comfortScore,
  performanceRating,
  durabilityRating,
  defaultStats
}: PersonalStatsSectionProps) {
  const hasPersonalScores =
    comfortScore !== undefined ||
    performanceRating !== undefined ||
    durabilityRating !== undefined;

  return (
    <div className="mb-6">
      <h3 className="font-ball-pill text-lg text-white mb-3">
        Your Ratings
        {!hasPersonalScores && (
          <span className="text-sm font-normal text-neutral-500 font-sora ml-2">
            Catalog baseline
          </span>
        )}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-charcoal rounded-lg p-4 border border-white/[0.06] monolith-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-brand-red" />
            <span className="text-xs text-neutral-400 font-sora">Comfort</span>
          </div>
          <div className="text-2xl font-ball-pill text-white">
            {(comfortScore ?? defaultStats.comfort).toFixed(1)}
          </div>
          <span className="font-sora text-[9px] uppercase tracking-wider text-neutral-600">
            {comfortScore !== undefined ? 'Personal' : 'Baseline'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-brand-charcoal rounded-lg p-4 border border-white/[0.06] monolith-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-brand-red" />
            <span className="text-xs text-neutral-400 font-sora">Performance</span>
          </div>
          <div className="text-2xl font-ball-pill text-white">
            {(performanceRating ?? defaultStats.performance).toFixed(1)}
          </div>
          <span className="font-sora text-[9px] uppercase tracking-wider text-neutral-600">
            {performanceRating !== undefined ? 'Personal' : 'Baseline'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-brand-charcoal rounded-lg p-4 border border-white/[0.06] monolith-card"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-brand-red" />
            <span className="text-xs text-neutral-400 font-sora">Durability</span>
          </div>
          <div className="text-2xl font-ball-pill text-white">
            {(durabilityRating ?? defaultStats.durability).toFixed(1)}
          </div>
          <span className="font-sora text-[9px] uppercase tracking-wider text-neutral-600">
            {durabilityRating !== undefined ? 'Personal' : 'Baseline'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
