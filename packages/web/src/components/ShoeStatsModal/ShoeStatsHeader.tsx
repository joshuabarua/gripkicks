'use client';

import { Star, Edit, Trash2, X } from 'lucide-react';

interface ShoeStatsHeaderProps {
  shoeName: string;
  shoeBrand: string;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  onEditShoe?: () => void;
  onRemoveShoe?: () => void;
  onClose: () => void;
}

export default function ShoeStatsHeader({
  shoeName,
  shoeBrand,
  isFavourite,
  onToggleFavourite,
  onEditShoe,
  onRemoveShoe,
  onClose
}: ShoeStatsHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-orange-600/20 to-amber-600/20 p-6 border-b border-white/30">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {onToggleFavourite && (
          <button
            onClick={onToggleFavourite}
            className="text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <Star className={`w-5 h-5 ${isFavourite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
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

      <div>
        <h2 className="text-2xl font-bold font-so-cloudy uppercase">{shoeName}</h2>
        <p className="text-orange-100">{shoeBrand}</p>
      </div>
    </div>
  );
}
