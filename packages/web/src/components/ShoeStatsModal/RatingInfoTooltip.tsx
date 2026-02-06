'use client';

import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RatingInfoTooltipProps {
  showCommunityAverages: boolean;
  totalRatings?: number;
  hasUserRatings: boolean;
}

export default function RatingInfoTooltip({
  showCommunityAverages,
  totalRatings,
  hasUserRatings
}: RatingInfoTooltipProps) {
  const getMessage = () => {
    if (showCommunityAverages) {
      return `Community score from ${totalRatings} users. Add your rating to help improve accuracy!`;
    }
    if (!hasUserRatings) {
      return "This is a calculated baseline rank based on shoe characteristics. Add your own ratings to help others!";
    }
    return "Your personal rank. Community score will show once 3+ users rate this shoe.";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs text-neutral-500 cursor-help font-sora">
          <Info className="w-3.5 h-3.5 text-orange-500/50" />
          <span>{getMessage()}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-neutral-900 border border-neutral-700">
        <p className="font-sora text-neutral-300">Rate your shoes on comfort, performance, and durability to help the community make better choices.</p>
      </TooltipContent>
    </Tooltip>
  );
}
