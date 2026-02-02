'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { UserShoe } from '@/types/api';
import { calculateDefaultStats } from './utils';
import ShoeStatsHeader from './ShoeStatsHeader';
import ShoeTags from './ShoeTags';
import RatingInfoTooltip from './RatingInfoTooltip';
import PersonalStatsSection from './PersonalStatsSection';
import CommunityStatsSection from './CommunityStatsSection';
import AdditionalInfo from './AdditionalInfo';

interface ShoeStatsModalProps {
  shoe: UserShoe | null;
  fullShoe?: {
    aggressiveness?: string;
    climbingDiscipline?: string;
    stiffness?: string;
    volume?: string;
    rubberTechnology?: {
      compound: string;
    } | null;
    name: string;
    brand: string;
    avgComfortScore?: number;
    avgPerformanceRating?: number;
    avgDurabilityRating?: number;
    totalRatings?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  rank?: number;
  onToggleFavourite?: () => void;
  onEditShoe?: () => void;
  onRemoveShoe?: () => void;
}

export default function ShoeStatsModal({
  shoe,
  fullShoe,
  isOpen,
  onClose,
  rank,
  onToggleFavourite,
  onEditShoe,
  onRemoveShoe
}: ShoeStatsModalProps) {
  if (!shoe) return null;

  const hasFullShoe = !!fullShoe;
  const shoeName = fullShoe?.name || shoe.shoe.name;
  const shoeBrand = fullShoe?.brand || shoe.shoe.brand;

  const aggressiveness = hasFullShoe ? fullShoe?.aggressiveness : undefined;
  const climbingDiscipline = hasFullShoe ? fullShoe?.climbingDiscipline : undefined;
  const stiffness = hasFullShoe ? fullShoe?.stiffness : undefined;
  const volume = hasFullShoe ? fullShoe?.volume : undefined;
  const rubberTechnology = hasFullShoe ? fullShoe?.rubberTechnology : undefined;
  const totalRatings = hasFullShoe ? fullShoe?.totalRatings : undefined;
  const avgComfortScore = hasFullShoe ? fullShoe?.avgComfortScore : undefined;
  const avgPerformanceRating = hasFullShoe ? fullShoe?.avgPerformanceRating : undefined;
  const avgDurabilityRating = hasFullShoe ? fullShoe?.avgDurabilityRating : undefined;

  const defaultStats = calculateDefaultStats({ aggressiveness, climbingDiscipline, stiffness });
  const showCommunityAverages = !!(totalRatings && totalRatings >= 3);

  const comfortScore = showCommunityAverages
    ? avgComfortScore || defaultStats.comfort
    : shoe.comfortScore || defaultStats.comfort;
  const performanceRating = showCommunityAverages
    ? avgPerformanceRating || defaultStats.performance
    : shoe.performanceRating || defaultStats.performance;
  const durabilityRating = showCommunityAverages
    ? avgDurabilityRating || defaultStats.durability
    : shoe.durabilityRating || defaultStats.durability;

  const hasUserRatings = !!(shoe.comfortScore || shoe.performanceRating || shoe.durabilityRating);

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 text-gray-100 border border-white/30 max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            Shoe Stats - {shoeName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View detailed statistics and ratings for the {shoeName} climbing shoe including comfort, performance, and durability ratings.
          </DialogDescription>

          <ShoeStatsHeader
            shoeName={shoeName}
            shoeBrand={shoeBrand}
            rank={rank}
            isFavourite={shoe.isFavourite}
            onToggleFavourite={onToggleFavourite}
            onEditShoe={onEditShoe}
            onRemoveShoe={onRemoveShoe}
            onClose={onClose}
          />

          <div className="p-6 space-y-6">
            <ShoeTags
              aggressiveness={aggressiveness}
              climbingDiscipline={climbingDiscipline}
              stiffness={stiffness}
              volume={volume}
              rubberCompound={rubberTechnology?.compound}
            />

            <RatingInfoTooltip
              showCommunityAverages={showCommunityAverages}
              totalRatings={totalRatings}
              hasUserRatings={hasUserRatings}
            />

            <PersonalStatsSection
              comfortScore={shoe.comfortScore}
              performanceRating={shoe.performanceRating}
              durabilityRating={shoe.durabilityRating}
              defaultStats={defaultStats}
            />

            <CommunityStatsSection
              showCommunityAverages={showCommunityAverages}
              totalRatings={totalRatings}
              comfortScore={comfortScore}
              performanceRating={performanceRating}
              durabilityRating={durabilityRating}
            />

            <AdditionalInfo
              size={shoe.size}
              condition={shoe.condition}
              purchaseDate={shoe.purchaseDate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
