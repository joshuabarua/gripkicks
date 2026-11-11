"use client";

import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DataContributionNudgeProps {
  stashCount: number;
  ratedCount: number;
}

interface ContributionStep {
  label: string;
  done: boolean;
}

export function DataContributionNudge({ stashCount, ratedCount }: DataContributionNudgeProps) {
  const { convexUser, isLoading } = useCurrentUser();
  const steps: ContributionStep[] = useMemo(() => [
    { label: "Set foot shape", done: !!convexUser?.footShape },
    { label: "Set foot volume", done: !!convexUser?.footVolume },
    { label: "Add a shoe to your Sanctuary", done: stashCount > 0 },
    { label: "Rate a shoe you own", done: ratedCount > 0 },
  ], [convexUser, stashCount, ratedCount]);
  const completedCount = steps.filter((step) => step.done).length;
  const nextStep = steps.find((step) => !step.done);

  if (isLoading || !nextStep) return null;

  return (
    <section aria-label="Profile and ratings progress" className="flex flex-col justify-between gap-4 rounded-2xl border border-white/40 bg-brand-surface p-fluid-lg sm:flex-row sm:items-center">
      <div>
        <h2 className="font-mono text-base font-semibold text-brand-chalk">Profile and ratings</h2>
        <p className="mt-2 font-mono text-sm text-brand-putty">{completedCount}/{steps.length} signals provided</p>
      </div>
      <p className="shrink-0 font-mono text-sm text-brand-putty">Next: {nextStep.label}</p>
    </section>
  );
}
