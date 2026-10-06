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

  let comfort = 5;
  let performance = 5;
  let durability = 5;
  const aggressiveness = shoe.aggressiveness?.toLowerCase();
  const discipline = shoe.climbingDiscipline?.toLowerCase();
  const stiffness = shoe.stiffness?.toLowerCase();

  if (aggressiveness === 'moderate') {
    comfort = 6;
    performance = 6;
  } else if (aggressiveness === 'aggressive') {
    comfort = 4;
    performance = 8;
  } else if (aggressiveness === 'flat') {
    comfort = 7;
    performance = 5;
  }

  if (discipline === 'sport') {
    performance += 1;
    durability -= 0.5;
  } else if (discipline === 'bouldering') {
    performance += 0.5;
    comfort += 0.5;
  } else if (discipline === 'trad') {
    comfort += 1;
    durability += 1;
    performance -= 0.5;
  } else if (discipline === 'competition') {
    performance += 2;
    comfort -= 1;
  } else if (discipline === 'gym') {
    comfort += 0.5;
    durability -= 0.5;
  }

  if (stiffness === 'soft') {
    comfort += 1;
    performance -= 0.5;
  } else if (stiffness === 'stiff') {
    comfort -= 0.5;
    performance += 1;
    durability += 0.5;
  }

  comfort = Math.max(1, Math.min(10, comfort));
  performance = Math.max(1, Math.min(10, performance));
  durability = Math.max(1, Math.min(10, durability));

  return { comfort, performance, durability };
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
