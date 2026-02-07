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
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap z-50 border border-orange-500/20 shadow-xl">
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
        <DialogContent className="bg-neutral-950 text-white border border-neutral-800 max-w-2xl p-0 overflow-hidden rounded-3xl shadow-2xl shadow-orange-500/5">
          <DialogTitle className="sr-only">
            Shoe Rank - {shoeName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            View detailed rank and ratings for the {shoeName} climbing shoe including comfort, performance, and durability ratings.
          </DialogDescription>

          <div className="relative p-6 border-b border-neutral-800">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
              {onToggleFavourite && (
                <button
                  onClick={onToggleFavourite}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                >
                  <Star className={`w-4 h-4 ${shoe.isFavourite ? 'fill-orange-500 text-orange-500' : 'text-neutral-500'}`} />
                </button>
              )}
              {onEditShoe && (
                <button
                  onClick={onEditShoe}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
                >
                  <Edit className="w-4 h-4 text-neutral-400" />
                </button>
              )}
              {onRemoveShoe && (
                <button
                  onClick={onRemoveShoe}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-red-900/50 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div className="relative flex items-center gap-5">
              <div className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 p-1">
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-700">
                  <ShoeImage
                    brand={shoeBrand}
                    shoeName={shoeName}
                    imageUrl={shoe.shoe.imageUrl}
                    className=""
                  />
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] text-orange-500 tracking-[0.2em] mb-1">[SHOE_STATS]</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold font-so-cloudy uppercase">{shoeName}</h2>
                  <div className="flex items-center gap-1.5">
                    {rank && (
                      <BadgeTooltip text={`Rank #${rank} in your collection`}>
                        <div className="bg-orange-500 text-black text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          #{rank}
                        </div>
                      </BadgeTooltip>
                    )}
                    {shoe.isFavourite && (
                      <BadgeTooltip text="Favorite shoe">
                        <div className="bg-orange-500/20 text-orange-500 rounded-full w-6 h-6 flex items-center justify-center border border-orange-500/30">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </BadgeTooltip>
                    )}
                    {userShoes && userShoes.length > 1 && shoe.comfortScore && shoe.comfortScore > 0 && shoe === userShoes.reduce((prev: UserShoe, current: UserShoe) =>
                      (current.comfortScore || 0) > (prev.comfortScore || 0) ? current : prev
                    ) && (
                        <BadgeTooltip text="Most comfortable shoe">
                          <div className="bg-pink-500/20 text-pink-400 rounded-full w-6 h-6 flex items-center justify-center border border-pink-500/30">
                            <Heart className="w-3 h-3 fill-current" />
                          </div>
                        </BadgeTooltip>
                      )}
                    {userShoes && userShoes.length > 1 && shoe.purchaseDate && shoe === [...userShoes].filter(s => s.purchaseDate).reduce((prev: UserShoe, current: UserShoe) =>
                      new Date(current.purchaseDate!).getTime() < new Date(prev.purchaseDate!).getTime() ? current : prev
                    ) && (
                        <BadgeTooltip text="Oldest shoe">
                          <div className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center border border-blue-500/30">
                            <Clock className="w-3 h-3" />
                          </div>
                        </BadgeTooltip>
                      )}
                    {userShoes && userShoes.length > 1 && shoe.condition && shoe === [...userShoes].filter(s => s.condition).reduce((prev: UserShoe, current: UserShoe) => {
                      const conditionOrder = { 'worn': 0, 'fair': 1, 'good': 2, 'excellent': 3, 'new': 4 };
                      const prevOrder = conditionOrder[current.condition as keyof typeof conditionOrder] ?? 999;
                      const currentOrder = conditionOrder[prev.condition as keyof typeof conditionOrder] ?? 999;
                      return currentOrder < prevOrder ? current : prev;
                    }) && (
                        <BadgeTooltip text="Most worn shoe">
                          <div className="bg-purple-500/20 text-purple-400 rounded-full w-6 h-6 flex items-center justify-center border border-purple-500/30">
                            <Crown className="w-3 h-3 fill-current" />
                          </div>
                        </BadgeTooltip>
                      )}
                  </div>
                </div>
                <p className="text-neutral-500 font-sora text-sm mt-1">{shoeBrand}</p>
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
