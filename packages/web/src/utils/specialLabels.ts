import { createElement, type ReactNode } from 'react';
import { Clock, Crown, Heart } from 'lucide-react';
import type { UserShoe } from '@/types/api';

export type SpecialLabelType = 'most-worn' | 'oldest' | 'most-comfy';

export function findMostComfy(userShoes: UserShoe[]): UserShoe | undefined {
  if (userShoes.length <= 1) return undefined;
  const mostComfy = userShoes.reduce((prev, current) =>
    (current.comfortScore || 0) > (prev.comfortScore || 0) ? current : prev
  );
  return mostComfy.comfortScore && mostComfy.comfortScore > 0 ? mostComfy : undefined;
}

export function findOldest(userShoes: UserShoe[]): UserShoe | undefined {
  if (userShoes.length <= 1) return undefined;
  const shoesWithDate = userShoes.filter((shoe) => shoe.purchaseDate);
  if (shoesWithDate.length === 0) return undefined;
  return shoesWithDate.reduce((prev, current) =>
    new Date(current.purchaseDate!).getTime() < new Date(prev.purchaseDate!).getTime() ? current : prev
  );
}

export function findMostWorn(userShoes: UserShoe[]): UserShoe | undefined {
  if (userShoes.length <= 1) return undefined;
  const shoesWithCondition = userShoes.filter((shoe) => shoe.condition);
  if (shoesWithCondition.length === 0) return undefined;
  const conditionOrder = { worn: 0, fair: 1, good: 2, excellent: 3, new: 4 } as const;
  return shoesWithCondition.reduce((prev, current) => {
    const prevOrder = conditionOrder[prev.condition as keyof typeof conditionOrder] ?? 999;
    const currentOrder = conditionOrder[current.condition as keyof typeof conditionOrder] ?? 999;
    return currentOrder < prevOrder ? current : prev;
  });
}

export function buildSpecialLabels(userShoes: UserShoe[]): Record<string, { type: SpecialLabelType; icon: ReactNode }> {
  const labels: Record<string, { type: SpecialLabelType; icon: ReactNode }> = {};

  const mostComfy = findMostComfy(userShoes);
  if (mostComfy) {
    labels[mostComfy._id] = {
      type: 'most-comfy',
      icon: createElement(Heart, { className: 'w-3 h-3 text-pink-400' }),
    };
  }

  const oldest = findOldest(userShoes);
  if (oldest) {
    labels[oldest._id] = {
      type: 'oldest',
      icon: createElement(Clock, { className: 'w-3 h-3' }),
    };
  }

  const mostWorn = findMostWorn(userShoes);
  if (mostWorn) {
    labels[mostWorn._id] = {
      type: 'most-worn',
      icon: createElement(Crown, { className: 'w-3 h-3 text-amber-400' }),
    };
  }

  return labels;
}
