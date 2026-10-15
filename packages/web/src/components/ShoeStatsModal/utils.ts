import { calculateBaseTraitScores } from 'convex/utils/enrichmentScoring';

export interface DefaultStats {
  comfort: number;
  performance: number;
  durability: number;
}

interface ShoeCharacteristics {
  aggressiveness?: string | undefined;
  climbingDiscipline?: string | undefined;
  stiffness?: string | undefined;
  defaultScores?: DefaultStats | undefined;
}

export const calculateDefaultStats = (shoe: ShoeCharacteristics): DefaultStats => {
  if (shoe.defaultScores) return shoe.defaultScores;

  const { comfort, performance, durability } = calculateBaseTraitScores(shoe);

  return {
    comfort: Math.max(1, Math.min(10, comfort)),
    performance: Math.max(1, Math.min(10, performance)),
    durability: Math.max(1, Math.min(10, durability)),
  };
};

// fallow-ignore-next-line unused-type
export interface EffectiveShoeStats extends DefaultStats {
  average: number;
}

export const getEffectiveShoeStats = (
  shoe: ShoeCharacteristics,
  stats?: {
    comfortScore?: number | undefined;
    performanceRating?: number | undefined;
    durabilityRating?: number | undefined;
  },
): EffectiveShoeStats => {
  const defaults = calculateDefaultStats(shoe);
  const comfort = stats?.comfortScore ?? defaults.comfort;
  const performance = stats?.performanceRating ?? defaults.performance;
  const durability = stats?.durabilityRating ?? defaults.durability;

  return {
    comfort,
    performance,
    durability,
    average: Number(((comfort + performance + durability) / 3).toFixed(1)),
  };
};

export const getStatBarColor = (value: number, isCommunityAverage: boolean): string => {
  if (isCommunityAverage) {
    if (value >= 8) return 'bg-linear-to-r from-green-400 to-green-600';
    if (value >= 6) return 'bg-linear-to-r from-yellow-400 to-yellow-600';
    if (value >= 4) return 'bg-linear-to-r from-orange-400 to-orange-600';
    return 'bg-linear-to-r from-red-400 to-red-600';
  }
  return 'bg-linear-to-r from-gray-500 to-gray-600';
};
