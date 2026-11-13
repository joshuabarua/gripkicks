"use client";

import { AnimatePresence, motion } from "framer-motion";
import ShoeImage from "@/components/ShoeImage";
import { Heart, Target, Zap, Shield } from "lucide-react";
import { glideTransition, radarMarkerMotion } from "@/lib/motion";

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
}

const quadrants: Record<QuadrantKey, QuadrantInfo> = {
  comfort: {
    name: "Comfort",
    description: "Low aggression and all day comfort.",
    corner: "top-left",
    icon: <Heart aria-hidden="true" className="h-4 w-4" />,
  },
  "all-rounder": {
    name: "All rounder",
    description: "Balanced comfort and performance.",
    corner: "top-right",
    icon: <Zap aria-hidden="true" className="h-4 w-4" />,
  },
  aggressive: {
    name: "Aggressive",
    description: "Downturned with a forgiving fit.",
    corner: "bottom-left",
    icon: <Shield aria-hidden="true" className="h-4 w-4" />,
  },
  competition: {
    name: "Competition",
    description: "Downturned and precise for hard climbing.",
    corner: "bottom-right",
    icon: <Target aria-hidden="true" className="h-4 w-4" />,
  },
};

const cornerPositionClass: Record<Corner, string> = {
  "top-left": "top-8 left-6 sm:top-12 sm:left-12",
  "top-right": "top-8 right-6 sm:top-12 sm:right-12",
  "bottom-left": "bottom-8 left-6 sm:bottom-12 sm:left-12",
  "bottom-right": "bottom-8 right-6 sm:bottom-12 sm:right-12",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// x: comfort (left) to performance (right). y: versatile (top) to aggressive (bottom).
function computePosition(metrics: RadarMetrics) {
  const x = clamp(metrics.performance / Math.max(metrics.performance + metrics.comfort, 0.001), 0.08, 0.92);
  const y = clamp(metrics.aggressiveness / Math.max(metrics.aggressiveness + metrics.versatility, 0.001), 0.08, 0.92);
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
  const userQuadrant = userPos ? getQuadrantKeyFromPosition(userPos.x, userPos.y) : null;
  const positions = buildPositions(shoes, userPos);
  const quadrantCounts = positions.reduce((counts, p) => {
    counts[p.quadrantKey] += 1;
    return counts;
  }, { comfort: 0, "all-rounder": 0, aggressive: 0, competition: 0 } as Record<QuadrantKey, number>);

  return (
    <section aria-label="Shoe radar map" className="space-y-fluid-md">
      <div className="flex flex-wrap justify-between gap-3 font-mono text-sm text-brand-putty">
        <p>Focus or tap a shoe for details.</p>
        <p>Marker size: {confidenceLabel ?? "Confidence"}</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/40">
        <div className="relative aspect-[4/5] bg-brand-surface [--marker-scale:0.7] sm:aspect-[16/10] sm:[--marker-scale:1]" onMouseLeave={() => onHoverChange?.(null)}>
          <AxisLabel position="top">More Versatile</AxisLabel>
          <AxisLabel position="bottom">More Aggressive</AxisLabel>
          <AxisLabel position="left">More Comfortable</AxisLabel>
          <AxisLabel position="right">More Performance</AxisLabel>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/40" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-white/40" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
            {(["comfort", "all-rounder", "aggressive", "competition"] as const).map((key) => <QuadrantTile key={key} isUserQuadrant={userQuadrant === key} />)}
          </div>
          {(Object.keys(quadrants) as QuadrantKey[]).map((key) => <QuadrantCornerLabel key={key} quadrant={quadrants[key]} />)}
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-10 h-full w-full text-brand-putty">
            {positions.map((pos) => <line key={pos.id} x1={pos.baseX * 100} y1={pos.baseY * 100} x2={pos.x * 100} y2={pos.y * 100} stroke="currentColor" strokeWidth="0.15" strokeDasharray="0.6 0.5" />)}
          </svg>
          {userPos && <UserMarker x={userPos.x} y={userPos.y} label={userPosition?.label ?? "YOU"} />}
          <AnimatePresence initial={false}>
            {positions.map((pos, index) => <ShoeMarker key={pos.id} pos={pos} rank={index + 1} isHovered={hoveredId === pos.id} onHover={onHoverChange} />)}
          </AnimatePresence>
        </div>
      </div>
      <ul aria-label="Quadrants" className="grid grid-cols-2 gap-2">
        {(["comfort", "all-rounder", "aggressive", "competition"] as const).map((key) => <QuadrantLegendItem key={key} quadrant={quadrants[key]} count={quadrantCounts[key]} isUserQuadrant={userQuadrant === key} />)}
      </ul>
      <p className="font-mono text-sm text-brand-putty">Nearby markers are separated; dashed lines show metric positions. {userPos && "Cyan marker: your preferences; your quadrant is tinted. "}Arrows: community aggression compared with brand specification.</p>
    </section>
  );
}

function ShoeMarker({ pos, rank, isHovered, onHover }: { pos: ReturnType<typeof buildPositions>[number]; rank: number; isHovered: boolean; onHover?: ((id: string | null) => void) | undefined }) {
  const sizePx = 52 + Math.round(clamp(pos.confidence, 0, 1) * 32);
  const brandDelta = pos.brandAggressiveness !== undefined ? pos.metrics.aggressiveness - pos.brandAggressiveness : 0;
  const showBrandArrow = Math.abs(brandDelta) >= 0.3;
  const arrowMagnitude = clamp(Math.abs(brandDelta), 0, 2);

  return (
    <motion.button {...radarMarkerMotion} animate={{ opacity: 1, scale: 1, left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }} type="button" aria-label={`${rank}. ${pos.brand} ${pos.name}. ${pos.primaryScoreLabel ?? "Score"} ${pos.primaryScore}`} aria-expanded={isHovered} onMouseEnter={() => onHover?.(pos.id)} onFocus={() => onHover?.(pos.id)} onBlur={() => onHover?.(null)} onClick={() => onHover?.(pos.id)} onKeyDown={(event) => { if (event.key === "Escape") onHover?.(null); }} className={`absolute rounded-lg ${isHovered ? "z-40" : "z-30"}`} style={{ x: "-50%", y: "-50%" }}>
      <span className="relative block">
        <span className={`block overflow-hidden rounded-lg bg-black/40 shadow-lg ${rank === 1 || isHovered ? "border-2 border-brand-red" : "border border-white/40"}`} style={{ width: `calc(${sizePx}px * var(--marker-scale, 1))`, height: `calc(${sizePx}px * var(--marker-scale, 1))` }}>
          <ShoeImage brand={pos.brand} shoeName={pos.name} imageUrl={pos.imageUrl} className="p-1" transformation={[{ height: 80, width: 80, crop: "at_max", format: "png" }]} />
        </span>
        <span className={`absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-mono text-xs font-semibold ${rank === 1 ? "bg-brand-red text-black" : "bg-brand-soft-surface text-brand-chalk"}`}>{rank}</span>
        <span className="absolute -bottom-2 -right-2 rounded-full border border-white/40 bg-brand-base px-2 py-1 font-mono text-xs font-semibold tabular-nums text-brand-chalk">{pos.primaryScore}</span>
        {showBrandArrow && <span aria-hidden="true" title={`Community says ${brandDelta < 0 ? "softer" : "harder"} than brand spec`} className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 text-brand-putty"><BrandDriftArrow direction={brandDelta < 0 ? "up" : "down"} magnitude={arrowMagnitude} /></span>}
        {isHovered && (
          <span role="tooltip" className={`pointer-events-none absolute block w-56 rounded-xl border border-white/40 bg-brand-base p-4 text-left font-mono text-sm text-brand-chalk shadow-xl ${pos.y < 0.35 ? "top-full mt-4" : "bottom-full mb-4"} ${pos.x < 0.2 ? "left-0" : pos.x > 0.8 ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
            <span className="block font-semibold leading-snug">{pos.name}</span>
            <span className="mt-1 block text-brand-putty">{pos.brand}</span>
            <span className="mt-3 flex justify-between gap-3"><span className="text-brand-putty">{pos.primaryScoreLabel ?? "Score"}</span><span className="font-semibold tabular-nums">{pos.primaryScore}</span></span>
            {pos.topTrait && <span className="mt-2 flex justify-between gap-3"><span className="text-brand-putty">{pos.topTrait.label}</span><span className="tabular-nums">{pos.topTrait.value.toFixed(1)}/5</span></span>}
            {pos.subtitle && <span className="mt-3 block border-t border-white/40 pt-2 text-brand-putty">{pos.subtitle}</span>}
            {showBrandArrow && <span className="mt-2 block text-brand-putty">{brandDelta < 0 ? "↑ softer" : "↓ harder"} than brand spec by {arrowMagnitude.toFixed(1)}</span>}
          </span>
        )}
      </span>
    </motion.button>
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
    <motion.div className="pointer-events-none absolute z-20" initial={false} animate={{ left: `${x * 100}%`, top: `${y * 100}%` }} transition={glideTransition} style={{ x: "-50%", y: "-50%" }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-400 bg-brand-base"><div className="h-3 w-3 rounded-full bg-cyan-400" /></div>
      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-400 px-3 py-1 font-mono text-sm font-semibold text-black">{label}</div>
    </motion.div>
  );
}

function AxisLabel({ position, children }: { position: "top" | "bottom" | "left" | "right"; children: React.ReactNode }) {
  const classes = { top: "top-2 left-1/2 -translate-x-1/2 sm:top-4", bottom: "bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4", left: "left-1 top-1/2 -translate-y-1/2 sm:left-4", right: "right-1 top-1/2 -translate-y-1/2 sm:right-4" };
  return <div className={`pointer-events-none absolute z-20 whitespace-nowrap font-mono text-xs text-brand-putty sm:text-sm ${classes[position]}`}><span style={position === "left" || position === "right" ? { writingMode: "vertical-lr", ...(position === "left" ? { transform: "rotate(180deg)" } : {}) } : undefined}>{children}</span></div>;
}

function QuadrantTile({ isUserQuadrant }: { isUserQuadrant: boolean }) {
  return <div className={`transition-colors duration-500 ${isUserQuadrant ? "bg-brand-red/8" : ""}`} />;
}

// Sits beneath markers so shoes near the edges are never hidden by a label.
function QuadrantCornerLabel({ quadrant }: { quadrant: QuadrantInfo }) {
  return <div aria-hidden="true" className={`lab-title pointer-events-none absolute z-0 text-xs text-brand-putty/50 sm:text-base ${cornerPositionClass[quadrant.corner]}`}>{quadrant.name}</div>;
}

function QuadrantLegendItem({ quadrant, count, isUserQuadrant }: { quadrant: QuadrantInfo; count: number; isUserQuadrant: boolean }) {
  return (
    <li className={`rounded-lg border p-3 font-mono transition-colors duration-500 ${isUserQuadrant ? "border-brand-red/40 bg-brand-red/10" : "border-white/10"}`}>
      <p className="flex items-center gap-2 text-sm text-brand-chalk">{quadrant.icon}<span>{quadrant.name}</span><span className="ml-auto tabular-nums text-brand-putty">{count}</span></p>
      <p className="mt-1 hidden text-xs text-brand-putty sm:block">{quadrant.description}{isUserQuadrant ? " Your preferences." : ""}</p>
    </li>
  );
}
