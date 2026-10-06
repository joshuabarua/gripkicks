"use client";

import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

const MILESTONES = [
  { threshold: 50, label: "Foot profiles", description: "Better fit patterns" },
  { threshold: 100, label: "Community ratings", description: "More useful comparisons" },
  { threshold: 250, label: "Shoe data", description: "Deeper catalog signals" },
  { threshold: 500, label: "Climbing community", description: "Stronger recommendations" },
];

const MAX_THRESHOLD = 500;

function getRailProgress(count: number) {
  const clamped = Math.min(MAX_THRESHOLD, Math.max(0, count));
  const stages = [
    { start: 0, end: 50, from: 0, to: 12.5 },
    { start: 50, end: 100, from: 12.5, to: 37.5 },
    { start: 100, end: 250, from: 37.5, to: 62.5 },
    { start: 250, end: 500, from: 62.5, to: 87.5 },
  ] as const;
  const stage = stages.find(({ end }) => clamped <= end) ?? stages[3];
  return stage.from + ((clamped - stage.start) / (stage.end - stage.start)) * (stage.to - stage.from);
}

export function CommunityMilestone({ userCount }: { userCount?: number | undefined }) {
  const isLoaded = userCount !== undefined;
  const count = userCount ?? 0;
  const nextMilestone = MILESTONES.find((milestone) => milestone.threshold > count) ?? null;
  const progress = getRailProgress(count);

  return (
    <section aria-labelledby="community-title" className="relative overflow-hidden border-t border-white/[0.06] bg-black px-fluid-md py-fluid-3xl md:px-fluid-xl">
      <div aria-hidden="true" className="absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-red/15 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-fluid-xl">
        <h2 id="community-title" className="font-ball-pill text-fluid-5xl leading-none">COMMUNITY BUILT</h2>
        {isLoaded ? (
          <div className="mt-fluid-md">
            <p className="font-ball-pill text-fluid-6xl leading-none tabular-nums">{count}</p>
            <p className="mt-2 font-mono text-sm text-brand-putty">
              {count === 1 ? "climber" : "climbers"} building the database
            </p>
            <p className="lab-card-active mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs text-brand-chalk">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-red" />
              {nextMilestone ? `${nextMilestone.threshold - count} to unlock ${nextMilestone.label.toLowerCase()}` : "All milestones unlocked"}
            </p>
          </div>
        ) : (
          <p role="status" aria-label="Loading community count" className="mt-fluid-md font-mono text-sm text-brand-putty">Loading community count…</p>
        )}

        {isLoaded && (
        <div className="mt-fluid-xl overflow-x-auto">
          <div className="relative min-w-[44rem]">
            <div aria-hidden="true" className="absolute left-0 right-[12.5%] top-[19px] h-px bg-neutral-800" />
            <motion.div
              aria-hidden="true"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute left-0 top-[19px] h-px bg-brand-red"
            />
            <ol className="relative grid grid-cols-4 gap-8">
              {MILESTONES.map((milestone) => {
                const reached = count >= milestone.threshold;
                const current = Math.min(count, milestone.threshold);
                return (
                  <li key={milestone.threshold} className="flex flex-col items-center text-center">
                    <div
                      role="img"
                      aria-label={reached ? `${milestone.label} unlocked` : `${milestone.label} locked`}
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-500 ${
                        reached
                          ? "border-brand-red bg-brand-red text-black"
                          : "border-neutral-700 bg-black text-neutral-600"
                      }`}
                    >
                      {reached ? <Unlock aria-hidden="true" className="h-4 w-4" /> : <Lock aria-hidden="true" className="h-4 w-4" />}
                    </div>
                    <div className="mt-5 space-y-1">
                      <span className="block font-ball-pill text-2xl text-brand-chalk">{milestone.threshold}</span>
                      <p className="font-mono text-sm text-white">{milestone.label}</p>
                      <p className="mx-auto max-w-[160px] font-mono text-xs text-brand-putty/70">{milestone.description}</p>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-brand-putty/60">
                        {reached ? "Unlocked" : `${current} / ${milestone.threshold}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
