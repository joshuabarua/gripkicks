"use client";

import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

const MILESTONES = [
  { threshold: 50, label: "Foot profiles active", description: "Matchers start ranking by fit" },
  { threshold: 100, label: "Community ratings", description: "Sole Mate matching goes live" },
  { threshold: 250, label: "Shoe data points", description: "Radar map gets real density" },
  { threshold: 500, label: "Climbing community", description: "Brand drift arrows activate" },
];

const MAX_THRESHOLD = 500;

interface CommunityMilestoneProps {
  userCount: number;
}

export function CommunityMilestone({ userCount }: CommunityMilestoneProps) {
  const count = userCount;
  const nextMilestone = MILESTONES.find((m) => m.threshold > count) ?? null;

  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto">

        {/* Big counter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="text-center mb-fluid-2xl"
        >
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">
            Community Counter
          </p>
          <div className="flex items-baseline justify-center gap-3">
            <span className="font-ball-pill text-7xl md:text-9xl text-brand-chalk leading-none">
              {count}
            </span>
          </div>
          <p className="font-sora text-neutral-500 mt-2">
            {count === 1 ? "climber" : "climbers"} building the database
          </p>

          {nextMilestone && count < nextMilestone.threshold && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-brand-charcoal/50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              <span className="font-sora text-xs text-neutral-400">
                {nextMilestone.threshold - count} away from {nextMilestone.label.toLowerCase()}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Mission rail */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Track background */}
          <div className="absolute left-0 right-0 top-[19px] h-px bg-neutral-800" />

          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(count / MAX_THRESHOLD) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-0 top-[19px] h-px bg-brand-red"
          />

          {/* Milestone nodes */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            {MILESTONES.map((m, i) => {
              const reached = count >= m.threshold;
              const pct = Math.min(100, (count / m.threshold) * 100);
              return (
                <motion.div
                  key={m.threshold}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Dot */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-500 ${
                      reached
                        ? "bg-brand-red border-brand-red text-black"
                        : "bg-black border-neutral-700 text-neutral-600"
                    }`}
                  >
                    {reached ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Label stack */}
                  <div className="mt-5 space-y-1">
                    <span className="font-ball-pill text-2xl text-brand-chalk">
                      {m.threshold}
                    </span>
                    <p className="font-sora text-sm text-white">{m.label}</p>
                    <p className="font-sora text-xs text-brand-putty/70 max-w-[160px] mx-auto">
                      {m.description}
                    </p>

                    {/* Mini progress for current milestone */}
                    {!reached && count > 0 && (
                      <div className="pt-2 w-full max-w-[120px] mx-auto">
                        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                            className="h-full rounded-full bg-neutral-600"
                          />
                        </div>
                        <p className="font-sora text-[10px] text-neutral-500 mt-1 tabular-nums">
                          {count} / {m.threshold}
                        </p>
                      </div>
                    )}

                    {reached && (
                      <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-brand-red">
                        Unlocked
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
