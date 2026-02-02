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
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Your Personal Stats</h3>
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white/90">Comfort</span>
            {!comfortScore && (
              <span className="text-xs text-white/90">(avg)</span>
            )}
            {comfortScore && (
              <span className="text-xs text-blue-400">(your rating)</span>
            )}
          </div>
          <div className={`text-3xl font-bold ${comfortScore ? 'text-white' : 'text-gray-400'}`}>
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
            <span className="text-sm text-white/90">Performance</span>
            {!performanceRating && (
              <span className="text-xs text-white/90">(avg)</span>
            )}
            {performanceRating && (
              <span className="text-xs text-blue-400">(your rating)</span>
            )}
          </div>
          <div className={`text-3xl font-bold ${performanceRating ? 'text-white' : 'text-gray-400'}`}>
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
            <span className="text-sm text-white/90">Durability</span>
            {!durabilityRating && (
              <span className="text-xs text-white/90">(avg)</span>
            )}
            {durabilityRating && (
              <span className="text-xs text-blue-400">(your rating)</span>
            )}
          </div>
          <div className={`text-3xl font-bold ${durabilityRating ? 'text-white' : 'text-gray-400'}`}>
            {(durabilityRating || defaultStats.durability).toFixed(1)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
