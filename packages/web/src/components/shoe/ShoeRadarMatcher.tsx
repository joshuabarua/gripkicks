"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ShoeImage from '@/components/ShoeImage';
import { useShoeScoring } from '@/hooks/useShoeScoring';
import { useSubscription } from '@/hooks/useSubscription';
import { useFootProfileStore } from '@/stores/footProfileStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, User, Zap, Shield } from 'lucide-react';
import { MatchScoreTooltip } from './MatchScoreTooltip';
import { RealityCheck } from './RealityCheck';
import { SoleMateSignals } from './SoleMateSignals';

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
      const quadrantKey = getQuadrantKeyFromPosition(onlyEntry.baseX, onlyEntry.baseY);
      const descriptors = getAxisDescriptor(onlyEntry.metrics);

      return {
        ...onlyEntry,
        x: onlyEntry.baseX,
        y: onlyEntry.baseY,
        quadrantKey,
        descriptors,
        topTraits: getTopTraits(onlyEntry.metrics),
      };
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
  const { isPremium, isFounder, loading: subscriptionLoading } = useSubscription();
  const { scoredShoes, isLoading } = useShoeScoring();

  const recommendationLimit = isPremium || isFounder ? 5 : 1;

  const recommendedShoes = useMemo(() => {
    if (!scoredShoes || scoredShoes.length === 0) return [];

    return buildVisibleRadarPositions(
      scoredShoes.slice(0, recommendationLimit).map((scored) => ({
        shoe: scored.shoe,
        score: scored.totalScore,
        metrics: scored.metrics,
        realityDelta: scored.realityDelta,
        breakdown: scored.breakdown,
      })),
    );
  }, [recommendationLimit, scoredShoes]);

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
    <div className="w-full max-w-[1440px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Shoe Radar</h1>
        <Link
          href="/radar-lab"
          className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-orange-500/40 hover:text-white"
        >
          Public radar
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5">
                Showing top {recommendationLimit} {recommendationLimit === 1 ? 'shoe' : 'shoes'}
              </Badge>
              {leadShoe && leadQuadrant && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 mb-2">Lead profile</p>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={`${leadQuadrant.bgColor} ${leadQuadrant.borderColor} border ${leadQuadrant.accentClass}`}>
                      {leadQuadrant.name}
                    </Badge>
                    <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {leadShoe.descriptors.horizontalLabel}
                    </Badge>
                    <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {leadShoe.descriptors.verticalLabel}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    {leadShoe.shoe.brand} {leadShoe.shoe.name}
                  </h2>
                  <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
                    {leadQuadrant.description}
                  </p>
                </div>
              )}
            </div>

          </div>

          {leadShoe && (
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {leadShoe.topTraits.map((trait) => (
                <div key={trait.key} className="rounded-2xl border border-neutral-800 bg-black/30 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-neutral-500 mb-1">{trait.label}</p>
                      <p className="text-xl font-semibold text-white">{trait.value.toFixed(1)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-orange-500/20 bg-orange-500/10 flex items-center justify-center text-orange-400 text-xs font-semibold">
                      {Math.round((trait.value / 5) * 100)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 col-span-2 lg:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-400 mb-2">Fit context</p>
                <div className="flex flex-wrap gap-2 text-sm text-neutral-300">
                  <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                    Shape: {footProfile?.shape || 'none'}
                  </Badge>
                  <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                    Volume: {footProfile?.volume || 'none'}
                  </Badge>
                  <Badge variant="secondary" className="bg-neutral-900 text-neutral-300 border border-neutral-800">
                    Ranked: {recommendedShoes.length}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 mb-4">Radar language</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {(Object.keys(quadrants) as QuadrantKey[]).map((key) => {
              const quadrant = quadrants[key];
              return (
                <div key={key} className={`rounded-2xl border p-4 ${quadrant.borderColor} ${quadrant.bgColor}`}>
                  <div className={`flex items-center gap-2 mb-2 ${quadrant.accentClass}`}>
                    {quadrant.icon}
                    <span className="text-sm font-medium text-white">{quadrant.name}</span>
                  </div>
                  <p className="text-sm text-neutral-400">{quadrant.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden w-full" style={{ aspectRatio: '16 / 10', minHeight: '560px' }}>
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
        {recommendedShoes.map((shoe) => {
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
                        <h3 className="text-lg font-bold text-white truncate">{shoe.shoe.name}</h3>
                        <p className="text-neutral-400 text-sm">{shoe.shoe.brand}</p>
                      </div>
                      <Badge className={`${quadrant.bgColor} ${quadrant.borderColor} border ${quadrant.accentClass}`}>
                        {quadrant.name}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <MatchScoreTooltip score={shoe.score} breakdown={shoe.breakdown} />
                      <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300 ml-2">
                        Community {shoe.breakdown.communityApproval.toFixed(1)}/5
                      </Badge>
                      <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                        Overall {shoe.breakdown.overallRating.toFixed(1)}/5
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                        {shoe.descriptors.horizontalLabel}
                      </Badge>
                      <Badge variant="secondary" className="bg-neutral-950 border border-neutral-800 text-neutral-300">
                        {shoe.descriptors.verticalLabel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MetricBar label="Comfort" value={shoe.metrics.comfort} />
                      <MetricBar label="Performance" value={shoe.metrics.performance} />
                      <MetricBar label="Versatility" value={shoe.metrics.versatility} />
                      <MetricBar label="Aggression" value={shoe.metrics.aggressiveness} />
                    </div>

                    <div className="mt-4 space-y-3">
                      <RealityCheck 
                        label="Aggressiveness" 
                        brandClaim={shoe.shoe.brandAggressiveness} 
                        communityReality={shoe.metrics.aggressiveness}
                        description="How aggressive the shoe feels compared to official marketing specs."
                      />
                      <RealityCheck 
                        label="Stiffness" 
                        brandClaim={shoe.shoe.brandStiffness} 
                        communityReality={shoe.metrics.stability}
                        description="Community consensus on support and stiffness compared to the brand's technical claims."
                      />
                    </div>
                    
                    <SoleMateSignals shoeId={shoe.shoe._id} soleMateCount={shoe.breakdown.soleMateMatch} />
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
