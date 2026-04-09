"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFootProfileStore } from "@/stores/footProfileStore";
import { CheckCircle, Circle } from "lucide-react";

interface DataContributionNudgeProps {
  stashCount: number;
  ratedCount: number;
}

interface ContributionStep {
  label: string;
  done: boolean;
  href?: string;
}

export function DataContributionNudge({
  stashCount,
  ratedCount,
}: DataContributionNudgeProps) {
  const { profile: footProfile } = useFootProfileStore();

  const steps: ContributionStep[] = useMemo(
    () => [
      {
        label: "Set foot shape",
        done: !!footProfile?.shape,
        href: "/footscan",
      },
      {
        label: "Set foot volume",
        done: !!footProfile?.volume,
        href: "/footscan",
      },
      {
        label: "Add a shoe to your Sanctuary",
        done: stashCount > 0,
        href: "/stash",
      },
      {
        label: "Rate a shoe you own",
        done: ratedCount > 0,
        href: "/stash",
      },
    ],
    [footProfile, stashCount, ratedCount],
  );

  const completedCount = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const isComplete = completedCount === totalSteps;

  if (isComplete) return null;

  const progressPct = (completedCount / totalSteps) * 100;
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-sora text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-0.5">
            Recommendation accuracy
          </p>
          <p className="font-sora text-sm text-white">
            {completedCount}/{totalSteps} signals provided
          </p>
        </div>
        <span className="font-tanker text-2xl text-brand-red">
          {Math.round(progressPct)}%
        </span>
      </div>

      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-brand-red rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            {step.done ? (
              <CheckCircle className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-neutral-700 flex-shrink-0" />
            )}
            <span
              className={`font-sora text-xs ${step.done ? "text-neutral-600 line-through" : "text-neutral-400"}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {nextStep?.href && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <Link
            href={nextStep.href}
            className="font-sora text-xs text-brand-red hover:text-brand-red/80 transition-colors"
          >
            {nextStep.label} →
          </Link>
        </div>
      )}
    </div>
  );
}
