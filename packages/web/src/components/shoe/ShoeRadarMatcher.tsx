"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ShoeImage from '@/components/ShoeImage';
import { useShoeScoring } from '@/hooks/useShoeScoring';
import { useFootProfileStore } from '@/stores/footProfileStore';
import { Badge } from '@/components/ui/badge';
import { Heart, Target, User, Zap, Shield } from 'lucide-react';
import { MatchScoreTooltip } from './MatchScoreTooltip';
import { RealityCheck } from './RealityCheck';
import { SoleMateSignals } from './SoleMateSignals';
import { DataContributionNudge } from './DataContributionNudge';

interface ShoeMetrics {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  stability: number;
  versatility: number;
}

interface RadarEntryInput {
  shoe: {
    _id: string;
    brand: string;
    name: string;
    imageUrl?: string;
    brandAggressiveness?: number;
    brandStiffness?: number;
  };
  score: number;
  metrics: ShoeMetrics;
  realityDelta: {
    aggressiveness: number;
    stiffness: number;
  };
  breakdown: {
    footTypeCompatibility: number;
    volumeCompatibility: number;
    userPreferenceMatch: number;
    communityApproval: number;
    overallRating: number;
    learnedPreferenceBonus: number;
    soleMateMatch: number;
  };
}

interface PositionedRadarEntry extends RadarEntryInput {
  baseX: number;
  baseY: number;
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

function buildVisibleRadarPositions(
  entries: RadarEntryInput[],
) {
  const groupedEntries = new Map<string, PositionedRadarEntry[]>();

  entries.forEach((entry) => {
    const performanceWeight = entry.metrics.performance + entry.metrics.aggressiveness;
    const comfortWeight = entry.metrics.comfort + entry.metrics.versatility;
    const versatilityWeight = entry.metrics.versatility + entry.metrics.comfort;
    const aggressiveWeight = entry.metrics.aggressiveness + entry.metrics.performance;
    const baseX = clamp(
      performanceWeight / Math.max(performanceWeight + comfortWeight, 0.001),
      0.08,
      0.92,
    );
    const baseY = clamp(
      1 - aggressiveWeight / Math.max(aggressiveWeight + versatilityWeight, 0.001),
      0.08,
      0.92,
    );
    const groupKey = `${baseX.toFixed(3)}:${baseY.toFixed(3)}`;
    const group = groupedEntries.get(groupKey) ?? [];

    group.push({ ...entry, baseX, baseY });
    groupedEntries.set(groupKey, group);
  });

  return Array.from(groupedEntries.values()).flatMap((group) => {
    if (group.length === 1) {
      const onlyEntry = group[0];
      if (!onlyEntry) return [];
      const quadrantKey = getQuadrantKeyFromPosition(onlyEntry.baseX, onlyEntry.baseY);
      const descriptors = getAxisDescriptor(onlyEntry.metrics);

      return [{
        ...onlyEntry,
        x: onlyEntry.baseX,
        y: onlyEntry.baseY,
        quadrantKey,
        descriptors,
        topTraits: getTopTraits(onlyEntry.metrics),
      }];
    }

    return group.map((entry, index) => {
      const angle = (Math.PI * 2 * index) / group.length;
      const radius = 0.028 + Math.floor(index / 4) * 0.012;
      const x = clamp(entry.baseX + Math.cos(angle) * radius, 0.08, 0.92);
      const y = clamp(entry.baseY + Math.sin(angle) * radius, 0.08, 0.92);
      const quadrantKey = getQuadrantKeyFromPosition(x, y);
      const descriptors = getAxisDescriptor(entry.metrics);

      return {
        ...entry,
        x,
        y,
        quadrantKey,
        descriptors,
        topTraits: getTopTraits(entry.metrics),
      };
    });
  });
}

function getQuadrantKeyFromPosition(x: number, y: number): QuadrantKey {
  const isPerformanceLed = x >= 0.5;
  const isAggressiveLed = y >= 0.5;

  if (!isPerformanceLed && !isAggressiveLed) return 'daily-drivers';
  if (isPerformanceLed && !isAggressiveLed) return 'versatile-performers';
  if (!isPerformanceLed && isAggressiveLed) return 'aggressive-comfort';
  return 'competition';
}

function getAxisDescriptor(metrics: ShoeMetrics) {
  const horizontalDelta = metrics.performance - metrics.comfort;
  const verticalDelta = metrics.aggressiveness - metrics.versatility;

  const horizontalLabel =
    horizontalDelta > 0.55
      ? 'Performance-first'
      : horizontalDelta < -0.55
        ? 'Comfort-first'
        : 'Balanced feel';

  const verticalLabel =
    verticalDelta > 0.55
      ? 'Aggression-led'
      : verticalDelta < -0.55
        ? 'Versatility-led'
        : 'All-round profile';

  return {
    horizontalLabel,
    verticalLabel,
  };
}

function getTopTraits(metrics: ShoeMetrics) {
  return [
    { key: 'comfort', label: 'Comfort', value: metrics.comfort },
    { key: 'performance', label: 'Performance', value: metrics.performance },
    { key: 'versatility', label: 'Versatility', value: metrics.versatility },
    { key: 'aggressiveness', label: 'Aggressive', value: metrics.aggressiveness },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

export function ShoeRadarMatcher() {
  const { profile: footProfile } = useFootProfileStore();
  const { scoredShoes, isLoading, stashCount, ratedCount } = useShoeScoring();

  const recommendedShoes = useMemo(() => {
    if (!scoredShoes || scoredShoes.length === 0) return [];
    return buildVisibleRadarPositions(
      scoredShoes.map((scored) => ({
        shoe: scored.shoe,
        score: scored.totalScore,
        metrics: scored.metrics,
        realityDelta: scored.realityDelta,
        breakdown: scored.breakdown,
      })),
    );
  }, [scoredShoes]);

  const leadShoe = recommendedShoes[0];
  const leadQuadrant = leadShoe ? quadrants[leadShoe.quadrantKey] : null;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="font-sora text-neutral-500 text-sm">Loading shoe radar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-8 sm:px-6 lg:px-8">

      {/* Glowing Top Match hero */}
      {leadShoe && leadQuadrant && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-orange-500/40 bg-neutral-950 p-6 sm:p-8 mb-6 shadow-[0_0_60px_rgba(249,115,22,0.08)]"
        >
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex items-start gap-5 flex-1 min-w-0">
              <div className="w-24 h-24 bg-neutral-900 rounded-2xl overflow-hidden flex-shrink-0 border border-orange-500/20">
                <ShoeImage
                  brand={leadShoe.shoe.brand}
                  shoeName={leadShoe.shoe.name}
                  className="p-1"
                  transformation={[{ height: 96, width: 96, crop: 'at_max', format: 'png' }]}
                  {...(leadShoe.shoe.imageUrl ? { imageUrl: leadShoe.shoe.imageUrl } : {})}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-orange-500">Your top match</p>
                  <Badge className={`${leadQuadrant.bgColor} ${leadQuadrant.borderColor} border ${leadQuadrant.accentClass} font-sora`}>
                    {leadQuadrant.name}
                  </Badge>
                </div>
                <h2 className="font-tanker text-3xl md:text-4xl text-white leading-none mb-1">{leadShoe.shoe.name}</h2>
                <p className="font-sora text-neutral-400 text-sm mb-4">{leadShoe.shoe.brand}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <MatchScoreTooltip score={leadShoe.score} breakdown={leadShoe.breakdown} />
                  <Badge variant="secondary" className="bg-neutral-900 border border-neutral-800 text-neutral-300 font-sora">
                    {leadShoe.descriptors.horizontalLabel}
                  </Badge>
                  <Badge variant="secondary" className="bg-neutral-900 border border-neutral-800 text-neutral-300 font-sora">
                    {leadShoe.descriptors.verticalLabel}
                  </Badge>
                  {footProfile?.shape && (
                    <Badge variant="secondary" className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-sora">
                      {footProfile.shape} · {footProfile.volume}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:min-w-[300px]">
              {leadShoe.topTraits.map((trait) => (
                <div key={trait.key} className="rounded-2xl border border-neutral-800 bg-black/30 p-4">
                  <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">{trait.label}</p>
                  <p className="font-tanker text-2xl text-white">{trait.value.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <RealityCheck
              label="Aggressiveness"
              communityReality={leadShoe.metrics.aggressiveness}
              description="How aggressive the shoe feels compared to official marketing specs."
              {...(leadShoe.shoe.brandAggressiveness !== undefined
                ? { brandClaim: leadShoe.shoe.brandAggressiveness }
                : {})}
            />
            <RealityCheck
              label="Stiffness"
              communityReality={leadShoe.metrics.stability}
              description="Community consensus on support and stiffness compared to the brand's technical claims."
              {...(leadShoe.shoe.brandStiffness !== undefined
                ? { brandClaim: leadShoe.shoe.brandStiffness }
                : {})}
            />
          </div>
          <SoleMateSignals shoeId={leadShoe.shoe._id} soleMateCount={leadShoe.breakdown.soleMateMatch} />
        </motion.div>
      )}

      {/* Radar Grid */}
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden w-full mb-8" style={{ aspectRatio: '16 / 10', minHeight: '560px' }}>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider font-sora">
          More Versatile
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider font-sora">
          More Aggressive
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
          <span style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }} className="uppercase tracking-wider font-sora">More Comfortable</span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
          <span style={{ writingMode: 'vertical-lr' }} className="uppercase tracking-wider font-sora">More Performance</span>
        </div>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800" />
        </div>

        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
          <div className={`${quadrants['daily-drivers'].bgColor} ${quadrants['daily-drivers'].borderColor} border-r border-b p-3 flex items-center justify-center`}>
            <QuadrantHeader quadrant={quadrants['daily-drivers']} count={quadrantCounts['daily-drivers']} />
          </div>
          <div className={`${quadrants['versatile-performers'].bgColor} ${quadrants['versatile-performers'].borderColor} border-b p-3 flex items-center justify-center`}>
            <QuadrantHeader quadrant={quadrants['versatile-performers']} count={quadrantCounts['versatile-performers']} />
          </div>
          <div className={`${quadrants['aggressive-comfort'].bgColor} ${quadrants['aggressive-comfort'].borderColor} border-r p-3 flex items-center justify-center`}>
            <QuadrantHeader quadrant={quadrants['aggressive-comfort']} count={quadrantCounts['aggressive-comfort']} />
          </div>
          <div className={`${quadrants.competition.bgColor} ${quadrants.competition.borderColor} p-3 flex items-center justify-center`}>
            <QuadrantHeader quadrant={quadrants.competition} count={quadrantCounts.competition} />
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-2 h-2 bg-orange-500 rounded-full" />

        {recommendedShoes.map((pos, index) => (
          <motion.div
            key={pos.shoe._id}
            className="absolute z-30"
            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, transform: 'translate(-50%, -50%)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="relative">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shadow-lg ${index === 0 ? 'border-2 border-orange-500/70 bg-neutral-900 shadow-orange-500/20' : 'border border-neutral-700 bg-neutral-900'}`}>
                <ShoeImage
                  brand={pos.shoe.brand}
                  shoeName={pos.shoe.name}
                  className="p-0.5"
                  transformation={[{ height: 56, width: 56, crop: 'at_max', format: 'png' }]}
                  {...(pos.shoe.imageUrl ? { imageUrl: pos.shoe.imageUrl } : {})}
                />
              </div>
              <div className={`absolute -top-1 -left-1 min-w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1.5 ${index === 0 ? 'bg-orange-500 text-black' : 'bg-neutral-700 text-white'}`}>
                {index + 1}
              </div>
              <div className="absolute -bottom-1 -right-1 min-w-6 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center px-1.5">
                <span className="text-[8px] font-bold text-orange-400">{Math.round((pos.score / 5) * 100)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Unified ranked list — shows shoes #2+ */}
      {recommendedShoes.length > 1 && (
        <div>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-tanker text-3xl md:text-4xl text-white leading-none">All Matches</h2>
            <p className="font-sora text-xs text-neutral-500 uppercase tracking-[0.2em]">{recommendedShoes.length - 1} more</p>
          </div>
          <div className="space-y-3">
            {recommendedShoes.slice(1).map((shoe, idx) => {
              const quadrant = quadrants[shoe.quadrantKey];
              return (
                <motion.div
                  key={shoe.shoe._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-neutral-950 border border-neutral-800 rounded-3xl p-5 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      <span className="font-tanker text-2xl text-white/20">{idx + 2}</span>
                      <div className="w-16 h-16 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                        <ShoeImage
                          brand={shoe.shoe.brand}
                          shoeName={shoe.shoe.name}
                          className="p-1"
                          transformation={[{ height: 64, width: 64, crop: 'at_max', format: 'png' }]}
                          {...(shoe.shoe.imageUrl ? { imageUrl: shoe.shoe.imageUrl } : {})}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-tanker text-xl text-white leading-none mb-0.5">{shoe.shoe.name}</h3>
                          <p className="font-sora text-neutral-500 text-sm">{shoe.shoe.brand}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <MatchScoreTooltip score={shoe.score} breakdown={shoe.breakdown} />
                          <Badge className={`${quadrant.bgColor} ${quadrant.borderColor} border ${quadrant.accentClass} font-sora`}>
                            {quadrant.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <MetricBar label="Comfort" value={shoe.metrics.comfort} />
                        <MetricBar label="Performance" value={shoe.metrics.performance} />
                        <MetricBar label="Versatility" value={shoe.metrics.versatility} />
                        <MetricBar label="Aggression" value={shoe.metrics.aggressiveness} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <RealityCheck
                          label="Aggressiveness"
                          communityReality={shoe.metrics.aggressiveness}
                          description="How aggressive the shoe feels compared to official marketing specs."
                          {...(shoe.shoe.brandAggressiveness !== undefined
                            ? { brandClaim: shoe.shoe.brandAggressiveness }
                            : {})}
                        />
                        <RealityCheck
                          label="Stiffness"
                          communityReality={shoe.metrics.stability}
                          description="Community consensus on support and stiffness compared to the brand's technical claims."
                          {...(shoe.shoe.brandStiffness !== undefined
                            ? { brandClaim: shoe.shoe.brandStiffness }
                            : {})}
                        />
                      </div>
                      <SoleMateSignals shoeId={shoe.shoe._id} soleMateCount={shoe.breakdown.soleMateMatch} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {!recommendedShoes.length && !isLoading && (
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl text-center">
          <p className="font-sora text-neutral-400 text-sm">No shoe recommendations available yet.</p>
        </div>
      )}

      {!footProfile?.shape && !isLoading && (
        <div className="mt-6 p-5 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center gap-4">
          <User className="w-6 h-6 text-neutral-600 flex-shrink-0" />
          <p className="font-sora text-neutral-400 text-sm flex-1">
            Complete your foot profile for stronger recommendation accuracy.
          </p>
          <Link href="/footscan" className="font-sora text-sm text-orange-500 hover:text-orange-400 transition-colors shrink-0">
            Set up →
          </Link>
        </div>
      )}

      <DataContributionNudge stashCount={stashCount} ratedCount={ratedCount} />
    </div>
  );
}

function QuadrantHeader({ quadrant, count }: { quadrant: QuadrantInfo; count: number }) {
  return (
    <div className="flex items-center justify-center">
      <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 bg-neutral-900/80 border border-neutral-700/80 ${quadrant.accentClass}`}>
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
