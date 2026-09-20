"use client";

import { motion } from "framer-motion";

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
  const globalPct = Math.min(100, (count / MAX_THRESHOLD) * 100);

  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative overflow-hidden border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto">

        <div className="text-center mb-16">
          <p className="font-sora text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">
            Community Status
          </p>
          <div className="flex flex-col items-center justify-center">
            <span className="font-ball-pill text-8xl md:text-9xl text-brand-chalk leading-none tracking-tight">
              {count}
            </span>
            <p className="font-sora text-sm text-neutral-400 mt-4 tracking-wide">
              {count === 1 ? "climber" : "climbers"} building the database
            </p>
          </div>

          {nextMilestone && count < nextMilestone.threshold && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.06] bg-neutral-900/50 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              <span className="font-sora text-xs text-neutral-400 tracking-wide">
                {nextMilestone.threshold - count} more to activate {nextMilestone.label.toLowerCase()}
              </span>
            </motion.div>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-neutral-900/60 hidden md:block" />
          
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${globalPct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-brand-red hidden md:block origin-left"
          />

          <div className="overflow-x-auto flex gap-6 md:gap-8 pb-8 px-4 md:px-0 scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible">
            {MILESTONES.map((m, i) => {
              const reached = count >= m.threshold;
              const isCurrentNext = nextMilestone?.threshold === m.threshold;
              
              return (
                <motion.div
                  key={m.threshold}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="snap-center shrink-0 w-[280px] md:w-auto relative"
                >
                  <div className={`h-full rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                    reached 
                      ? "bg-neutral-900/40 border-brand-red/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" 
                      : isCurrentNext
                      ? "bg-neutral-900/20 border-white/[0.08]"
                      : "bg-neutral-950/10 border-white/[0.03] opacity-60"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className={`font-ball-pill text-3xl tracking-tight leading-none ${
                          reached ? "text-brand-red" : "text-neutral-500"
                        }`}>
                          {m.threshold}
                        </span>
                        
                        <div className={`px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-wider font-sora ${
                          reached
                            ? "bg-brand-red/10 border-brand-red/20 text-brand-red"
                            : isCurrentNext
                            ? "bg-white/[0.02] border-white/[0.08] text-brand-chalk"
                            : "bg-transparent border-transparent text-neutral-600"
                        }`}>
                          {reached ? "Active" : isCurrentNext ? "Next Up" : "Locked"}
                        </div>
                      </div>

                      <h3 className={`font-sora text-base font-semibold tracking-tight transition-colors duration-300 ${
                        reached ? "text-white" : "text-neutral-400"
                      }`}>
                        {m.label}
                      </h3>
                      <p className="font-sora text-xs text-neutral-500 mt-2 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-64 h-[3px] bg-neutral-900 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${globalPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-brand-red rounded-full absolute left-0 top-0"
            />
          </div>
          <div className="flex justify-between w-64 text-[10px] font-sora uppercase tracking-wider text-neutral-600">
            <span>0</span>
            <span className="text-neutral-500">Database Progress</span>
            <span>{MAX_THRESHOLD}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
