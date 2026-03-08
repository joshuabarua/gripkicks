import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useFootProfileStore } from "@/stores/footProfileStore";
import { useUserPreferenceLearning } from "./useUserPreferenceLearning";

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

  // Use learned preferences if available, otherwise use manual preferences
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
  ]);

  const isLoading = shoes === undefined || popularityData === undefined;

  return { scoredShoes, isLoading, isLearningReady, userPreferenceProfile };
}

function calculateShoeScore(
  shoe: Shoe,
  footProfile: { shape: string; volume: string } | null,
  userPreferences:
    | { comfort: number; performance: number; durability: number }
    | undefined,
  popularityData: { shoeId: string; count: number }[],
  learnedPreferences?: LearnedPreferences | null,
): ShoeScore {
  // 1. Foot Type Compatibility (30% weight)
  const footTypeScore = calculateFootTypeCompatibility(shoe, footProfile);

  // 2. Volume Compatibility (20% weight)
  const volumeScore = calculateVolumeCompatibility(shoe, footProfile);

  // 3. User Preference Match (25% weight)
  const preferenceScore = calculatePreferenceMatch(shoe, userPreferences);

  // 4. Community Approval (15% weight)
  const communityScore = calculateCommunityApproval(shoe, popularityData);

  // 5. Overall Rating (10% weight)
  const overallRatingScore = calculateOverallRating(shoe);

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
  );

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
    },
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

function calculateCommunityApproval(
  shoe: Shoe,
  popularityData: { shoeId: string; count: number }[],
): number {
  // Find popularity data for this shoe
  const shoePopularity = popularityData.find((p) => p.shoeId === shoe._id);

  if (!shoePopularity || shoePopularity.count === 0) {
    return 2.5; // Neutral score if no data
  }

  // Use overall ratings as community approval
  const overallRating = calculateOverallRating(shoe);

  // Boost score based on popularity (more people choosing it = higher approval)
  const popularityBoost = Math.min(2, shoePopularity.count / 10); // Max 2 points boost

  return Math.min(5, overallRating + popularityBoost);
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

function calculateOverallRating(shoe: Shoe): number {
  const comfort = shoe.avgComfortScore || 2.5;
  const performance = shoe.avgPerformanceRating || 2.5;
  const durability = shoe.avgDurabilityRating || 2.5;

  return (comfort + performance + durability) / 3;
}

function calculateRadarMetrics(
  shoe: Shoe,
  footTypeScore: number,
  volumeScore: number,
  preferenceScore: number,
): ShoeScore["metrics"] {
  // Comfort (base rating + compatibility factors)
  const comfort =
    (shoe.avgComfortScore || 2.5) + (footTypeScore + volumeScore) / 5;

  // Performance (base rating + user preference)
  const performance = (shoe.avgPerformanceRating || 2.5) + preferenceScore / 5;

  // Durability (base rating)
  const durability = shoe.avgDurabilityRating || 2.5;

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
