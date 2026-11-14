import type { Doc } from "../_generated/dataModel";
import type { MatchSignals } from "../../types/shoe";
import {
  aggressivenessToScore,
  disciplineToVersatility,
  fitLongevityToScore,
  sizingDeviationToScore,
  toFivePointScale,
  normalizeVolume,
} from "./scoring";

// Personal match scoring shared by the Matcher (client) and recommendation
// queries (server), so both show the same match for a shoe.

type StashEntry = Doc<"userShoes"> & { shoe?: Doc<"shoes"> | null };

export interface UserPreferenceProfile {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  versatility: number;
  preferredBrands: string[];
  preferredVolumes: string[];
  preferredDisciplines: string[];
  confidence: number; // How confident we are in these preferences (0-1)
  sampleSize: number; // How many shoes this is based on
}

export interface SoleMateAggregate {
  shoeId: string;
  ownerCount: number;
  avgComfort: number | null;
  avgPerformance: number | null;
  avgDurability: number | null;
  avgFitLongevityScore?: number | null;
  avgSizingDeviationScore?: number | null;
}

export type Shoe = Doc<"shoes"> & { footShapeCompat?: Array<Doc<"footShapeCompat">["footShape"]> };

export interface ShoeScore {
  shoe: Shoe;
  totalScore: number;
  signals: MatchSignals;
  breakdown: {
    footTypeCompatibility: number;
    volumeCompatibility: number;
    userPreferenceMatch: number;
    communityApproval: number;
    overallRating: number;
    learnedPreferenceBonus: number;
    soleMateMatch: number;
  };
  realityDelta: {
    aggressiveness: number;
    stiffness: number;
  };
  metrics: {
    comfort: number;
    performance: number;
    durability: number;
    aggressiveness: number;
    stability: number;
    versatility: number;
  };
}

export interface LearnedPreferences {
  preferredBrands: string[];
  preferredVolumes: string[];
  preferredDisciplines: string[];
  confidence: number;
  sampleSize: number;
  aggressiveness: number;
}

export function calculateUserPreferenceProfile(userShoes: StashEntry[]): UserPreferenceProfile {
  const ratedShoes = userShoes.filter(shoe =>
    shoe.comfortScore && shoe.performanceRating && shoe.durabilityRating
  );

  if (ratedShoes.length === 0) {
    // Return default profile if no ratings
    return {
      comfort: 3,
      performance: 3,
      durability: 3,
      aggressiveness: 3,
      versatility: 3,
      preferredBrands: [],
      preferredVolumes: [],
      preferredDisciplines: [],
      confidence: 0,
      sampleSize: 0,
    };
  }

  // Calculate average ratings
  const totalComfort = ratedShoes.reduce((sum, shoe) => sum + (shoe.comfortScore || 0), 0);
  const totalPerformance = ratedShoes.reduce((sum, shoe) => sum + (shoe.performanceRating || 0), 0);
  const totalDurability = ratedShoes.reduce((sum, shoe) => sum + (shoe.durabilityRating || 0), 0);

  const avgComfort = totalComfort / ratedShoes.length;
  const avgPerformance = totalPerformance / ratedShoes.length;
  const avgDurability = totalDurability / ratedShoes.length;

  // Calculate aggressiveness and versatility from shoe attributes
  const shoeDetails = ratedShoes
    .map(userShoe => userShoe.shoe)
    .filter(Boolean) as Shoe[];

  const aggressivenessScores = shoeDetails.map(shoe =>
    aggressivenessToScore(shoe.aggressiveness, 3),
  );

  const versatilityScores = shoeDetails.map(shoe =>
    disciplineToVersatility(shoe.climbingDiscipline, 3),
  );

  const avgAggressiveness = aggressivenessScores.length > 0
    ? aggressivenessScores.reduce((sum, score) => sum + score, 0) / aggressivenessScores.length
    : 3;

  const avgVersatility = versatilityScores.length > 0
    ? versatilityScores.reduce((sum, score) => sum + score, 0) / versatilityScores.length
    : 3;

  // Calculate brand preferences
  const brandCounts: Record<string, number> = {};
  shoeDetails.forEach(shoe => {
    brandCounts[shoe.brand] = (brandCounts[shoe.brand] || 0) + 1;
  });

  const preferredBrands = Object.entries(brandCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([brand]) => brand);

  // Calculate volume preferences
  const volumeCounts: Record<string, number> = {};
  shoeDetails.forEach(shoe => {
    const volume = shoe.volume || "medium_volume";
    volumeCounts[volume] = (volumeCounts[volume] || 0) + 1;
  });

  const preferredVolumes = Object.entries(volumeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([volume]) => volume);

  // Calculate discipline preferences
  const disciplineCounts: Record<string, number> = {};
  shoeDetails.forEach(shoe => {
    disciplineCounts[shoe.climbingDiscipline] = (disciplineCounts[shoe.climbingDiscipline] || 0) + 1;
  });

  const preferredDisciplines = Object.entries(disciplineCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([discipline]) => discipline);

  // Calculate confidence based on sample size
  const confidence = Math.min(1, ratedShoes.length / 10); // Max confidence at 10 shoes

  return {
    comfort: toFivePointScale(avgComfort),
    performance: toFivePointScale(avgPerformance),
    durability: toFivePointScale(avgDurability),
    aggressiveness: avgAggressiveness,
    versatility: avgVersatility,
    preferredBrands,
    preferredVolumes,
    preferredDisciplines,
    confidence,
    sampleSize: ratedShoes.length,
  };
}

function mean(values: number[]) {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Averages the ratings that climbers with the same foot profile gave each shoe.
export function aggregateSoleMateRatings(userShoes: Doc<"userShoes">[]): SoleMateAggregate[] {
  const byShoe = new Map<string, Doc<"userShoes">[]>();
  for (const userShoe of userShoes) {
    byShoe.set(userShoe.shoeId, [...(byShoe.get(userShoe.shoeId) ?? []), userShoe]);
  }
  const pick = (entries: Doc<"userShoes">[], read: (entry: Doc<"userShoes">) => number | null | undefined) =>
    mean(entries.map(read).filter((value): value is number => value !== null && value !== undefined));

  return Array.from(byShoe, ([shoeId, entries]) => ({
    shoeId,
    ownerCount: entries.length,
    avgComfort: pick(entries, (entry) => entry.comfortScore),
    avgPerformance: pick(entries, (entry) => entry.performanceRating),
    avgDurability: pick(entries, (entry) => entry.durabilityRating),
    avgFitLongevityScore: pick(entries, (entry) => fitLongevityToScore(entry.fitLongevity)),
    avgSizingDeviationScore: pick(entries, (entry) => sizingDeviationToScore(entry.sizingDeviation)),
  }));
}

// Learned ratings replace stated preferences once three shoes are rated.
export function preferencesFromProfile(profile: UserPreferenceProfile | null | undefined) {
  if (!profile || profile.sampleSize < 3) return undefined;
  return { comfort: profile.comfort, performance: profile.performance, durability: profile.durability };
}

export function calculateShoeScore(
  shoe: Shoe,
  footProfile: { shape: string; volume: string } | null,
  userPreferences:
    | { comfort: number; performance: number; durability: number }
    | undefined,
  popularityData: { shoeId: string; count: number }[],
  learnedPreferences?: LearnedPreferences | null,
  soleMateMap?: Map<string, SoleMateAggregate>,
): ShoeScore {
  const soleMate = soleMateMap?.get(shoe._id);
  const overallRating = calculateOverallRating(
    shoe,
    soleMate?.avgFitLongevityScore != null
      ? toFivePointScale(soleMate.avgFitLongevityScore)
      : null,
  );

  // 1. Foot Type Compatibility (30% weight)
  const footTypeScore = footProfile
    ? calculateFootTypeCompatibility(shoe, footProfile)
    : overallRating;

  // 2. Volume Compatibility (20% weight)
  const volumeScore = footProfile
    ? applySizingDeviationSignal(
        calculateVolumeCompatibility(shoe, footProfile),
        soleMate?.avgSizingDeviationScore != null
          ? toFivePointScale(soleMate.avgSizingDeviationScore)
          : null,
      )
    : overallRating;

  // 3. User Preference Match (25% weight)
  const preferenceScore = calculatePreferenceMatch(shoe, userPreferences);

  // 4. Community Approval (15% weight)
  const { communityScore, soleMateMatch } = calculateCommunityApproval(
    shoe,
    popularityData,
    soleMateMap,
  );

  // 5. Overall Rating (10% weight)
  const overallRatingScore = overallRating;

  // 6. Learned Preference Bonus (up to 0.5 points)
  const learnedPreferenceBonus = calculateLearnedPreferenceBonus(
    shoe,
    learnedPreferences,
  );

  // Calculate weighted total score
  const totalScore = Math.min(
    5,
    footTypeScore * 0.3 +
    volumeScore * 0.2 +
    preferenceScore * 0.25 +
    communityScore * 0.15 +
    overallRatingScore * 0.1 +
    learnedPreferenceBonus,
  );

  // Calculate radar metrics
  const metrics = calculateRadarMetrics(
    shoe,
    footTypeScore,
    volumeScore,
    preferenceScore,
    soleMate,
  );

  // Calculate Reality Delta (Brand Claim vs Community Perception)
  const calculateDelta = (brand?: number, perceived?: number) => {
    if (brand === undefined || perceived === undefined) return 0;
    return brand - perceived;
  };

  const realityDelta = {
    aggressiveness: calculateDelta(shoe.brandAggressiveness, metrics.aggressiveness),
    stiffness: calculateDelta(shoe.brandStiffness, metrics.stability), // using stability as proxy for perceived stiffness
  };

  return {
    shoe,
    totalScore,
    signals: {
      footShape: footProfile && shoe.footShapeCompat?.length ? footTypeScore === 5 ? "listed" : "not-listed" : "unknown",
      volume: !!(footProfile && normalizeVolume(footProfile.volume) && normalizeVolume(shoe.volume)),
      preferences: !!userPreferences,
    },
    breakdown: {
      footTypeCompatibility: footTypeScore,
      volumeCompatibility: volumeScore,
      userPreferenceMatch: preferenceScore,
      communityApproval: communityScore,
      overallRating: overallRatingScore,
      learnedPreferenceBonus,
      soleMateMatch,
    },
    realityDelta,
    metrics,
  };
}

function calculateFootTypeCompatibility(
  shoe: Shoe,
  footProfile: { shape: string; volume: string } | null,
): number {
  if (!footProfile) return 2.5; // Neutral score if no profile

  return shoe.footShapeCompat?.some((shape) => shape === footProfile.shape.toLowerCase()) ? 5 : 2.5;
}

function calculateVolumeCompatibility(
  shoe: Shoe,
  footProfile: { shape: string; volume: string } | null,
): number {
  if (!footProfile) return 2.5;

  const shoeVolume = normalizeVolume(shoe.volume);
  const userVolume = normalizeVolume(footProfile.volume);
  if (!shoeVolume || !userVolume) return 2.5;
  const levels = { low: 0, medium: 1, high: 2 };
  return 5 - Math.abs(levels[shoeVolume] - levels[userVolume]) * 2;
}

function getCatalogBaseline(
  shoe: Shoe,
  field: "comfort" | "performance" | "durability",
) {
  if (shoe.enrichment?.reviewStatus !== "approved") return 2.5;
  return shoe.defaultScores?.[field] !== undefined
    ? shoe.defaultScores[field] / 2
    : 2.5;
}

function calculatePreferenceMatch(
  shoe: Shoe,
  preferences:
    | { comfort: number; performance: number; durability: number }
    | undefined,
): number {
  if (!preferences) return 2.5;

  const shoeComfort =
    shoe.avgComfortScore !== undefined
      ? toFivePointScale(shoe.avgComfortScore)
      : getCatalogBaseline(shoe, "comfort");
  const shoePerformance =
    shoe.avgPerformanceRating !== undefined
      ? toFivePointScale(shoe.avgPerformanceRating)
      : getCatalogBaseline(shoe, "performance");
  const shoeDurability =
    shoe.avgDurabilityRating !== undefined
      ? toFivePointScale(shoe.avgDurabilityRating)
      : getCatalogBaseline(shoe, "durability");

  // Calculate how well the shoe matches user preferences (inverse of difference)
  const comfortDiff = Math.abs(shoeComfort - preferences.comfort);
  const performanceDiff = Math.abs(shoePerformance - preferences.performance);
  const durabilityDiff = Math.abs(shoeDurability - preferences.durability);

  // Convert difference to match score (lower difference = higher score)
  const comfortMatch = Math.max(1, 5 - comfortDiff);
  const performanceMatch = Math.max(1, 5 - performanceDiff);
  const durabilityMatch = Math.max(1, 5 - durabilityDiff);

  return (comfortMatch + performanceMatch + durabilityMatch) / 3;
}

function blend(general: number, soleMate: number | null, soleMateWeight = 3): number {
  if (soleMate === null) return general;
  return (general + soleMate * soleMateWeight) / (1 + soleMateWeight);
}

function applySizingDeviationSignal(baseScore: number, sizingDeviationScore: number | null): number {
  if (sizingDeviationScore === null) return baseScore;
  return Math.min(5, baseScore * 0.8 + sizingDeviationScore * 0.2);
}

function calculateCommunityApproval(
  shoe: Shoe,
  popularityData: { shoeId: string; count: number }[],
  soleMateMap?: Map<string, SoleMateAggregate>,
): { communityScore: number; soleMateMatch: number } {
  const shoePopularity = popularityData.find((p) => p.shoeId === shoe._id);

  if (!shoePopularity || shoePopularity.count === 0) {
    const baseline = (
      getCatalogBaseline(shoe, "comfort") +
      getCatalogBaseline(shoe, "performance") +
      getCatalogBaseline(shoe, "durability")
    ) / 3;
    return { communityScore: baseline, soleMateMatch: 0 };
  }

  const soleMate = soleMateMap?.get(shoe._id) ?? null;
  const soleMateMatch = soleMate?.ownerCount ?? 0;

  const generalComfort =
    shoe.avgComfortScore !== undefined
      ? toFivePointScale(shoe.avgComfortScore)
      : getCatalogBaseline(shoe, "comfort");
  const generalPerformance =
    shoe.avgPerformanceRating !== undefined
      ? toFivePointScale(shoe.avgPerformanceRating)
      : getCatalogBaseline(shoe, "performance");
  const generalDurability =
    shoe.avgDurabilityRating !== undefined
      ? toFivePointScale(shoe.avgDurabilityRating)
      : getCatalogBaseline(shoe, "durability");

  const blendedComfort = blend(
    generalComfort,
    soleMate?.avgComfort != null ? toFivePointScale(soleMate.avgComfort) : null,
  );
  const blendedPerformance = blend(
    generalPerformance,
    soleMate?.avgPerformance != null
      ? toFivePointScale(soleMate.avgPerformance)
      : null,
  );
  const blendedDurability = blend(
    generalDurability,
    soleMate?.avgDurability != null
      ? toFivePointScale(soleMate.avgDurability)
      : null,
  );

  const blendedRating = (blendedComfort + blendedPerformance + blendedDurability) / 3;
  const popularityBoost = Math.min(2, shoePopularity.count / 10);
  const communityScore = Math.min(5, blendedRating + popularityBoost);

  return { communityScore, soleMateMatch };
}

function calculateLearnedPreferenceBonus(
  shoe: Shoe,
  learnedPreferences?: LearnedPreferences | null,
): number {
  if (
    !learnedPreferences ||
    !learnedPreferences.confidence ||
    learnedPreferences.sampleSize < 3
  ) {
    return 0; // No bonus if not enough data
  }

  let bonus = 0;

  // Brand affinity bonus (up to 0.2 points)
  if (learnedPreferences.preferredBrands.includes(shoe.brand)) {
    const brandIndex = learnedPreferences.preferredBrands.indexOf(shoe.brand);
    bonus += (learnedPreferences.preferredBrands.length - brandIndex) * 0.05;
  }

  // Volume preference bonus (up to 0.1 points)
  if (
    learnedPreferences.preferredVolumes.includes(shoe.volume || "medium_volume")
  ) {
    bonus += 0.1;
  }

  // Discipline preference bonus (up to 0.1 points)
  if (
    learnedPreferences.preferredDisciplines.includes(shoe.climbingDiscipline)
  ) {
    bonus += 0.1;
  }

  // Aggressiveness match bonus (up to 0.1 points)
  const shoeAggressiveness = aggressivenessToScore(shoe.aggressiveness, 3);

  const aggressivenessDiff = Math.abs(
    shoeAggressiveness - learnedPreferences.aggressiveness,
  );
  if (aggressivenessDiff <= 1) {
    bonus += 0.1 * (1 - aggressivenessDiff);
  }

  // Apply confidence multiplier
  return Math.min(0.5, bonus * learnedPreferences.confidence);
}

function calculateOverallRating(shoe: Shoe, fitLongevityScore: number | null): number {
  const comfort =
    shoe.avgComfortScore !== undefined
      ? toFivePointScale(shoe.avgComfortScore)
      : getCatalogBaseline(shoe, "comfort");
  const performance =
    shoe.avgPerformanceRating !== undefined
      ? toFivePointScale(shoe.avgPerformanceRating)
      : getCatalogBaseline(shoe, "performance");
  const durability =
    shoe.avgDurabilityRating !== undefined
      ? toFivePointScale(shoe.avgDurabilityRating)
      : getCatalogBaseline(shoe, "durability");
  const enrichedDurability =
    fitLongevityScore === null ? durability : durability * 0.85 + fitLongevityScore * 0.15;

  return (comfort + performance + enrichedDurability) / 3;
}

function calculateRadarMetrics(
  shoe: Shoe,
  footTypeScore: number,
  volumeScore: number,
  preferenceScore: number,
  soleMate?: SoleMateAggregate,
): ShoeScore["metrics"] {
  const baseComfort = blend(
    shoe.avgComfortScore !== undefined
      ? toFivePointScale(shoe.avgComfortScore)
      : getCatalogBaseline(shoe, "comfort"),
    soleMate?.avgComfort != null ? toFivePointScale(soleMate.avgComfort) : null,
  );
  const basePerformance = blend(
    shoe.avgPerformanceRating !== undefined
      ? toFivePointScale(shoe.avgPerformanceRating)
      : getCatalogBaseline(shoe, "performance"),
    soleMate?.avgPerformance != null
      ? toFivePointScale(soleMate.avgPerformance)
      : null,
  );
  const baseDurability = blend(
    shoe.avgDurabilityRating !== undefined
      ? toFivePointScale(shoe.avgDurabilityRating)
      : getCatalogBaseline(shoe, "durability"),
    soleMate?.avgDurability != null
      ? toFivePointScale(soleMate.avgDurability)
      : null,
  );
  const enrichedDurability =
    soleMate?.avgFitLongevityScore === null || soleMate?.avgFitLongevityScore === undefined
      ? baseDurability
      : baseDurability * 0.85 + toFivePointScale(soleMate.avgFitLongevityScore) * 0.15;

  // Comfort (blended rating + compatibility factors)
  const comfort = baseComfort + (footTypeScore + volumeScore) / 5;

  // Performance (blended rating + user preference)
  const performance = basePerformance + preferenceScore / 5;

  // Durability (blended rating)
  const durability = enrichedDurability;

  // Aggressiveness (convert to 1-5 scale)
  const aggressiveness = aggressivenessToScore(shoe.aggressiveness, 2.5);

  let stiffness = 2.5;
  if (shoe.stiffness === "stiff") stiffness = 5;
  else if (shoe.stiffness === "medium") stiffness = 3;
  else if (shoe.stiffness === "soft") stiffness = 1;

  let volumeSupport = 2.5;
  if (shoe.volume === "low_volume" || shoe.volume === "low") volumeSupport = 4;
  else if (shoe.volume === "medium_volume" || shoe.volume === "medium") {
    volumeSupport = 3;
  } else if (shoe.volume === "high_volume" || shoe.volume === "high") {
    volumeSupport = 2;
  }

  const stability = Math.min(
    5,
    durability * 0.45 + stiffness * 0.35 + volumeSupport * 0.2,
  );

  // Versatility (based on climbing discipline and compatibility)
  let versatility = disciplineToVersatility(shoe.climbingDiscipline, 2.5);

  // Boost versatility based on compatibility
  versatility += (footTypeScore + volumeScore) / 10;

  return {
    comfort: Math.min(5, comfort),
    performance: Math.min(5, performance),
    durability,
    aggressiveness,
    stability,
    versatility: Math.min(5, versatility),
  };
}
