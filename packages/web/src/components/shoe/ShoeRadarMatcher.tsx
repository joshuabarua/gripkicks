"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ShoeImage from '@/components/ShoeImage';
import { useShoeScoring } from '@/hooks/useShoeScoring';
import { useSubscription } from '@/hooks/useSubscription';
import { useFootProfileStore } from '@/stores/footProfileStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, User, Zap, Shield } from 'lucide-react';

interface ShoeMetrics {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  stability: number;
  versatility: number;
}

interface QuadrantInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  accentClass: string;
}

type QuadrantKey = 'daily-drivers' | 'versatile-performers' | 'aggressive-comfort' | 'competition';

const quadrants: Record<QuadrantKey, QuadrantInfo> = {
  'daily-drivers': {
    name: 'Daily Drivers',
    description: 'Comfortable & versatile all-rounders',
    icon: <Heart className="w-4 h-4" />,
    borderColor: 'border-green-500/40',
    bgColor: 'bg-green-500/5',
    accentClass: 'text-green-400/80',
  },
  'versatile-performers': {
    name: 'Versatile Performers',
    description: 'High performance with range',
    icon: <Zap className="w-4 h-4" />,
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/5',
    accentClass: 'text-blue-400/80',
  },
  'aggressive-comfort': {
    name: 'Aggressive Comfort',
    description: 'Downturned but padded',
    icon: <Shield className="w-4 h-4" />,
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-500/5',
    accentClass: 'text-orange-400/80',
  },
  competition: {
    name: 'Competition',
    description: 'Max performance, max aggression',
    icon: <Target className="w-4 h-4" />,
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/5',
    accentClass: 'text-red-400/80',
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getQuadrantKey(metrics: ShoeMetrics): QuadrantKey {
  const isPerformanceLed = metrics.performance >= metrics.comfort;
  const isAggressiveLed = metrics.aggressiveness > metrics.versatility;

  if (!isPerformanceLed && !isAggressiveLed) return 'daily-drivers';
  if (isPerformanceLed && !isAggressiveLed) return 'versatile-performers';
  if (!isPerformanceLed && isAggressiveLed) return 'aggressive-comfort';
  return 'competition';
}

export function ShoeRadarMatcher() {
  const { profile: footProfile } = useFootProfileStore();
  const { isPremium, isFounder, loading: subscriptionLoading } = useSubscription();
  const { scoredShoes, isLoading } = useShoeScoring();

  const recommendationLimit = isPremium || isFounder ? 5 : 1;

  const recommendedShoes = useMemo(() => {
    if (!scoredShoes || scoredShoes.length === 0) return [];

    return scoredShoes.slice(0, recommendationLimit).map((scored) => {
      const performanceWeight = scored.metrics.performance + scored.metrics.aggressiveness;
      const comfortWeight = scored.metrics.comfort + scored.metrics.versatility;
      const versatilityWeight = scored.metrics.versatility + scored.metrics.comfort;
      const aggressiveWeight = scored.metrics.aggressiveness + scored.metrics.performance;
      const horizontal = performanceWeight / Math.max(performanceWeight + comfortWeight, 0.001);
      const vertical = 1 - aggressiveWeight / Math.max(aggressiveWeight + versatilityWeight, 0.001);

      return {
        shoe: scored.shoe,
        score: scored.totalScore,
        metrics: scored.metrics,
        x: clamp(horizontal, 0.08, 0.92),
        y: clamp(vertical, 0.08, 0.92),
        quadrantKey: getQuadrantKey(scored.metrics),
      };
    });
  }, [recommendationLimit, scoredShoes]);

  const quadrantCounts = useMemo(() => {
    return recommendedShoes.reduce(
      (counts, shoe) => {
        counts[shoe.quadrantKey] += 1;
        return counts;
      },
      {
        'daily-drivers': 0,
        'versatile-performers': 0,
        'aggressive-comfort': 0,
        competition: 0,
      } as Record<QuadrantKey, number>,
    );
  }, [recommendedShoes]);

  if (isLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading shoe radar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Shoe Radar</h1>
        <p className="text-neutral-400">
          Your best matches are auto-ranked into fixed categories based on your scoring profile.
        </p>
      </div>

      <div className="mb-6 flex flex-col items-center gap-3">
        <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5">
          Showing top {recommendationLimit} {recommendationLimit === 1 ? 'shoe' : 'shoes'}
        </Badge>
        {!isPremium && !isFounder && (
          <p className="text-sm text-neutral-500 text-center">
            Free plan shows your best overall match. Premium unlocks the top 5 recommendations.
          </p>
        )}
      </div>

      <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden" style={{ aspectRatio: '1 / 1', maxHeight: '680px' }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider">
          More Versatile
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider">
          More Aggressive
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
          <span style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} className="uppercase tracking-wider">More Comfortable</span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
          <span style={{ writingMode: 'vertical-lr' }} className="uppercase tracking-wider">More Performance</span>
        </div>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800" />
        </div>

        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
          <div className={`${quadrants['daily-drivers'].bgColor} ${quadrants['daily-drivers'].borderColor} border-r border-b p-3`}>
            <QuadrantHeader quadrant={quadrants['daily-drivers']} count={quadrantCounts['daily-drivers']} />
          </div>
          <div className={`${quadrants['versatile-performers'].bgColor} ${quadrants['versatile-performers'].borderColor} border-b p-3`}>
            <QuadrantHeader quadrant={quadrants['versatile-performers']} count={quadrantCounts['versatile-performers']} />
          </div>
          <div className={`${quadrants['aggressive-comfort'].bgColor} ${quadrants['aggressive-comfort'].borderColor} border-r p-3`}>
            <QuadrantHeader quadrant={quadrants['aggressive-comfort']} count={quadrantCounts['aggressive-comfort']} />
          </div>
          <div className={`${quadrants.competition.bgColor} ${quadrants.competition.borderColor} p-3`}>
            <QuadrantHeader quadrant={quadrants.competition} count={quadrantCounts.competition} />
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-2 h-2 bg-orange-500 rounded-full" />

        {recommendedShoes.map((pos, index) => (
          <motion.div
            key={pos.shoe._id}
            className="absolute z-30"
            style={{
              left: `${pos.x * 100}%`,
              top: `${pos.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden shadow-lg">
                <ShoeImage
                  brand={pos.shoe.brand}
                  shoeName={pos.shoe.name}
                  imageUrl={pos.shoe.imageUrl ?? undefined}
                  className="p-0.5"
                  transformation={[{ height: 56, width: 56, crop: 'at_max', format: 'png' }]}
                />
              </div>
              <div className="absolute -top-1 -left-1 min-w-5 h-5 rounded-full bg-orange-500 text-black text-[10px] font-bold flex items-center justify-center px-1.5">
                {index + 1}
              </div>
              <div className="absolute -bottom-1 -right-1 min-w-6 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center px-1.5">
                <span className="text-[8px] font-bold text-orange-400">{Math.round((pos.score / 5) * 100)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendedShoes.map((shoe, index) => {
          const quadrant = quadrants[shoe.quadrantKey];
          return (
            <Card key={shoe.shoe._id} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0">
                    <ShoeImage
                      brand={shoe.shoe.brand}
                      shoeName={shoe.shoe.name}
                      imageUrl={shoe.shoe.imageUrl ?? undefined}
                      className="p-1"
                      transformation={[{ height: 80, width: 80, crop: 'at_max', format: 'png' }]}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Rank #{index + 1}</p>
                        <h3 className="text-lg font-bold text-white truncate">{shoe.shoe.name}</h3>
                        <p className="text-neutral-400 text-sm">{shoe.shoe.brand}</p>
                      </div>
                      <Badge className={`${quadrant.bgColor} ${quadrant.borderColor} border ${quadrant.accentClass}`}>
                        {quadrant.name}
                      </Badge>
                    </div>

                    <p className="text-sm text-neutral-500">{quadrant.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MetricBar label="Comfort" value={shoe.metrics.comfort} />
                      <MetricBar label="Performance" value={shoe.metrics.performance} />
                      <MetricBar label="Versatility" value={shoe.metrics.versatility} />
                      <MetricBar label="Aggression" value={shoe.metrics.aggressiveness} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!recommendedShoes.length && !isLoading && (
        <div className="mt-6 p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
          <p className="text-neutral-400 text-sm">
            No shoe recommendations are available yet.
          </p>
        </div>
      )}

      {!footProfile?.shape && !isLoading && (
        <div className="mt-6 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
          <User className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">
            Complete your foot profile for stronger recommendation accuracy.
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(quadrants) as QuadrantKey[]).map((key) => {
          const quadrant = quadrants[key];
          return (
            <div key={key} className={`p-3 rounded-lg border ${quadrant.borderColor} ${quadrant.bgColor}`}>
              <div className={`flex items-center gap-1.5 mb-1 ${quadrant.accentClass}`}>
                {quadrant.icon}
                <span className="text-xs font-medium text-white">{quadrant.name}</span>
              </div>
              <p className="text-[11px] text-neutral-500">{quadrant.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuadrantHeader({ quadrant, count }: { quadrant: QuadrantInfo; count: number }) {
  return (
    <div className={`flex items-center gap-1.5 ${quadrant.accentClass}`}>
      {quadrant.icon}
      <span className="text-xs font-medium">{quadrant.name}</span>
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-800/50 text-neutral-400 ml-auto">
        {count}
      </Badge>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs text-white font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
