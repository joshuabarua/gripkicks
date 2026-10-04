"use client";

import ShoeImage from "@/components/ShoeImage";
import { Heart, Target, Zap, Shield } from "lucide-react";

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

type QuadrantKey = "comfort" | "all-rounder" | "aggressive" | "competition";
type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface QuadrantInfo {
  name: string;
  description: string;
  corner: Corner;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
}

const quadrants: Record<QuadrantKey, QuadrantInfo> = {
  comfort: {
    name: "Comfort",
    description: "Low aggression and all-day comfort.",
    corner: "top-left",
    icon: <Heart aria-hidden="true" className="h-4 w-4" />,
    borderColor: "border-green-400/40",
    bgColor: "bg-green-400/5",
  },
  "all-rounder": {
    name: "All-Rounder",
    description: "Balanced comfort and performance.",
    corner: "top-right",
    icon: <Zap aria-hidden="true" className="h-4 w-4" />,
    borderColor: "border-blue-400/40",
    bgColor: "bg-blue-400/5",
  },
  aggressive: {
    name: "Aggressive",
    description: "Downturned shoes for steep terrain.",
    corner: "bottom-left",
    icon: <Shield aria-hidden="true" className="h-4 w-4" />,
    borderColor: "border-brand-red/40",
    bgColor: "bg-brand-red/5",
  },
  competition: {
    name: "Competition",
    description: "Specialist shoes for precision and sensitivity.",
    corner: "bottom-right",
    icon: <Target aria-hidden="true" className="h-4 w-4" />,
    borderColor: "border-red-400/40",
    bgColor: "bg-red-400/5",
  },
};

const cornerPositionClass: Record<Corner, string> = {
  "top-left": "top-12 left-12",
  "top-right": "top-12 right-12",
  "bottom-left": "bottom-12 left-12",
  "bottom-right": "bottom-12 right-12",
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
  if (!isPerformanceLed && !isAggressiveLed) return "comfort";
  if (isPerformanceLed && !isAggressiveLed) return "all-rounder";
  if (!isPerformanceLed && isAggressiveLed) return "aggressive";
  return "competition";
}

function buildPositions(shoes: RadarShoe[], reserved?: { x: number; y: number } | null) {
  const gapX = 0.16;
  const gapY = 0.2;
  const cells = new Map<string, Array<{ x: number; y: number }>>();
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]] as const;
  const occupy = (point: { x: number; y: number }) => {
    const key = `${Math.floor(point.x / gapX)}:${Math.floor(point.y / gapY)}`;
    const cell = cells.get(key) ?? [];
    cell.push(point);
    cells.set(key, cell);
  };
  const isFree = (point: { x: number; y: number }) => {
    const cellX = Math.floor(point.x / gapX);
    const cellY = Math.floor(point.y / gapY);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (cells.get(`${cellX + dx}:${cellY + dy}`)?.some((other) => Math.abs(point.x - other.x) < gapX - 0.001 && Math.abs(point.y - other.y) < gapY - 0.001)) return false;
      }
    }
    return true;
  };
  if (reserved) occupy(reserved);

  return shoes.map((shoe) => {
    const base = computePosition(shoe.metrics);
    let position = base;
    search: for (let ring = 0; ring <= 6; ring++) {
      for (const [dx, dy] of ring ? directions : [[0, 0]] as const) {
        const candidate = { x: clamp(base.x + dx * gapX * ring, 0.08, 0.92), y: clamp(base.y + dy * gapY * ring, 0.08, 0.92) };
        if (isFree(candidate)) {
          position = candidate;
          break search;
        }
      }
    }
    occupy(position);
    return { ...shoe, baseX: base.x, baseY: base.y, ...position, quadrantKey: getQuadrantKeyFromPosition(base.x, base.y) };
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
  const userPos = userPosition ? computePosition(userPosition.metrics) : null;
  const positions = buildPositions(shoes, userPos);
  const quadrantCounts = positions.reduce((counts, p) => {
    counts[p.quadrantKey] += 1;
    return counts;
  }, { comfort: 0, "all-rounder": 0, aggressive: 0, competition: 0 } as Record<QuadrantKey, number>);

  return (
    <section aria-label="Shoe radar map" className="space-y-fluid-md">
      <div className="flex flex-wrap justify-between gap-3 font-sora text-sm text-brand-putty">
        <p>Focus or tap a shoe for details. Scroll the map on smaller screens.</p>
        <p>Marker size: {confidenceLabel ?? "Confidence"}</p>
      </div>
      <div role="region" aria-label="Scrollable shoe radar" tabIndex={0} className="overflow-x-auto rounded-2xl border border-white/40">
        <div className="relative min-w-[680px] bg-brand-surface" style={{ aspectRatio: "16 / 10", minHeight: "560px" }} onMouseLeave={() => onHoverChange?.(null)}>
          <AxisLabel position="top">More Versatile</AxisLabel>
          <AxisLabel position="bottom">More Aggressive</AxisLabel>
          <AxisLabel position="left">More Comfortable</AxisLabel>
          <AxisLabel position="right">More Performance</AxisLabel>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/40" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-white/40" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
            <QuadrantTile quadrant={quadrants.comfort} extraBorder="border-r border-b" />
            <QuadrantTile quadrant={quadrants["all-rounder"]} extraBorder="border-b" />
            <QuadrantTile quadrant={quadrants.aggressive} extraBorder="border-r" />
            <QuadrantTile quadrant={quadrants.competition} extraBorder="" />
          </div>
          {(Object.keys(quadrants) as QuadrantKey[]).map((key) => <QuadrantCornerLabel key={key} quadrant={quadrants[key]} count={quadrantCounts[key]} />)}
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-10 h-full w-full text-brand-putty">
            {positions.map((pos) => <line key={pos.id} x1={pos.baseX * 100} y1={pos.baseY * 100} x2={pos.x * 100} y2={pos.y * 100} stroke="currentColor" strokeWidth="0.15" strokeDasharray="0.6 0.5" />)}
          </svg>
          {userPos && <UserMarker x={userPos.x} y={userPos.y} label={userPosition?.label ?? "YOU"} />}
          {positions.map((pos, index) => <ShoeMarker key={pos.id} pos={pos} rank={index + 1} isHovered={hoveredId === pos.id} onHover={onHoverChange} />)}
        </div>
      </div>
      <p className="font-sora text-sm text-brand-putty">Nearby markers are separated; dashed lines show metric positions. {userPos && "Cyan marker: your preferences. "}Arrows: community aggression compared with brand specification.</p>
    </section>
  );
}

function ShoeMarker({ pos, rank, isHovered, onHover }: { pos: ReturnType<typeof buildPositions>[number]; rank: number; isHovered: boolean; onHover?: ((id: string | null) => void) | undefined }) {
  const sizePx = 52 + Math.round(clamp(pos.confidence, 0, 1) * 32);
  const brandDelta = pos.brandAggressiveness !== undefined ? pos.metrics.aggressiveness - pos.brandAggressiveness : 0;
  const showBrandArrow = Math.abs(brandDelta) >= 0.3;
  const arrowMagnitude = clamp(Math.abs(brandDelta), 0, 2);

  return (
    <button type="button" aria-label={`${rank}. ${pos.brand} ${pos.name}. ${pos.primaryScoreLabel ?? "Score"} ${pos.primaryScore}`} aria-expanded={isHovered} onMouseEnter={() => onHover?.(pos.id)} onFocus={() => onHover?.(pos.id)} onBlur={() => onHover?.(null)} onClick={() => onHover?.(pos.id)} onKeyDown={(event) => { if (event.key === "Escape") onHover?.(null); }} className={`absolute rounded-lg ${isHovered ? "z-40" : "z-30"}`} style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, transform: "translate(-50%, -50%)" }}>
      <span className="relative block">
        <span className={`block overflow-hidden rounded-lg bg-brand-chalk shadow-lg ${rank === 1 || isHovered ? "border-2 border-brand-red" : "border border-white/40"}`} style={{ width: sizePx, height: sizePx }}>
          <ShoeImage brand={pos.brand} shoeName={pos.name} imageUrl={pos.imageUrl} className="p-1" transformation={[{ height: 80, width: 80, crop: "at_max", format: "png" }]} />
        </span>
        <span className={`absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-sora text-xs font-semibold ${rank === 1 ? "bg-brand-red text-black" : "bg-brand-soft-surface text-brand-chalk"}`}>{rank}</span>
        <span className="absolute -bottom-2 -right-2 rounded-full border border-white/40 bg-brand-base px-2 py-1 font-sora text-xs font-semibold tabular-nums text-brand-chalk">{pos.primaryScore}</span>
        {showBrandArrow && <span aria-hidden="true" title={`Community says ${brandDelta < 0 ? "softer" : "harder"} than brand spec`} className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 text-brand-putty"><BrandDriftArrow direction={brandDelta < 0 ? "up" : "down"} magnitude={arrowMagnitude} /></span>}
        {isHovered && (
          <span role="tooltip" className={`pointer-events-none absolute block w-56 rounded-xl border border-white/40 bg-brand-base p-4 text-left font-sora text-sm text-brand-chalk shadow-xl ${pos.y < 0.35 ? "top-full mt-4" : "bottom-full mb-4"} ${pos.x < 0.2 ? "left-0" : pos.x > 0.8 ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
            <span className="block font-semibold leading-snug">{pos.name}</span>
            <span className="mt-1 block text-brand-putty">{pos.brand}</span>
            <span className="mt-3 flex justify-between gap-3"><span className="text-brand-putty">{pos.primaryScoreLabel ?? "Score"}</span><span className="font-semibold tabular-nums">{pos.primaryScore}</span></span>
            {pos.topTrait && <span className="mt-2 flex justify-between gap-3"><span className="text-brand-putty">{pos.topTrait.label}</span><span className="tabular-nums">{pos.topTrait.value.toFixed(1)}/5</span></span>}
            {pos.subtitle && <span className="mt-3 block border-t border-white/40 pt-2 text-brand-putty">{pos.subtitle}</span>}
            {showBrandArrow && <span className="mt-2 block text-brand-putty">{brandDelta < 0 ? "↑ softer" : "↓ harder"} than brand spec by {arrowMagnitude.toFixed(1)}</span>}
          </span>
        )}
      </span>
    </button>
  );
}

function BrandDriftArrow({ direction, magnitude }: { direction: "up" | "down"; magnitude: number }) {
  const len = 8 + magnitude * 6;
  return (
    <svg width="10" height={len + 4} viewBox={`0 0 10 ${len + 4}`} fill="currentColor">
      {direction === "up" ? <><path d="M5 0 L9 5 L1 5 Z" /><rect x="4" y="5" width="2" height={len - 1} /></> : <><rect x="4" y="0" width="2" height={len - 1} /><path d={`M5 ${len + 4} L9 ${len - 1} L1 ${len - 1} Z`} /></>}
    </svg>
  );
}

function UserMarker({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div className="pointer-events-none absolute z-20" style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: "translate(-50%, -50%)" }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400 bg-brand-base"><div className="h-3 w-3 rounded-full bg-cyan-400" /></div>
      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-400 px-3 py-1 font-sora text-sm font-semibold text-black">{label}</div>
    </div>
  );
}

function AxisLabel({ position, children }: { position: "top" | "bottom" | "left" | "right"; children: React.ReactNode }) {
  const classes = { top: "top-4 left-1/2 -translate-x-1/2", bottom: "bottom-4 left-1/2 -translate-x-1/2", left: "left-4 top-1/2 -translate-y-1/2", right: "right-4 top-1/2 -translate-y-1/2" };
  return <div className={`pointer-events-none absolute z-20 font-sora text-sm text-brand-putty ${classes[position]}`}><span style={position === "left" || position === "right" ? { writingMode: "vertical-lr", ...(position === "left" ? { transform: "rotate(180deg)" } : {}) } : undefined}>{children}</span></div>;
}

function QuadrantTile({ quadrant, extraBorder }: { quadrant: QuadrantInfo; extraBorder: string }) {
  return <div className={`${quadrant.bgColor} ${quadrant.borderColor} ${extraBorder}`} />;
}

function QuadrantCornerLabel({ quadrant, count }: { quadrant: QuadrantInfo; count: number }) {
  return <div title={quadrant.description} className={`pointer-events-none absolute z-20 flex items-center gap-2 rounded-lg border border-white/40 bg-brand-base px-3 py-2 font-sora text-sm text-brand-chalk ${cornerPositionClass[quadrant.corner]}`}>{quadrant.icon}<span>{quadrant.name}</span><span className="tabular-nums text-brand-putty">{count}</span></div>;
}
