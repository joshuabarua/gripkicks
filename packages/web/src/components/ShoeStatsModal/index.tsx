'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { UserShoe } from '@/types/api';
import { calculateDefaultStats } from './utils';
import ShoeTags from './ShoeTags';
import RatingInfoTooltip from './RatingInfoTooltip';
import PersonalStatsSection from './PersonalStatsSection';
import CommunityStatsSection from './CommunityStatsSection';
import AdditionalInfo from './AdditionalInfo';
import ShoeImage from '@/components/ShoeImage';
import { Star, Crown, Clock, Heart, Edit, Trash2, X } from 'lucide-react';

// Tooltip component
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
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap z-50">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-black/80"></div>
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
    } | null;
    name?: string;
    brand?: string;
    avgComfortScore?: number;
    avgPerformanceRating?: number;
    avgDurabilityRating?: number;
    totalRatings?: number;
    popularityCount?: number;
    totalShoesInDatabase?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  rank?: number;
  onToggleFavourite?: () => void;
  onEditShoe?: () => void;
  onRemoveShoe?: () => void;
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
  const popularityCount = hasFullShoe ? fullShoe?.popularityCount : undefined;
  const totalShoesInDatabase = hasFullShoe ? fullShoe?.totalShoesInDatabase : undefined;

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
            Shoe Rank - {shoeName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View detailed rank and ratings for the {shoeName} climbing shoe including comfort, performance, and durability ratings.
          </DialogDescription>

          <div className="relative bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-6 border-b border-white/30">
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {onToggleFavourite && (
                <button
                  onClick={onToggleFavourite}
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  <Star className={`w-5 h-5 ${shoe.isFavourite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
              )}
              {onEditShoe && (
                <button
                  onClick={onEditShoe}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              {onRemoveShoe && (
                <button
                  onClick={onRemoveShoe}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Shoe Image - Curved */}
              <div className="w-28 h-28 flex-shrink-0 rounded-full overflow-hidden bg-white/20 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <ShoeImage
                    brand={shoeBrand}
                    shoeName={shoeName}
                    imageUrl={shoe.shoe.imageUrl}
                    className="w-full h-full object-contain"
                    transformation={[
                      {
                        height: 200,
                        width: 200,
                        format: "auto",
                        quality: 80
                      }
                    ]}
                  />
                </div>
              </div>

              {/* Title and badges inline */}
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="flex items-center gap-10">
                    <h2 className="text-2xl font-bold font-so-cloudy uppercase">{shoeName}</h2>
                    {/* Rank and badges inline with title */}
                    <div className="flex items-center gap-2">
                      {/* Rank badge */}
                      {rank && (
                        <BadgeTooltip text={`Rank #${rank} in your collection`}>
                          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                            #{rank}
                          </div>
                        </BadgeTooltip>
                      )}
                      {/* Favourite star */}
                      {shoe.isFavourite && (
                        <BadgeTooltip text="Favorite shoe">
                          <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                        </BadgeTooltip>
                      )}
                      {/* Most comfortable */}
                      {userShoes && userShoes.length > 1 && shoe.comfortScore && shoe.comfortScore > 0 && shoe === userShoes.reduce((prev: UserShoe, current: UserShoe) =>
                        (current.comfortScore || 0) > (prev.comfortScore || 0) ? current : prev
                      ) && (
                          <BadgeTooltip text="Most comfortable shoe">
                            <div className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                              <Heart className="w-3 h-3 fill-current" />
                            </div>
                          </BadgeTooltip>
                        )}
                      {/* Oldest shoe */}
                      {userShoes && userShoes.length > 1 && shoe.purchaseDate && shoe === [...userShoes].filter(s => s.purchaseDate).reduce((prev: UserShoe, current: UserShoe) =>
                        new Date(current.purchaseDate!).getTime() < new Date(prev.purchaseDate!).getTime() ? current : prev
                      ) && (
                          <BadgeTooltip text="Oldest shoe">
                            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                              <Clock className="w-3 h-3" />
                            </div>
                          </BadgeTooltip>
                        )}
                      {/* Most worn */}
                      {userShoes && userShoes.length > 1 && shoe.condition && shoe === [...userShoes].filter(s => s.condition).reduce((prev: UserShoe, current: UserShoe) => {
                        const conditionOrder = { 'worn': 0, 'fair': 1, 'good': 2, 'excellent': 3, 'new': 4 };
                        const prevOrder = conditionOrder[current.condition as keyof typeof conditionOrder] ?? 999;
                        const currentOrder = conditionOrder[prev.condition as keyof typeof conditionOrder] ?? 999;
                        return currentOrder < prevOrder ? current : prev;
                      }) && (
                          <BadgeTooltip text="Most worn shoe">
                            <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                              <Crown className="w-3 h-3 fill-current" />
                            </div>
                          </BadgeTooltip>
                        )}
                    </div>
                  </div>
                  <p className="text-orange-100">{shoeBrand}</p>
                </div>


              </div>
            </div>
          </div>

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
