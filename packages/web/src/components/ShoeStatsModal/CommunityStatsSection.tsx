'use client';

import { motion } from 'framer-motion';
import { getStatBarColor } from './utils';

interface CommunityStatsSectionProps {
  showCommunityAverages: boolean;
  totalRatings?: number | undefined;
  comfortScore: number;
  performanceRating: number;
  durabilityRating: number;
  popularityCount?: number | undefined;
  totalShoesInDatabase?: number | undefined;
}

export default function CommunityStatsSection({
  showCommunityAverages,
  totalRatings,
  comfortScore,
  performanceRating,
  durabilityRating,
  popularityCount,
  totalShoesInDatabase
}: CommunityStatsSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="font-ball-pill text-lg text-white mb-3">Community Rank</h3>
      {showCommunityAverages ? (
        <>
          <p className="text-xs text-neutral-500 font-mono tracking-wider mb-3">Based on {totalRatings} user ratings</p>
          {popularityCount && popularityCount > 100 && (
            <div className="mb-3 p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400 font-mono">Popularity</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-ball-pill">
                    {popularityCount} climbers
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    ({totalShoesInDatabase ? ((popularityCount / totalShoesInDatabase) * 100).toFixed(1) : '0'}%)
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-neutral-400 font-mono">Comfort</span>
                <span className="text-sm font-bold text-white font-ball-pill">{comfortScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(comfortScore / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={`h-full rounded-full ${getStatBarColor(comfortScore, true)}`}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-neutral-400 font-mono">Performance</span>
                <span className="text-sm font-bold text-white font-ball-pill">{performanceRating.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(performanceRating / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`h-full rounded-full ${getStatBarColor(performanceRating, true)}`}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-neutral-400 font-mono">Durability</span>
                <span className="text-sm font-bold text-white font-ball-pill">{durabilityRating.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(durabilityRating / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className={`h-full rounded-full ${getStatBarColor(durabilityRating, true)}`}
                />
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-neutral-900/90 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-neutral-800">
              <p className="text-white text-sm font-mono">{3 - (totalRatings || 0)} more member rankings required</p>
              <p className="text-neutral-500 text-xs font-mono mt-1">for average shoe score</p>
            </div>
          </div>
          <div className="blur-sm opacity-30 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-500">Comfort</span>
                <span className="text-sm font-bold text-neutral-500">?/10</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-full w-1/2 bg-neutral-700 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-500">Performance</span>
                <span className="text-sm font-bold text-neutral-500">?/10</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-full w-2/3 bg-neutral-700 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-neutral-500">Durability</span>
                <span className="text-sm font-bold text-neutral-500">?/10</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-full w-1/3 bg-neutral-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
