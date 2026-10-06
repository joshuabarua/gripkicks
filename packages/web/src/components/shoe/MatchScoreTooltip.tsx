"use client";

import { Info } from "lucide-react";
import type { MatchSignals } from "@/types/shoe";
import { describeMatchSignal } from "@/utils/matchSignals";
import { toHundredPointScale } from "convex/utils/scoring";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MatchScoreTooltipProps {
  score: number;
  signals?: MatchSignals;
  breakdown: {
    footTypeCompatibility: number; // Max 5, weight 30%
    volumeCompatibility: number;   // Max 5, weight 20%
    userPreferenceMatch: number;   // Max 5, weight 25%
    communityApproval: number;     // Max 5, weight 15%
    overallRating: number;         // Max 5, weight 10%
    soleMateMatch: number;         // Bonus
  };
}

export function MatchScoreTooltip({ score, breakdown, signals }: MatchScoreTooltipProps) {
  // Convert scores (out of 5) to their weighted percentage contribution
  const footScorePct = ((breakdown.footTypeCompatibility / 5) * 30).toFixed(0);
  const volumeScorePct = ((breakdown.volumeCompatibility / 5) * 20).toFixed(0);
  const preferenceScorePct = ((breakdown.userPreferenceMatch / 5) * 25).toFixed(0);
  const communityScorePct = ((breakdown.communityApproval / 5) * 15).toFixed(0);
  const overallScorePct = ((breakdown.overallRating / 5) * 10).toFixed(0);
  
  const soleMateOwners = breakdown.soleMateMatch;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button type="button" aria-label={`Match breakdown: ${toHundredPointScale(score, 5)}%`} className="flex min-h-11 items-center gap-2 rounded-lg px-2 font-mono text-brand-chalk hover:bg-brand-soft-surface">
            <span className="text-xl font-semibold tabular-nums">{toHundredPointScale(score, 5)}%</span>
            <Info aria-hidden="true" className="h-4 w-4 text-brand-putty" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="end" 
          className="w-64 border border-white/40 bg-brand-surface p-4 font-mono text-brand-chalk shadow-xl shadow-black/50"
        >
          <div className="space-y-3">
            <p className="mb-2 border-b border-white/40 pb-2 text-sm font-semibold text-brand-chalk">
              Score Breakdown
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Foot Shape Match</span>
                <span className="text-brand-chalk">{describeMatchSignal(signals, "footShape") ?? `+${footScorePct}%`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Volume Match</span>
                <span className="text-brand-chalk">{describeMatchSignal(signals, "volume") ?? `+${volumeScorePct}%`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Preference Match</span>
                <span className="text-brand-chalk">{describeMatchSignal(signals, "preferences") ?? `+${preferenceScorePct}%`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Community Approval</span>
                <span className="text-green-400">+{communityScorePct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Overall Rating</span>
                <span className="text-green-400">+{overallScorePct}%</span>
              </div>
              
              {soleMateOwners > 0 && (
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-neutral-800">
                  <span className="text-cyan-400 font-medium">Sole Mates</span>
                  <span className="text-cyan-400 font-bold">{soleMateOwners} with your profile</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
