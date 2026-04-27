"use client";

import { motion, AnimatePresence } from "framer-motion";
import ShoeImage from "@/components/ShoeImage";
import { Heart, Target, Zap, Shield, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RadarMetrics {
  comfort: number;
  performance: number;
  aggressiveness: number;
  versatility: number;
}

export interface RadarShoe {
  id: string;
  brand: string;
  name: string;
  imageUrl?: string;
  primaryScore: number;
  primaryScoreLabel?: string;
  subtitle?: string;
  confidence: number;
  brandAggressiveness?: number;
  topTrait?: { label: string; value: number };
  metrics: RadarMetrics;
}

export interface RadarUserPosition {
  metrics: RadarMetrics;
  label?: string;
}

type QuadrantKey = "daily-drivers" | "versatile-performers" | "aggressive-comfort" | "competition";

interface QuadrantInfo {
  name: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  accentClass: string;
}

const quadrants: Record<QuadrantKey, QuadrantInfo> = {
  "daily-drivers": {
    name: "Daily Drivers",
    icon: <Heart className="w-3 h-3" />,
    borderColor: "border-green-500/40",
    bgColor: "bg-green-500/5",
    accentClass: "text-green-400/80",
  },
  "versatile-performers": {
    name: "Versatile Performers",
    icon: <Zap className="w-3 h-3" />,
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/5",
    accentClass: "text-blue-400/80",
  },
  "aggressive-comfort": {
    name: "Aggressive Comfort",
    icon: <Shield className="w-3 h-3" />,
    borderColor: "border-brand-red/40",
    bgColor: "bg-brand-red/5",
    accentClass: "text-brand-red/80",
  },
  competition: {
    name: "Competition",
    icon: <Target className="w-3 h-3" />,
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/5",
    accentClass: "text-red-400/80",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computePosition(metrics: RadarMetrics) {
  const performanceWeight = metrics.performance + metrics.aggressiveness;
  const comfortWeight = metrics.comfort + metrics.versatility;
  const versatilityWeight = metrics.versatility + metrics.comfort;
  const aggressiveWeight = metrics.aggressiveness + metrics.performance;
  const x = clamp(performanceWeight / Math.max(performanceWeight + comfortWeight, 0.001), 0.08, 0.92);
  const y = clamp(1 - aggressiveWeight / Math.max(aggressiveWeight + versatilityWeight, 0.001), 0.08, 0.92);
  return { x, y };
}

function getQuadrantKeyFromPosition(x: number, y: number): QuadrantKey {
  const isPerformanceLed = x >= 0.5;
  const isAggressiveLed = y >= 0.5;
  if (!isPerformanceLed && !isAggressiveLed) return "daily-drivers";
  if (isPerformanceLed && !isAggressiveLed) return "versatile-performers";
  if (!isPerformanceLed && isAggressiveLed) return "aggressive-comfort";
  return "competition";
}

function buildPositions(shoes: RadarShoe[]) {
  const grouped = new Map<string, Array<RadarShoe & { baseX: number; baseY: number }>>();

  shoes.forEach((shoe) => {
    const { x, y } = computePosition(shoe.metrics);
    const key = `${x.toFixed(3)}:${y.toFixed(3)}`;
    const group = grouped.get(key) ?? [];
    group.push({ ...shoe, baseX: x, baseY: y });
    grouped.set(key, group);
  });

  return Array.from(grouped.values()).flatMap((group) => {
    if (group.length === 1) {
      const only = group[0]!;
      return [{ ...only, x: only.baseX, y: only.baseY, quadrantKey: getQuadrantKeyFromPosition(only.baseX, only.baseY) }];
    }
    return group.map((entry, index) => {
      const angle = (Math.PI * 2 * index) / group.length;
      const radius = 0.028 + Math.floor(index / 4) * 0.012;
      const x = clamp(entry.baseX + Math.cos(angle) * radius, 0.08, 0.92);
      const y = clamp(entry.baseY + Math.sin(angle) * radius, 0.08, 0.92);
      return { ...entry, x, y, quadrantKey: getQuadrantKeyFromPosition(x, y) };
    });
  });
}

interface RadarGridProps {
  shoes: RadarShoe[];
  userPosition?: RadarUserPosition;
  hoveredId?: string | null;
  onHoverChange?: (id: string | null) => void;
  confidenceLabel?: string;
}

export function RadarGrid({ shoes, userPosition, hoveredId, onHoverChange, confidenceLabel }: RadarGridProps) {
  const positions = buildPositions(shoes);

  const quadrantCounts = positions.reduce(
    (counts, p) => {
      counts[p.quadrantKey] += 1;
      return counts;
    },
    { "daily-drivers": 0, "versatile-performers": 0, "aggressive-comfort": 0, competition: 0 } as Record<QuadrantKey, number>,
  );

  const userPos = userPosition ? computePosition(userPosition.metrics) : null;

  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30">Radar map</p>
        <Legend confidenceLabel={confidenceLabel} />
      </div>

      <div
        className="relative bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden w-full"
        style={{ aspectRatio: "16 / 10", minHeight: "480px" }}
        onMouseLeave={() => onHoverChange?.(null)}
      >
        <AxisLabel position="top">More Versatile</AxisLabel>
        <AxisLabel position="bottom">More Aggressive</AxisLabel>
        <AxisLabel position="left">More Comfortable</AxisLabel>
        <AxisLabel position="right">More Performance</AxisLabel>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-800" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-800" />
        </div>

        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-0">
          <QuadrantTile quadrant={quadrants["daily-drivers"]} count={quadrantCounts["daily-drivers"]} extraBorder="border-r border-b" />
          <QuadrantTile quadrant={quadrants["versatile-performers"]} count={quadrantCounts["versatile-performers"]} extraBorder="border-b" />
          <QuadrantTile quadrant={quadrants["aggressive-comfort"]} count={quadrantCounts["aggressive-comfort"]} extraBorder="border-r" />
          <QuadrantTile quadrant={quadrants.competition} count={quadrantCounts.competition} extraBorder="" />
        </div>

        {userPos ? <UserMarker x={userPos.x} y={userPos.y} label={userPosition?.label ?? "YOU"} /> : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-1.5 h-1.5 bg-neutral-700 rounded-full" />
        )}

        {positions.map((pos, index) => (
          <ShoeMarker
            key={pos.id}
            pos={pos}
            rank={index + 1}
            isHovered={hoveredId === pos.id}
            isDimmed={hoveredId !== null && hoveredId !== undefined && hoveredId !== pos.id}
            onHover={onHoverChange}
          />
        ))}
      </div>
    </div>
  );
}

function ShoeMarker({
  pos,
  rank,
  isHovered,
  isDimmed,
  onHover,
}: {
  pos: ReturnType<typeof buildPositions>[number];
  rank: number;
  isHovered: boolean;
  isDimmed: boolean;
  onHover?: ((id: string | null) => void) | undefined;
}) {
  const sizePx = 36 + Math.round(clamp(pos.confidence, 0, 1) * 24);
  const isLead = rank === 1;
  const brandDelta =
    pos.brandAggressiveness !== undefined ? pos.metrics.aggressiveness - pos.brandAggressiveness : 0;
  const showBrandArrow = Math.abs(brandDelta) >= 0.3;
  const arrowMagnitude = clamp(Math.abs(brandDelta), 0, 2);
  const arrowDirection = brandDelta < 0 ? "softer" : "harder";
  const arrowColor = arrowMagnitude >= 1 ? "text-amber-400" : "text-neutral-400";

  return (
    <motion.div
      className="absolute z-30"
      style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDimmed ? 0.3 : 1, scale: isHovered ? 1.1 : 1 }}
      transition={{ delay: rank * 0.04 }}
      onMouseEnter={() => onHover?.(pos.id)}
      onFocus={() => onHover?.(pos.id)}
      tabIndex={0}
    >
      <div className="relative">
        <div
          className={`rounded-lg overflow-hidden shadow-lg transition-colors ${
            isLead || isHovered
              ? "border-2 border-brand-red/70 bg-neutral-900 shadow-brand-red/20"
              : "border border-neutral-700 bg-neutral-900"
          }`}
          style={{ width: sizePx, height: sizePx }}
        >
          <ShoeImage
            brand={pos.brand}
            shoeName={pos.name}
            className="p-0.5"
            transformation={[{ height: 64, width: 64, crop: "at_max", format: "png" }]}
            {...(pos.imageUrl ? { imageUrl: pos.imageUrl } : {})}
          />
        </div>

        <div
          className={`absolute -top-1 -left-1 min-w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center px-1.5 ${
            isLead ? "bg-brand-red text-black" : "bg-neutral-700 text-white"
          }`}
        >
          {rank}
        </div>

        <div className="absolute -bottom-1 -right-1 min-w-6 h-5 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center px-1.5">
          <span className="text-[8px] font-bold text-brand-red tabular-nums">{pos.primaryScore}</span>
        </div>

        {showBrandArrow && (
          <div
            className={`absolute -right-3 top-1/2 -translate-y-1/2 ${arrowColor} pointer-events-none`}
            title={`Community says ${arrowDirection} than brand spec`}
          >
            <BrandDriftArrow direction={brandDelta < 0 ? "up" : "down"} magnitude={arrowMagnitude} />
          </div>
        )}

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-2 -top-2 pointer-events-none z-40"
              style={{ transform: "translate(-50%, calc(-100% - 8px))" }}
            >
              <div className="bg-black/95 backdrop-blur border border-neutral-700 rounded-xl px-3 py-2 min-w-[180px] shadow-xl">
                <p className="font-tanker text-sm text-white leading-tight whitespace-nowrap">{pos.name}</p>
                <p className="font-sora text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">{pos.brand}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sora text-[10px] text-neutral-400">
                    {pos.primaryScoreLabel ?? "Score"}
                  </span>
                  <span className="font-tanker text-base text-brand-red tabular-nums">{pos.primaryScore}</span>
                </div>
                {pos.topTrait && (
                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <span className="font-sora text-[10px] text-neutral-400">{pos.topTrait.label}</span>
                    <span className="font-sora text-[11px] text-white tabular-nums">
                      {pos.topTrait.value.toFixed(1)}
                    </span>
                  </div>
                )}
                {pos.subtitle && (
                  <p className="font-sora text-[10px] text-neutral-500 mt-1 pt-1 border-t border-neutral-800">
                    {pos.subtitle}
                  </p>
                )}
                {showBrandArrow && (
                  <p className={`font-sora text-[10px] mt-1 ${arrowColor}`}>
                    {brandDelta < 0 ? "↑ softer" : "↓ harder"} than brand spec by {arrowMagnitude.toFixed(1)}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function BrandDriftArrow({ direction, magnitude }: { direction: "up" | "down"; magnitude: number }) {
  const len = 8 + magnitude * 6;
  return (
    <svg width="10" height={len + 4} viewBox={`0 0 10 ${len + 4}`} fill="currentColor">
      {direction === "up" ? (
        <>
          <path d="M5 0 L9 5 L1 5 Z" />
          <rect x="4" y="5" width="2" height={len - 1} />
        </>
      ) : (
        <>
          <rect x="4" y="0" width="2" height={len - 1} />
          <path d={`M5 ${len + 4} L9 ${len - 1} L1 ${len - 1} Z`} />
        </>
      )}
    </svg>
  );
}

function UserMarker({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 bg-cyan-500/10 flex items-center justify-center backdrop-blur">
          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded-full bg-cyan-500 text-black font-tanker text-[10px] tracking-wider whitespace-nowrap">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function Legend({ confidenceLabel }: { confidenceLabel?: string | undefined }) {
  return (
    <div className="hidden md:flex items-center gap-4 text-[10px] font-sora text-neutral-500">
      <div className="flex items-center gap-1.5">
        <Info className="w-3 h-3" />
        <span>Hover to inspect</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span>You</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-0.5">
          <div className="w-1.5 h-1.5 bg-neutral-600 rounded-sm" />
          <div className="w-2 h-2 bg-neutral-500 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-neutral-400 rounded-sm" />
        </div>
        <span>{confidenceLabel ?? "Confidence"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-amber-400">↑↓</span>
        <span>Brand drift</span>
      </div>
    </div>
  );
}

function AxisLabel({ position, children }: { position: "top" | "bottom" | "left" | "right"; children: React.ReactNode }) {
  if (position === "top") {
    return (
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider font-sora">
        {children}
      </div>
    );
  }
  if (position === "bottom") {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs text-neutral-500 pointer-events-none uppercase tracking-wider font-sora">
        {children}
      </div>
    );
  }
  if (position === "left") {
    return (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
        <span style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }} className="uppercase tracking-wider font-sora">
          {children}
        </span>
      </div>
    );
  }
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-xs text-neutral-500 pointer-events-none">
      <span style={{ writingMode: "vertical-lr" }} className="uppercase tracking-wider font-sora">
        {children}
      </span>
    </div>
  );
}

function QuadrantTile({
  quadrant,
  count,
  extraBorder,
}: {
  quadrant: QuadrantInfo;
  count: number;
  extraBorder: string;
}) {
  return (
    <div className={`${quadrant.bgColor} ${quadrant.borderColor} ${extraBorder} p-3 flex items-start justify-start`}>
      <Badge
        variant="secondary"
        className={`text-[10px] px-2 py-0.5 bg-neutral-900/80 border border-neutral-700/80 font-sora flex items-center gap-1.5 ${quadrant.accentClass}`}
      >
        {quadrant.icon}
        <span>{quadrant.name}</span>
        <span className="text-neutral-500">·</span>
        <span className="tabular-nums">{count}</span>
      </Badge>
    </div>
  );
}
