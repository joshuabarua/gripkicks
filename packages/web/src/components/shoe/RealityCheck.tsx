"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RealityCheckProps {
  label: string;
  brandClaim?: number;
  communityReality?: number;
  description: string;
}

export function RealityCheck({
  label,
  brandClaim,
  communityReality,
  description,
}: RealityCheckProps) {
  // If we don't have enough data, don't show the reality check
  if (communityReality === undefined) return null;

  return (
    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-neutral-500" />
              </TooltipTrigger>
              <TooltipContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                <p className="max-w-xs text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((level) => {
            const isFilled = level <= Math.round(communityReality);
            return (
              <div
                key={level}
                className={`w-2 h-2 rounded-[1px] ${
                  isFilled ? "bg-orange-500" : "bg-neutral-700"
                }`}
              />
            );
          })}
          <span className="text-xs text-neutral-500 ml-1">
            {communityReality.toFixed(1)}/5
          </span>
        </div>
      </div>

      {brandClaim !== undefined && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500">Official Claim</span>
          <span className="text-neutral-400 font-medium">
            {brandClaim}/5
          </span>
        </div>
      )}

      {brandClaim !== undefined && brandClaim !== Math.round(communityReality) && (
        <p className="text-xs text-neutral-400 mt-2">
          {brandClaim > communityReality
            ? `Users rate this ${brandClaim - Math.round(communityReality)} points lower than the brand claims.`
            : `Users rate this ${Math.round(communityReality) - brandClaim} points higher than the brand claims.`}
        </p>
      )}
    </div>
  );
}
