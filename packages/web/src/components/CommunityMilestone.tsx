"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const MILESTONES = [
  { threshold: 50, label: "Foot profiles active", description: "Matchers start ranking by fit" },
  { threshold: 100, label: "Community ratings", description: "Sole Mate matching goes live" },
  { threshold: 250, label: "Shoe data points", description: "Radar map gets real density" },
  { threshold: 500, label: "Climbing community", description: "Brand drift arrows activate" },
];

export function CommunityMilestone() {
  const countData = useQuery(api.users.getCount);
  const count = countData?.count ?? 0;

  return (
    <section className="bg-black py-fluid-3xl px-fluid-md relative contain-content border-t border-white/[0.06]">
      <div className="max-w-fluid-xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="mb-fluid-2xl"
        >
          <h2 className="font-ball-pill text-4xl md:text-5xl leading-[0.9] text-brand-chalk max-w-2xl">
            Built together. <span className="text-brand-red">Growing daily.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06]">
          {MILESTONES.map((m, i) => {
            const reached = count >= m.threshold;
            const pct = Math.min(100, (count / m.threshold) * 100);
            return (
              <motion.div
                key={m.threshold}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                className={`bg-black p-6 md:p-8 flex flex-col gap-4 ${reached ? "border border-brand-red/20" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-ball-pill text-3xl md:text-4xl text-brand-chalk">
                    {m.threshold}
                  </span>
                  {reached && (
                    <span className="font-sora text-[10px] uppercase tracking-[0.2em] text-brand-red">
                      Reached
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-sora text-sm text-white">{m.label}</p>
                  <p className="font-sora text-xs text-brand-putty/70">{m.description}</p>
                </div>

                <div className="mt-auto">
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                      className={`h-full rounded-full ${reached ? "bg-brand-red" : "bg-neutral-600"}`}
                    />
                  </div>
                  <p className="font-sora text-[10px] text-neutral-400 mt-2 tabular-nums">
                    {count} / {m.threshold}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
