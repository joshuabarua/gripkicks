"use client";

import { motion } from "framer-motion";
import { glideTransition } from "@/lib/motion";

export interface FitMetrics {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  versatility: number;
}

const AXES: Array<{ key: keyof FitMetrics; label: string }> = [
  { key: "comfort", label: "Comfort" },
  { key: "performance", label: "Performance" },
  { key: "aggressiveness", label: "Aggressive" },
  { key: "durability", label: "Durability" },
  { key: "versatility", label: "Versatile" },
];

const SIZE = 120;
const CENTER = SIZE / 2;
const RADIUS = 42;
const MAX = 5;

function point(index: number, value: number) {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
  const r = (Math.min(MAX, Math.max(0, value)) / MAX) * RADIUS;
  return [CENTER + Math.cos(angle) * r, CENTER + Math.sin(angle) * r] as const;
}

function shapePath(metrics: FitMetrics) {
  return AXES.map(({ key }, index) => {
    const [x, y] = point(index, metrics[key]);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

const COLLAPSED = shapePath({ comfort: 0, performance: 0, durability: 0, aggressiveness: 0, versatility: 0 });

export function biggestGap(shoe: FitMetrics, you: FitMetrics) {
  return AXES.map(({ key, label }) => ({ label, delta: shoe[key] - you[key] }))
    .reduce((widest, axis) => (Math.abs(axis.delta) > Math.abs(widest.delta) ? axis : widest));
}

// Five-axis spider chart of a shoe's ratings over the ratings the user tends
// to give, both on the 0-5 scale.
export function FitChart({ shoe, you }: { shoe: FitMetrics; you: FitMetrics }) {
  const gap = biggestGap(shoe, you);
  const label = AXES.map(({ key, label: axis }) => `${axis} ${shoe[key].toFixed(1)} vs your ${you[key].toFixed(1)}`).join(", ");

  return (
    <figure className="flex items-center gap-4">
      <svg role="img" aria-label={`Fit against your ratings: ${label}`} viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-36 w-36 shrink-0 overflow-visible">
        {[1, 2, 3, 4, 5].map((ring) => (
          <path key={ring} d={shapePath({ comfort: ring, performance: ring, durability: ring, aggressiveness: ring, versatility: ring })} fill="none" strokeWidth="0.5" className={ring === MAX ? "stroke-white/25" : "stroke-white/10"} />
        ))}
        {AXES.map(({ key, label: axis }, index) => {
          const [x, y] = point(index, MAX);
          const [lx, ly] = point(index, MAX + 1.15);
          return (
            <g key={key}>
              <line x1={CENTER} y1={CENTER} x2={x} y2={y} strokeWidth="0.5" className="stroke-white/10" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-brand-putty font-mono text-[8px] uppercase">{axis.slice(0, 4)}</text>
            </g>
          );
        })}
        <motion.path initial={{ d: COLLAPSED }} animate={{ d: shapePath(shoe) }} transition={glideTransition} strokeWidth="1.5" strokeLinejoin="round" className="fill-brand-red/30 stroke-brand-red" />
        <motion.path initial={{ d: COLLAPSED }} animate={{ d: shapePath(you) }} transition={{ ...glideTransition, delay: 0.1 }} fill="none" strokeWidth="1.5" strokeDasharray="3 2" strokeLinejoin="round" className="stroke-brand-chalk" />
        {AXES.map(({ key, label: axis }, index) => {
          const [x, y] = point(index, shoe[key]);
          return (
            <circle key={key} cx={x} cy={y} r="6" className="fill-transparent">
              <title>{`${axis}: ${shoe[key].toFixed(1)} (you ${you[key].toFixed(1)})`}</title>
            </circle>
          );
        })}
      </svg>
      <figcaption className="min-w-0 space-y-2 font-mono text-sm">
        <p className="flex items-center gap-2 text-brand-putty"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm border border-brand-red bg-brand-red/30" />This shoe</p>
        <p className="flex items-center gap-2 text-brand-putty"><span aria-hidden="true" className="h-0 w-2.5 border-t-2 border-dashed border-brand-chalk" />Your ratings</p>
        <p className="text-brand-chalk">
          <span className="lab-label block">Biggest gap</span>
          {gap.label} <span className="tabular-nums">{gap.delta >= 0 ? "+" : ""}{gap.delta.toFixed(1)}</span>
        </p>
      </figcaption>
    </figure>
  );
}
