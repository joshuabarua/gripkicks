import { createElement, type ReactNode } from 'react';
import { Clock, Crown, Heart } from 'lucide-react';
import type { UserShoe } from '@/types/api';

export type SpecialLabelType = 'most-worn' | 'oldest' | 'most-comfy';

export function buildSpecialLabels(userShoes: UserShoe[]): Record<string, { type: SpecialLabelType; icon: ReactNode }> {
  if (userShoes.length <= 1) return {};

  const labels: Record<string, { type: SpecialLabelType; icon: ReactNode }> = {};

  const mostComfy = userShoes.reduce((prev, current) =>
    (current.comfortScore || 0) > (prev.comfortScore || 0) ? current : prev
  );
  if (mostComfy.comfortScore && mostComfy.comfortScore > 0) {
    labels[mostComfy._id] = {
      type: 'most-comfy',
      icon: createElement(Heart, { className: 'w-3 h-3' }),
    };
  }

  const shoesWithDate = userShoes.filter((shoe) => shoe.purchaseDate);
  if (shoesWithDate.length > 0) {
    const oldest = shoesWithDate.reduce((prev, current) =>
      new Date(current.purchaseDate!).getTime() < new Date(prev.purchaseDate!).getTime() ? current : prev
    );
    labels[oldest._id] = {
      type: 'oldest',
      icon: createElement(Clock, { className: 'w-3 h-3' }),
    };
  }

  const shoesWithCondition = userShoes.filter((shoe) => shoe.condition);
  if (shoesWithCondition.length > 0) {
    const conditionOrder = { worn: 0, fair: 1, good: 2, excellent: 3, new: 4 } as const;
    const mostWorn = shoesWithCondition.reduce((prev, current) => {
      const prevOrder = conditionOrder[prev.condition as keyof typeof conditionOrder] ?? 999;
      const currentOrder = conditionOrder[current.condition as keyof typeof conditionOrder] ?? 999;
      return currentOrder < prevOrder ? current : prev;
    });
    labels[mostWorn._id] = {
      type: 'most-worn',
      icon: createElement(Crown, { className: 'w-3 h-3' }),
    };
  }

  return labels;
}
