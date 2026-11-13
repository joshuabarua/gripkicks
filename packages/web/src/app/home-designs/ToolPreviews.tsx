"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import ShoeImage from "@/components/ShoeImage";
import { TOE_HEIGHTS, VOLUME_ARCH, type FootShape, type FootVolume } from "@/components/foot/FootGlyphs";
import { useAnimationsEnabled } from "@/stores/useAppStore";
import { glideTransition } from "@/lib/motion";

// Steps through `length` frames while the preview is on screen. Reduced motion
// (OS setting or the app toggle) and an active (hovered or focused) card hold
// `activeStep`. These are light SVG loops, so low-end device heuristics that
// gate the WebGL hero don't apply.
function usePreviewStep(ref: RefObject<HTMLElement | null>, length: number, active: boolean, activeStep = 0, intervalMs = 2400) {
  const prefersReducedMotion = useReducedMotion();
  const animationsEnabled = useAnimationsEnabled();
  const reduced = prefersReducedMotion || !animationsEnabled;
  const inView = useInView(ref, { margin: "0px 0px -10% 0px" });
  // Start on the resolved frame so server HTML shows complete previews.
  const [step, setStep] = useState(activeStep);
  const running = !reduced && inView && !active;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setStep((current) => (current + 1) % length), intervalMs);
    return () => window.clearInterval(id);
  }, [running, length, intervalMs]);

  if (active) return activeStep;
  return reduced ? activeStep : step;
}

const SHAPES: FootShape[] = ["egyptian", "roman", "greek", "germanic", "celtic"];
const VOLUMES: FootVolume[] = ["low", "medium", "high"];

function ToeBars({ shape, className }: { shape: FootShape; className: string }) {
  return (
    <>
      {TOE_HEIGHTS[shape].map((height, index) => {
        const barHeight = (height / 12) * 58;
        return <motion.rect key={index} x={index * 19 + 4} width={14} rx={7} initial={false} animate={{ y: 62 - barHeight, height: barHeight }} transition={glideTransition} className={className} />;
      })}
    </>
  );
}

export function FootLabPreview({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const step = usePreviewStep(ref, SHAPES.length * VOLUMES.length, active);
  const shape = SHAPES[step % SHAPES.length]!;
  const volume = VOLUMES[step % VOLUMES.length]!;

  return (
    <div ref={ref} aria-hidden="true" className="grid h-28 grid-cols-2 items-end gap-4 rounded-md border border-white/6 bg-black/40 px-4 pb-3 pt-4">
      <div className="space-y-2">
        <svg viewBox="0 0 100 66" className="h-14 w-full"><ToeBars shape={shape} className="fill-brand-red" /></svg>
        <p className="lab-label">Shape <span className="text-brand-chalk">{shape}</span></p>
      </div>
      <div className="space-y-2">
        <svg viewBox="0 0 80 52" className="h-14 w-full">
          <line x1="8" y1="46" x2="72" y2="46" strokeWidth="1" className="stroke-white/15" />
          <motion.path initial={false} animate={{ d: VOLUME_ARCH[volume] }} transition={glideTransition} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-brand-chalk" />
        </svg>
        <p className="lab-label">Volume <span className="text-brand-chalk">{volume}</span></p>
      </div>
    </div>
  );
}

const SANCTUARY_SHOES = [
  { brand: "Scarpa", name: "Drago LV", imageUrl: "https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/scarpa/drago_lv_side_profile.png" },
  { brand: "Black Diamond", name: "Focus", imageUrl: "https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/black_diamond/focus_side_profile.png" },
  { brand: "Boreal", name: "Dharma", imageUrl: "https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/boreal/dharma_side_profile.png" },
];

export function SanctuaryPreview({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const spread = usePreviewStep(ref, 2, active, 1) === 1;

  return (
    <div ref={ref} aria-hidden="true" className="relative flex h-28 items-center justify-center overflow-hidden rounded-md border border-white/6 bg-black/40">
      {SANCTUARY_SHOES.map((shoe, index) => {
        const offset = index - 1;
        return (
          <motion.div key={shoe.name} initial={false} animate={{ x: offset * (spread ? 84 : 26), rotate: offset * (spread ? 4 : 10), y: spread ? 0 : Math.abs(offset) * 6 }} transition={glideTransition} className={`absolute h-20 w-28 rounded-md border bg-brand-charcoal p-1.5 shadow-lg shadow-black/40 ${offset === 0 ? "z-10 border-white/20" : "border-white/8"}`}>
            <ShoeImage brand={shoe.brand} shoeName={shoe.name} imageUrl={shoe.imageUrl} context="thumbnail" className="h-full w-full" transformation={[{ height: 80, width: 112, crop: "at_max", format: "png" }]} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Two arrangements the markers glide between, in a 200 x 170 plot.
const RADAR_LAYOUTS = [
  [[52, 42], [128, 36], [96, 76], [150, 110], [60, 124], [118, 136]],
  [[64, 56], [140, 48], [86, 88], [136, 124], [44, 110], [108, 144]],
] as const;
const YOU_POSITIONS = [[104, 64], [96, 70]] as const;
const MAKEUP = [
  [26, 17, 20, 11, 8],
  [28, 18, 22, 12, 9],
] as const;
const MAKEUP_SHADES = ["bg-brand-red", "bg-brand-red/75", "bg-brand-red/55", "bg-brand-red/35", "bg-brand-red/20"];

export function MatcherPreview({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const step = usePreviewStep(ref, RADAR_LAYOUTS.length, active, 1, 2800);
  const makeup = MAKEUP[step]!;
  const total = makeup.reduce((sum, value) => sum + value, 0);

  return (
    <div ref={ref} aria-hidden="true" className="flex min-h-56 flex-1 flex-col gap-4 rounded-md border border-white/6 bg-black/40 p-4">
      <svg viewBox="0 0 200 170" className="min-h-40 w-full flex-1" preserveAspectRatio="xMidYMid meet">
        <rect x="100" y="0" width="100" height="85" className="fill-brand-red/8" />
        <line x1="100" y1="0" x2="100" y2="170" strokeWidth="0.5" className="stroke-white/25" />
        <line x1="0" y1="85" x2="200" y2="85" strokeWidth="0.5" className="stroke-white/25" />
        {RADAR_LAYOUTS[step]!.map(([cx, cy], index) => (
          <motion.circle key={index} r={index === 0 ? 7 : 5} initial={false} animate={{ cx, cy }} transition={{ ...glideTransition, delay: index * 0.05 }} strokeWidth="1.5" className={index === 0 ? "fill-brand-charcoal stroke-brand-red" : "fill-brand-charcoal stroke-white/50"} />
        ))}
        <motion.circle r="4" initial={false} animate={{ cx: YOU_POSITIONS[step]![0], cy: YOU_POSITIONS[step]![1] }} transition={glideTransition} className="fill-cyan-400" />
      </svg>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between font-mono">
          <span className="lab-label">Match makeup</span>
          <span className="text-sm tabular-nums text-brand-chalk">{total}%</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
          {makeup.map((value, index) => (
            <motion.span key={index} initial={false} animate={{ width: `${value}%` }} transition={glideTransition} className={`h-full border-r border-brand-charcoal last:border-r-0 ${MAKEUP_SHADES[index]}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SoleMatePreview({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const together = usePreviewStep(ref, 2, active, 1) === 1;

  return (
    <div ref={ref} aria-hidden="true" className="relative flex h-28 items-center justify-center overflow-hidden rounded-md border border-white/6 bg-black/40">
      <motion.svg viewBox="0 0 100 66" className="absolute h-14 w-24" initial={false} animate={{ x: together ? -6 : -56 }} transition={glideTransition}>
        <ToeBars shape="egyptian" className="fill-brand-red/80" />
      </motion.svg>
      <motion.svg viewBox="0 0 100 66" className="absolute h-14 w-24" initial={false} animate={{ x: together ? 6 : 56 }} transition={glideTransition}>
        <ToeBars shape="egyptian" className="fill-none stroke-brand-chalk stroke-2" />
      </motion.svg>
      <motion.span initial={false} animate={{ opacity: together ? 1 : 0, y: together ? 0 : 6 }} transition={glideTransition} className="absolute bottom-2 rounded-full border border-white/20 bg-brand-charcoal px-2.5 py-0.5 font-mono text-xs tabular-nums text-brand-chalk">
        Same profile
      </motion.span>
    </div>
  );
}
