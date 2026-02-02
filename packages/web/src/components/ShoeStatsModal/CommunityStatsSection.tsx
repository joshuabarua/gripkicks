'use client';

import { motion } from 'framer-motion';
import { getStatBarColor } from './utils';

interface CommunityStatsSectionProps {
  showCommunityAverages: boolean;
  totalRatings?: number;
  comfortScore: number;
  performanceRating: number;
  durabilityRating: number;
  popularityCount?: number;
  totalShoesInDatabase?: number;
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
      <h3 className="text-lg font-semibold text-white mb-3">Community Rank</h3>
      {showCommunityAverages ? (
        <>
          <p className="text-sm text-green-400 mb-3">Based on {totalRatings} user ratings</p>
          {popularityCount && popularityCount > 100 && (
            <div className="mb-3 p-2 bg-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">Popularity</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {popularityCount} climbers
                  </span>
                  <span className="text-xs text-white/70">
                    ({totalShoesInDatabase ? ((popularityCount / totalShoesInDatabase) * 100).toFixed(1) : '0'}% of all shoes)
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
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">Comfort</span>
                <span className="text-sm font-bold text-white">{comfortScore.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(comfortScore / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={`h-full ${getStatBarColor(comfortScore, true)}`}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">Performance</span>
                <span className="text-sm font-bold text-white">{performanceRating.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(performanceRating / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`h-full ${getStatBarColor(performanceRating, true)}`}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">Durability</span>
                <span className="text-sm font-bold text-white">{durabilityRating.toFixed(1)}/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(durabilityRating / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className={`h-full ${getStatBarColor(durabilityRating, true)}`}
                />
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <p className="text-white/90 text-sm font-medium">{3 - (totalRatings || 0)} more member rankings required</p>
              <p className="text-white/60 text-xs mt-1">for average shoe score</p>
            </div>
          </div>
          <div className="blur-sm opacity-50 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">Comfort</span>
                <span className="text-sm font-bold text-white">?/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-gray-500 to-gray-600" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">Performance</span>
                <span className="text-sm font-bold text-white">?/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-gray-500 to-gray-600" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white">Durability</span>
                <span className="text-sm font-bold text-white">?/10</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-gray-500 to-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
