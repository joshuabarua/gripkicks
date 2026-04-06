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
  const hasDefaultScore = !comfortScore && !performanceRating && !durabilityRating;

  return (
    <div className="mb-6">
      <h3 className="font-tanker text-lg text-white mb-3">
        Personal Rank
        {hasDefaultScore && (
          <span className="text-sm font-normal text-neutral-500 font-sora ml-2">
            (Default: {((defaultStats.comfort + defaultStats.performance + defaultStats.durability) / 3).toFixed(1)})
          </span>
        )}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-neutral-400 font-sora">Comfort</span>
          </div>
          <div className="text-2xl font-tanker text-white">
            {(comfortScore || defaultStats.comfort).toFixed(1)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-neutral-400 font-sora">Performance</span>
          </div>
          <div className="text-2xl font-tanker text-white">
            {(performanceRating || defaultStats.performance).toFixed(1)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-neutral-400 font-sora">Durability</span>
          </div>
          <div className="text-2xl font-tanker text-white">
            {(durabilityRating || defaultStats.durability).toFixed(1)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
