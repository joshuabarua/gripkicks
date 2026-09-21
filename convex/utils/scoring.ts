export function fitLongevityToScore(fitLongevity?: string): number | null {
  if (fitLongevity === "6+ months") return 10;
  if (fitLongevity === "3-6 months") return 7;
  if (fitLongevity === "1-3 months") return 4;
  return null;
}

export function sizingDeviationToScore(sizingDeviation?: number): number | null {
  if (sizingDeviation === undefined) return null;
  return Math.max(2, 10 - Math.min(8, Math.abs(sizingDeviation) * 4));
}

const AGGRESSIVENESS_SCORES: Record<string, number> = {
  aggressive: 5,
  moderate: 3,
  flat: 1,
};

const DISCIPLINE_VERSATILITY_SCORES: Record<string, number> = {
  trad: 4,
  sport: 3,
  bouldering: 3,
  gym: 2,
  competition: 2,
};

export function aggressivenessToScore(
  aggressiveness: string | undefined,
  fallback: number,
): number {
  return aggressiveness !== undefined
    ? (AGGRESSIVENESS_SCORES[aggressiveness] ?? fallback)
    : fallback;
}

export function disciplineToVersatility(
  discipline: string | undefined,
  fallback: number,
): number {
  return discipline !== undefined
    ? (DISCIPLINE_VERSATILITY_SCORES[discipline] ?? fallback)
    : fallback;
}

export function toFivePointScale(value: number): number {
  return value / 2;
}
