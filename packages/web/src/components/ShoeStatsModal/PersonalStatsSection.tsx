'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Shield } from 'lucide-react';
import type { DefaultStats } from './utils';

interface PersonalStatsSectionProps {
  comfortScore?: number;
  performanceRating?: number;
  durabilityRating?: number;
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
      <h3 className="text-lg font-semibold text-white mb-3">
        Personal Rank
        {hasDefaultScore && (
          <span className="text-sm font-normal text-white/70 ml-2">
            (Default: {((defaultStats.comfort + defaultStats.performance + defaultStats.durability) / 3).toFixed(1)})
          </span>
        )}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white">Comfort</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {(comfortScore || defaultStats.comfort).toFixed(1)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white">Performance</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {(performanceRating || defaultStats.performance).toFixed(1)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white">Durability</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {(durabilityRating || defaultStats.durability).toFixed(1)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
