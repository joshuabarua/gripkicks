import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useFootProfileStore } from "@/stores/footProfileStore";
import { useUserPreferenceLearning } from "./useUserPreferenceLearning";
import { useUserStore } from "@/stores/userStore";

interface SoleMateAggregate {
  shoeId: string;
  ownerCount: number;
  avgComfort: number | null;
  avgPerformance: number | null;
  avgDurability: number | null;
  avgFitLongevityScore?: number | null;
  avgSizingDeviationScore?: number | null;
}

type Shoe = Doc<"shoes">;

interface ShoeScore {
  shoe: Shoe;
  totalScore: number;
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

interface LearnedPreferences {
  preferredBrands: string[];
  preferredVolumes: string[];
  preferredDisciplines: string[];
  confidence: number;
  sampleSize: number;
  aggressiveness: number;
}

export function useShoeScoring(userPreferences?: {
  comfort: number;
  performance: number;
  durability: number;
}) {
  const shoes = useQuery(api.shoes.listAll);
  const popularityData = useQuery(api.popularity.getAllShoesPopularity);
  const { profile: footProfile } = useFootProfileStore();
  const { userPreferenceProfile, isLearningReady } =
    useUserPreferenceLearning();
  const { user } = useUserStore();

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    user ? { betterAuthId: user.id } : "skip",
  );
  const userShoes = useQuery(
    api.stash.getUserStash,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  const stashCount = userShoes?.length ?? 0;
  const ratedCount =
    userShoes?.filter(
      (s: any) => s.comfortScore !== undefined,
    ).length ?? 0;

  const effectivePreferences = useMemo(() => {
    if (isLearningReady && userPreferenceProfile) {
      return {
        comfort: userPreferenceProfile.comfort,
        performance: userPreferenceProfile.performance,
        durability: userPreferenceProfile.durability,
      };
    }
    return userPreferences;
  }, [isLearningReady, userPreferenceProfile, userPreferences]);

  const soleMateData = useQuery(
    api.stash.getSoleMateAggregates,
    footProfile?.shape && footProfile?.volume
      ? { footShape: footProfile.shape, footVolume: footProfile.volume }
      : "skip",
  );

  const soleMateMap = useMemo(() => {
    if (!soleMateData) return new Map<string, SoleMateAggregate>();
    return new Map(soleMateData.map((s) => [s.shoeId, s]));
  }, [soleMateData]);

  const scoredShoes = useMemo(() => {
    if (!shoes || !popularityData) return [];

    return shoes
      .map((shoe) => {
        const score = calculateShoeScore(
          shoe,
          footProfile,
          effectivePreferences,
          popularityData,
          userPreferenceProfile,
          soleMateMap,
        );
        return score;
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [
    shoes,
    popularityData,
    footProfile,
    effectivePreferences,
    userPreferenceProfile,
    soleMateMap,
  ]);

  const isLoading = shoes === undefined || popularityData === undefined;

  return { scoredShoes, isLoading, isLearningReady, userPreferenceProfile, stashCount, ratedCount };
}

function calculateShoeScore(
  shoe: Shoe,
  footProfile: { shape: string; volume: string } | null,
  userPreferences:
    | { comfort: number; performance: number; durability: number }
    | undefined,
  popularityData: { shoeId: string; count: number }[],
  learnedPreferences?: LearnedPreferences | null,
  soleMateMap?: Map<string, SoleMateAggregate>,
): ShoeScore {
  // 1. Foot Type Compatibility (30% weight)
  const footTypeScore = calculateFootTypeCompatibility(shoe, footProfile);

  // 2. Volume Compatibility (20% weight)
  const soleMate = soleMateMap?.get(shoe._id);
  const volumeScore = applySizingDeviationSignal(
    calculateVolumeCompatibility(shoe, footProfile),
    soleMate?.avgSizingDeviationScore ?? null,
  );

  // 3. User Preference Match (25% weight)
  const preferenceScore = calculatePreferenceMatch(shoe, userPreferences);

  // 4. Community Approval (15% weight)
  const { communityScore, soleMateMatch } = calculateCommunityApproval(
    shoe,
    popularityData,
    soleMateMap,
  );

  // 5. Overall Rating (10% weight)
  const overallRatingScore = calculateOverallRating(
    shoe,
    soleMate?.avgFitLongevityScore ?? null,
  );

  // 6. Learned Preference Bonus (up to 0.5 points)
  const learnedPreferenceBonus = calculateLearnedPreferenceBonus(
    shoe,
    learnedPreferences,
  );

  // Calculate weighted total score
  const totalScore =
    footTypeScore * 0.3 +
    volumeScore * 0.2 +
    preferenceScore * 0.25 +
    communityScore * 0.15 +
    overallRatingScore * 0.1 +
    learnedPreferenceBonus;

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

  const footTypeCompatibility: Record<string, Record<string, number>> = {
    Egyptian: {
      low_volume: 4.5,
      medium_volume: 3.5,
      high_volume: 2.0,
    },
    Roman: {
      low_volume: 3.0,
      medium_volume: 4.5,
      high_volume: 3.5,
    },
    Greek: {
      low_volume: 2.0,
      medium_volume: 3.0,
      high_volume: 4.5,
    },
    Germanic: {
      low_volume: 2.5,
      medium_volume: 3.5,
      high_volume: 4.0,
    },
    Celtic: {
      low_volume: 3.5,
      medium_volume: 4.0,
      high_volume: 3.0,
    },
  };

  const shoeVolume = shoe.volume?.toLowerCase() || "medium_volume";
  return footTypeCompatibility[footProfile.shape]?.[shoeVolume] || 2.5;
}

function calculateVolumeCompatibility(
  shoe: Shoe,
  footProfile: { shape: string; volume: string } | null,
): number {
  if (!footProfile) return 2.5;

  const volumeMapping: Record<string, Record<string, number>> = {
    Low: {
      low_volume: 5.0,
      medium_volume: 3.0,
      high_volume: 1.0,
    },
    Medium: {
      low_volume: 3.0,
      medium_volume: 5.0,
      high_volume: 3.0,
    },
    High: {
      low_volume: 1.0,
      medium_volume: 3.0,
      high_volume: 5.0,
    },
  };

  const shoeVolume = shoe.volume?.toLowerCase() || "medium_volume";
  return volumeMapping[footProfile.volume]?.[shoeVolume] || 2.5;
}

function calculatePreferenceMatch(
  shoe: Shoe,
  preferences:
    | { comfort: number; performance: number; durability: number }
    | undefined,
): number {
  if (!preferences) return 2.5;

  const shoeComfort = shoe.avgComfortScore || 2.5;
  const shoePerformance = shoe.avgPerformanceRating || 2.5;
  const shoeDurability = shoe.avgDurabilityRating || 2.5;

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
    return { communityScore: 2.5, soleMateMatch: 0 };
  }

  const soleMate = soleMateMap?.get(shoe._id) ?? null;
  const soleMateMatch = soleMate?.ownerCount ?? 0;

  const generalComfort = shoe.avgComfortScore ?? 2.5;
  const generalPerformance = shoe.avgPerformanceRating ?? 2.5;
  const generalDurability = shoe.avgDurabilityRating ?? 2.5;

  const blendedComfort = blend(generalComfort, soleMate?.avgComfort ?? null);
  const blendedPerformance = blend(generalPerformance, soleMate?.avgPerformance ?? null);
  const blendedDurability = blend(generalDurability, soleMate?.avgDurability ?? null);

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
  const shoeAggressiveness =
    shoe.aggressiveness === "very_high"
      ? 5
      : shoe.aggressiveness === "high"
        ? 4
        : shoe.aggressiveness === "moderate"
          ? 3
          : shoe.aggressiveness === "low"
            ? 1
            : 3;

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
  const comfort = shoe.avgComfortScore || 2.5;
  const performance = shoe.avgPerformanceRating || 2.5;
  const durability = shoe.avgDurabilityRating || 2.5;
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
  const baseComfort = blend(shoe.avgComfortScore ?? 2.5, soleMate?.avgComfort ?? null);
  const basePerformance = blend(shoe.avgPerformanceRating ?? 2.5, soleMate?.avgPerformance ?? null);
  const baseDurability = blend(shoe.avgDurabilityRating ?? 2.5, soleMate?.avgDurability ?? null);
  const enrichedDurability =
    soleMate?.avgFitLongevityScore === null || soleMate?.avgFitLongevityScore === undefined
      ? baseDurability
      : baseDurability * 0.85 + soleMate.avgFitLongevityScore * 0.15;

  // Comfort (blended rating + compatibility factors)
  const comfort = baseComfort + (footTypeScore + volumeScore) / 5;

  // Performance (blended rating + user preference)
  const performance = basePerformance + preferenceScore / 5;

  // Durability (blended rating)
  const durability = enrichedDurability;

  // Aggressiveness (convert to 1-5 scale)
  let aggressiveness = 2.5;
  if (shoe.aggressiveness === "very_high") aggressiveness = 5;
  else if (shoe.aggressiveness === "high") aggressiveness = 4;
  else if (shoe.aggressiveness === "moderate") aggressiveness = 3;
  else if (shoe.aggressiveness === "low") aggressiveness = 1;

  let stiffness = 2.5;
  if (shoe.stiffness === "very_stiff") stiffness = 5;
  else if (shoe.stiffness === "stiff") stiffness = 4;
  else if (shoe.stiffness === "medium") stiffness = 3;
  else if (shoe.stiffness === "soft") stiffness = 2;
  else if (shoe.stiffness === "very_soft") stiffness = 1;

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
  let versatility = 2.5;
  if (shoe.climbingDiscipline === "all_around") versatility = 5;
  else if (shoe.climbingDiscipline === "trad") versatility = 4;
  else if (shoe.climbingDiscipline === "sport") versatility = 3;
  else if (shoe.climbingDiscipline === "bouldering") versatility = 3;
  else if (shoe.climbingDiscipline === "indoor") versatility = 2;

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
