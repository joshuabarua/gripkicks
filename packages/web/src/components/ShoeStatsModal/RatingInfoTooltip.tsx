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
      return `Community score based on ${totalRatings} member ratings.`;
    }
    if (!hasUserRatings) {
      return "Not rated yet. Add your own comfort, performance, and durability ratings.";
    }
    return "Your personal ratings are saved. Community score will appear once 3 or more members rate this shoe.";
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
        <p className="font-sora text-neutral-300">Ratings stay unrated until you set them. Community score only appears once enough member ratings exist.</p>
      </TooltipContent>
    </Tooltip>
  );
}
