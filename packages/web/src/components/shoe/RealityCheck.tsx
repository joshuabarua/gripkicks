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
  if (brandClaim === undefined || communityReality === undefined) return null;

  const brandPct = (brandClaim / 5) * 100;
  const communityPct = (communityReality / 5) * 100;
  const delta = communityReality - brandClaim;
  const deltaAbs = Math.abs(delta).toFixed(1);
  const isHigher = delta > 0.1;
  const isLower = delta < -0.1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-300">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-neutral-600" />
              </TooltipTrigger>
              <TooltipContent className="bg-neutral-900 border-neutral-700 text-neutral-200">
                <p className="max-w-xs text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isHigher && (
          <span className="text-[10px] font-medium text-green-400 bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">
            +{deltaAbs} vs brand
          </span>
        )}
        {isLower && (
          <span className="text-[10px] font-medium text-brand-red bg-brand-red/10 border border-brand-red/20 px-1.5 py-0.5 rounded-full">
            -{deltaAbs} vs brand
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600 w-16 shrink-0">Brand</span>
          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-500 rounded-full transition-all"
              style={{ width: `${brandPct}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-500 w-6 text-right">{brandClaim}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600 w-16 shrink-0">Community</span>
          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-red rounded-full transition-all"
              style={{ width: `${communityPct}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-500 w-6 text-right">{communityReality.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
