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
        <div className="flex items-center gap-2 text-sm text-white/80 cursor-help">
          <Info className="w-4 h-4" />
          <span>{getMessage()}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-gray-900 border border-gray-700">
        <p>Rate your shoes on comfort, performance, and durability to help the community make better choices.</p>
      </TooltipContent>
    </Tooltip>
  );
}
