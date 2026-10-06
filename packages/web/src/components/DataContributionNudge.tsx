"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DataContributionNudgeProps {
  stashCount: number;
  ratedCount: number;
}

interface ContributionStep {
  label: string;
  done: boolean;
  href?: string;
}

export function DataContributionNudge({ stashCount, ratedCount }: DataContributionNudgeProps) {
  const { convexUser, isLoading } = useCurrentUser();
  const steps: ContributionStep[] = useMemo(() => [
    { label: "Set foot shape", done: !!convexUser?.footShape, href: "/footlab" },
    { label: "Set foot volume", done: !!convexUser?.footVolume, href: "/footlab" },
    { label: "Add a shoe to your Sanctuary", done: stashCount > 0, href: "/stash" },
    { label: "Rate a shoe you own", done: ratedCount > 0, href: "/stash" },
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
      {nextStep.href && <Link href={nextStep.href} className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-brand-red px-5 py-3 font-mono text-sm font-semibold text-black hover:bg-brand-red/90">{nextStep.label}</Link>}
    </section>
  );
}
