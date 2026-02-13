"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ShoeImage from '@/components/ShoeImage';
import { useShoeScoring } from '@/hooks/useShoeScoring';
import { useFootProfileStore } from '@/stores/footProfileStore';
import type { Doc } from 'convex/_generated/dataModel';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Shield, Heart, Search, Star, User, X } from 'lucide-react';

type Shoe = Doc<'shoes'>;

interface ShoePosition {
  shoe: Shoe;
  x: number; // 0 to 1: Comfort (left) → Performance (right)
  y: number; // 0 to 1: Versatile (top) → Aggressive (bottom)
  score: number;
  metrics: {
    comfort: number;
    performance: number;
    durability: number;
    aggressiveness: number;
    versatility: number;
  };
}

interface QuadrantInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
}

const quadrants: Record<string, QuadrantInfo> = {
  'daily-drivers': {
    name: 'Daily Drivers',
    description: 'Comfortable & versatile all-rounders',
    icon: <Heart className="w-4 h-4" />,
    borderColor: 'border-green-500/40',
    bgColor: 'bg-green-500/5',
  },
  'versatile-performers': {
    name: 'Versatile Performers',
    description: 'High performance with range',
    icon: <Zap className="w-4 h-4" />,
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/5',
  },
  'aggressive-comfort': {
    name: 'Aggressive Comfort',
    description: 'Downturned but padded',
    icon: <Shield className="w-4 h-4" />,
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-500/5',
  },
  'competition': {
    name: 'Competition',
    description: 'Max performance, max aggression',
    icon: <Target className="w-4 h-4" />,
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/5',
  },
};

export function ShoeRadarMatcher() {
  const { profile: footProfile } = useFootProfileStore();
  const [selectedShoe, setSelectedShoe] = useState<ShoePosition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { scoredShoes, isLoading } = useShoeScoring();

  // Map scored shoes to grid positions
  const shoePositions = useMemo((): ShoePosition[] => {
    if (!scoredShoes || scoredShoes.length === 0) return [];

    return scoredShoes
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.shoe.name.toLowerCase().includes(q) ||
          s.shoe.brand.toLowerCase().includes(q)
        );
      })
      .map((scored) => {
        const { comfort, performance, aggressiveness, versatility } = scored.metrics;

        // X axis: Comfort (0/left) → Performance (1/right)
        // Normalize: higher performance pushes right, higher comfort pushes left
        const xRaw = (performance - comfort + 5) / 10; // maps [-5,5] → [0,1]

        // Y axis: Versatile (0/top) → Aggressive (1/bottom)
        // Normalize: higher aggressiveness pushes down, higher versatility pushes up
        const yRaw = (aggressiveness - versatility + 5) / 10;

        return {
          shoe: scored.shoe,
          x: Math.max(0.04, Math.min(0.96, xRaw)),
          y: Math.max(0.04, Math.min(0.96, yRaw)),
          score: scored.totalScore,
          metrics: scored.metrics,
        };
      });
  }, [scoredShoes, searchQuery]);

  // Get shoes per quadrant for counts
  const quadrantCounts = useMemo(() => {
    const counts = { 'daily-drivers': 0, 'versatile-performers': 0, 'aggressive-comfort': 0, 'competition': 0 };
    for (const pos of shoePositions) {
      if (pos.x < 0.5 && pos.y < 0.5) counts['daily-drivers']++;
      else if (pos.x >= 0.5 && pos.y < 0.5) counts['versatile-performers']++;
      else if (pos.x < 0.5 && pos.y >= 0.5) counts['aggressive-comfort']++;
      else counts['competition']++;
    }
    return counts;
  }, [shoePositions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-neutral-500">Loading shoe matcher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Shoe Radar</h1>
        <p className="text-neutral-400">
          Every shoe plotted by comfort vs performance and versatility vs aggressiveness
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Search shoes by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="text-center mt-2 text-sm text-neutral-500">
          {shoePositions.length} shoes on grid
        </div>
      </div>

      {/* Quadrant Grid */}
      <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden" style={{ aspectRatio: '1 / 1', maxHeight: '680px' }}>
        {/* Axis labels */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 text-xs text-neutral-500 pointer-events-none">
          <span className="uppercase tracking-wider">Versatile</span>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 text-xs text-neutral-500 pointer-events-none">
          <span className="uppercase tracking-wider">Aggressive</span>
        </div>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
          <span className="uppercase tracking-wider" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>Comfort</span>
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
          <span className="uppercase tracking-wider" style={{ writingMode: 'vertical-lr' }}>Performance</span>
        </div>

        {/* Grid crosshairs */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800" />
        </div>

        {/* Quadrant backgrounds */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
          {/* Top-Left: Daily Drivers (Comfort + Versatile) */}
          <div className={`${quadrants['daily-drivers'].bgColor} ${quadrants['daily-drivers'].borderColor} border-r border-b p-3`}>
            <div className="flex items-center gap-1.5 text-green-400/70">
              {quadrants['daily-drivers'].icon}
              <span className="text-xs font-medium">{quadrants['daily-drivers'].name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-800/50 text-neutral-400 ml-auto">
                {quadrantCounts['daily-drivers']}
              </Badge>
            </div>
          </div>
          {/* Top-Right: Versatile Performers (Performance + Versatile) */}
          <div className={`${quadrants['versatile-performers'].bgColor} ${quadrants['versatile-performers'].borderColor} border-b p-3`}>
            <div className="flex items-center gap-1.5 text-blue-400/70">
              {quadrants['versatile-performers'].icon}
              <span className="text-xs font-medium">{quadrants['versatile-performers'].name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-800/50 text-neutral-400 ml-auto">
                {quadrantCounts['versatile-performers']}
              </Badge>
            </div>
          </div>
          {/* Bottom-Left: Aggressive Comfort (Comfort + Aggressive) */}
          <div className={`${quadrants['aggressive-comfort'].bgColor} ${quadrants['aggressive-comfort'].borderColor} border-r p-3`}>
            <div className="flex items-center gap-1.5 text-orange-400/70">
              {quadrants['aggressive-comfort'].icon}
              <span className="text-xs font-medium">{quadrants['aggressive-comfort'].name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-800/50 text-neutral-400 ml-auto">
                {quadrantCounts['aggressive-comfort']}
              </Badge>
            </div>
          </div>
          {/* Bottom-Right: Competition (Performance + Aggressive) */}
          <div className={`${quadrants['competition'].bgColor} ${quadrants['competition'].borderColor} p-3`}>
            <div className="flex items-center gap-1.5 text-red-400/70">
              {quadrants['competition'].icon}
              <span className="text-xs font-medium">{quadrants['competition'].name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-neutral-800/50 text-neutral-400 ml-auto">
                {quadrantCounts['competition']}
              </Badge>
            </div>
          </div>
        </div>

        {/* Center crosshair dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-2 h-2 bg-orange-500 rounded-full" />

        {/* Shoe dots */}
        {shoePositions.map((pos) => {
          const isSelected = selectedShoe?.shoe._id === pos.shoe._id;
          return (
            <motion.div
              key={pos.shoe._id}
              className="absolute z-30 cursor-pointer"
              style={{
                left: `${pos.x * 100}%`,
                top: `${pos.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              whileHover={{ scale: 1.3, zIndex: 40 }}
              onClick={() => setSelectedShoe(isSelected ? null : pos)}
            >
              <div className={`relative ${isSelected ? 'ring-2 ring-orange-500 rounded-lg' : ''}`}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden shadow-lg">
                  <ShoeImage
                    brand={pos.shoe.brand}
                    shoeName={pos.shoe.name}
                    imageUrl={pos.shoe.imageUrl ?? undefined}
                    className="p-0.5"
                    transformation={[{ height: 48, width: 48, crop: 'at_max', format: 'png' }]}
                  />
                </div>
                {/* Match score indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-orange-400">{Math.round((pos.score / 5) * 100)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Shoe Detail */}
      {selectedShoe && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                  <ShoeImage
                    brand={selectedShoe.shoe.brand}
                    shoeName={selectedShoe.shoe.name}
                    imageUrl={selectedShoe.shoe.imageUrl ?? undefined}
                    className="p-1"
                    transformation={[{ height: 64, width: 64, crop: 'at_max', format: 'png' }]}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white truncate">{selectedShoe.shoe.name}</h3>
                      <p className="text-neutral-400 text-sm">{selectedShoe.shoe.brand}</p>
                    </div>
                    <button
                      onClick={() => setSelectedShoe(null)}
                      className="text-neutral-500 hover:text-white transition-colors flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <Star className="w-4 h-4 text-orange-500" />
                    <span className="text-white font-semibold">{Math.round((selectedShoe.score / 5) * 100)}%</span>
                    <span className="text-neutral-500 text-xs">match</span>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <MetricBar label="Comfort" value={selectedShoe.metrics.comfort} icon={<Heart className="w-3 h-3" />} />
                    <MetricBar label="Perform" value={selectedShoe.metrics.performance} icon={<Zap className="w-3 h-3" />} />
                    <MetricBar label="Durable" value={selectedShoe.metrics.durability} icon={<Shield className="w-3 h-3" />} />
                    <MetricBar label="Aggress" value={selectedShoe.metrics.aggressiveness} icon={<Target className="w-3 h-3" />} />
                    <MetricBar label="Versatile" value={selectedShoe.metrics.versatility} icon={<Heart className="w-3 h-3" />} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No profile hint */}
      {!footProfile?.shape && !isLoading && (
        <div className="mt-6 p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-center">
          <User className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
          <p className="text-neutral-400 text-sm">
            Complete your foot profile for personalized shoe positioning
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(quadrants).map(([key, q]) => (
          <div key={key} className={`p-3 rounded-lg border ${q.borderColor} ${q.bgColor}`}>
            <div className="flex items-center gap-1.5 mb-1">
              {q.icon}
              <span className="text-xs font-medium text-white">{q.name}</span>
            </div>
            <p className="text-[11px] text-neutral-500">{q.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const pct = (value / 5) * 100;
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
        {icon}
        <span className="text-xs text-white font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-neutral-500 mt-0.5 block">{label}</span>
    </div>
  );
}
