"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MatchScoreTooltipProps {
  score: number;
  breakdown: {
    footTypeCompatibility: number; // Max 5, weight 30%
    volumeCompatibility: number;   // Max 5, weight 20%
    userPreferenceMatch: number;   // Max 5, weight 25%
    communityApproval: number;     // Max 5, weight 15%
    overallRating: number;         // Max 5, weight 10%
    soleMateMatch: number;         // Bonus
  };
}

export function MatchScoreTooltip({ score, breakdown }: MatchScoreTooltipProps) {
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
          <div className="cursor-help flex items-center gap-1.5 transition-opacity hover:opacity-80">
            <span className="text-2xl font-bold text-white">{Math.round((score / 5) * 100)}%</span>
            <Info className="w-4 h-4 text-orange-500/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="end" 
          className="bg-neutral-950 border border-neutral-800 p-4 w-64 shadow-xl shadow-black/50"
        >
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-2">
              Score Breakdown
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Foot Shape Match</span>
                <span className="text-green-400">+{footScorePct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Volume Match</span>
                <span className="text-green-400">+{volumeScorePct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Preference Match</span>
                <span className="text-green-400">+{preferenceScorePct}%</span>
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
