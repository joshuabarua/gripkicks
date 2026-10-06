'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { UserShoe } from '@/types/api';
import { calculateDefaultStats, getEffectiveShoeStats } from './utils';
import { findMostComfy, findOldest, findMostWorn } from '@/utils/specialLabels';
import ShoeTags from './ShoeTags';
import RatingInfoTooltip from './RatingInfoTooltip';
import PersonalStatsSection from './PersonalStatsSection';
import CommunityStatsSection from './CommunityStatsSection';
import AdditionalInfo from './AdditionalInfo';
import ShoeImage from '@/components/ShoeImage';
import { Star, Crown, Clock, Heart, Edit, Trash2, X } from 'lucide-react';

const BadgeTooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap z-50 border border-brand-red/20 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-neutral-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ShoeStatsModalProps {
  shoe: UserShoe | null;
  fullShoe?: {
    aggressiveness?: string;
    climbingDiscipline?: string;
    stiffness?: string;
    volume?: string;
    rubberTechnology?: {
      compound: string;
    } | null | undefined;
    name?: string;
    brand?: string;
    avgComfortScore?: number;
    avgPerformanceRating?: number;
    avgDurabilityRating?: number;
    totalRatings?: number;
    popularityCount?: number;
    totalShoesInDatabase?: number;
    defaultScores?: {
      comfort: number;
      performance: number;
      durability: number;
    };
    enrichment?: {
      reviewStatus: "pending" | "approved" | "rejected";
    };
  } | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  rank?: number | undefined;
  onToggleFavourite?: (() => void) | undefined;
  onEditShoe?: (() => void) | undefined;
  onRemoveShoe?: (() => void) | undefined;
  userShoes?: UserShoe[];
}

export default function ShoeStatsModal({
  shoe,
  fullShoe,
  isOpen,
  onClose,
  rank,
  onToggleFavourite,
  onEditShoe,
  onRemoveShoe,
  userShoes
}: ShoeStatsModalProps) {
  if (!shoe) return null;

  const hasFullShoe = !!fullShoe;
  const fallbackDetails = shoe.shoe ?? shoe.shoeDetails;
  const shoeName = fullShoe?.name || fallbackDetails?.name || 'Unknown Shoe';
  const shoeBrand = fullShoe?.brand || fallbackDetails?.brand || 'Unknown Brand';

  const aggressiveness = hasFullShoe ? fullShoe?.aggressiveness : shoe.shoe?.aggressiveness;
  const climbingDiscipline = hasFullShoe ? fullShoe?.climbingDiscipline : shoe.shoe?.climbingDiscipline;
  const stiffness = hasFullShoe ? fullShoe?.stiffness : shoe.shoe?.stiffness;
  const volume = hasFullShoe ? fullShoe?.volume : shoe.shoe?.volume;
  const rubberTechnology = hasFullShoe ? fullShoe?.rubberTechnology : shoe.shoe?.rubberTechnology;
  const totalRatings = hasFullShoe ? fullShoe?.totalRatings : undefined;
  const avgComfortScore = hasFullShoe ? fullShoe?.avgComfortScore : undefined;
  const avgPerformanceRating = hasFullShoe ? fullShoe?.avgPerformanceRating : undefined;
  const avgDurabilityRating = hasFullShoe ? fullShoe?.avgDurabilityRating : undefined;
  const popularityCount = hasFullShoe ? fullShoe?.popularityCount : undefined;
  const totalShoesInDatabase = hasFullShoe ? fullShoe?.totalShoesInDatabase : undefined;

  const fullShoeDefaults = fullShoe?.enrichment?.reviewStatus === "approved"
    ? fullShoe.defaultScores
    : undefined;
  const stashShoeDefaults = shoe.shoe?.enrichment?.reviewStatus === "approved"
    ? shoe.shoe.defaultScores
    : undefined;
  const defaultScores = fullShoeDefaults ?? stashShoeDefaults;
  const defaultStats = calculateDefaultStats({
    aggressiveness,
    climbingDiscipline,
    stiffness,
    ...(defaultScores
      ? {
        defaultScores: {
          comfort: defaultScores.comfort,
          performance: defaultScores.performance,
          durability: defaultScores.durability,
        },
      }
      : {}),
  });
  const showCommunityAverages = !!(totalRatings && totalRatings >= 3);
  const personalStats = getEffectiveShoeStats(
    { aggressiveness, climbingDiscipline, stiffness },
    {
      comfortScore: shoe.comfortScore,
      performanceRating: shoe.performanceRating,
      durabilityRating: shoe.durabilityRating,
    },
  );

  const comfortScore = showCommunityAverages
    ? avgComfortScore ?? defaultStats.comfort
    : personalStats.comfort;
  const performanceRating = showCommunityAverages
    ? avgPerformanceRating ?? defaultStats.performance
    : personalStats.performance;
  const durabilityRating = showCommunityAverages
    ? avgDurabilityRating ?? defaultStats.durability
    : personalStats.durability;

  const hasUserRatings =
    shoe.comfortScore !== undefined ||
    shoe.performanceRating !== undefined ||
    shoe.durabilityRating !== undefined;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-neutral-950 text-white border border-white/[0.06] max-w-2xl max-h-[90dvh] overflow-y-auto p-0 rounded-lg hal-glow shadow-2xl">
          <DialogTitle className="sr-only">
            Shoe rank: {shoeName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View detailed rank and ratings for the {shoeName} climbing shoe including comfort, performance, and durability ratings.
          </DialogDescription>

          <div className="relative p-fluid-lg border-b border-white/[0.06]">
            <div className="absolute inset-0 opacity-[0.07]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
            </div>

            <div className="absolute top-fluid-sm right-fluid-sm flex items-center gap-fluid-xs z-10">
              {onToggleFavourite && (
                <button
                  aria-label="Toggle favourite"
                  onClick={onToggleFavourite}
                  className="w-8 h-8 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-300 border border-white/[0.06]"
                >
                  <Star className={`w-3.5 h-3.5 ${shoe.isFavourite ? 'fill-brand-red text-brand-red' : 'text-neutral-600'}`} />
                </button>
              )}
              {onEditShoe && (
                <button
                  aria-label="Edit shoe"
                  onClick={onEditShoe}
                  className="w-8 h-8 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-300 border border-white/[0.06]"
                >
                  <Edit className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              )}
              {onRemoveShoe && (
                <button
                  aria-label="Remove shoe"
                  onClick={onRemoveShoe}
                  className="w-8 h-8 rounded-sm bg-white/[0.04] hover:bg-red-950/50 flex items-center justify-center transition-colors duration-300 border border-white/[0.06]"
                >
                  <Trash2 className="w-3.5 h-3.5 text-neutral-600 hover:text-red-400" />
                </button>
              )}
              <button
                aria-label="Close"
                onClick={onClose}
                className="w-8 h-8 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors duration-300 border border-white/[0.06]"
              >
                <X className="w-3.5 h-3.5 text-neutral-600" />
              </button>
            </div>

            <div className="relative flex items-center gap-5">
              <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-brand-charcoal border border-white/[0.06] p-1">
                <div className="w-full h-full rounded-md overflow-hidden bg-neutral-800">
                  <ShoeImage
                    brand={shoeBrand}
                    shoeName={shoeName}
                    imageUrl={fallbackDetails?.imageUrl}
                    slug={fallbackDetails?.slug}
                    className=""
                    gender={fallbackDetails?.gender}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-fluid-sm flex-wrap">
                  <h2 className="text-fluid-2xl font-bold font-so-cloudy uppercase">{shoeName}</h2>
                  <div className="flex items-center gap-1.5">
                    {rank && (
                      <BadgeTooltip text={`Rank #${rank} in your collection`}>
                        <div className="bg-brand-red text-black text-[10px] font-bold rounded-sm w-6 h-6 flex items-center justify-center">
                          #{rank}
                        </div>
                      </BadgeTooltip>
                    )}
                    {shoe.isFavourite && (
                      <BadgeTooltip text="Favorite shoe">
                        <div className="bg-brand-red/20 text-brand-red rounded-sm w-6 h-6 flex items-center justify-center border border-brand-red/30">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </BadgeTooltip>
                    )}
                    {userShoes && findMostComfy(userShoes)?._id === shoe._id && (
                        <BadgeTooltip text="Most comfortable shoe">
                          <div className="bg-pink-500/20 text-pink-400 rounded-full w-6 h-6 flex items-center justify-center border border-pink-500/30">
                            <Heart className="w-3 h-3 fill-current" />
                          </div>
                        </BadgeTooltip>
                      )}
                    {userShoes && findOldest(userShoes)?._id === shoe._id && (
                        <BadgeTooltip text="Oldest shoe">
                          <div className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center border border-blue-500/30">
                            <Clock className="w-3 h-3" />
                          </div>
                        </BadgeTooltip>
                      )}
                    {userShoes && findMostWorn(userShoes)?._id === shoe._id && (
                        <BadgeTooltip text="Most worn shoe">
                          <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex items-center justify-center border border-purple-500/30">
                            <Crown className="w-3 h-3 fill-current" />
                          </div>
                        </BadgeTooltip>
                      )}
                  </div>
                </div>
                <p className="text-brand-putty/40 font-mono text-fluid-sm mt-fluid-xs">{shoeBrand}</p>
              </div>
            </div>
          </div>

          <div className="p-fluid-lg space-y-fluid-md">
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
              popularityCount={popularityCount}
              totalShoesInDatabase={totalShoesInDatabase}
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
