import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useUserStore } from "@/stores/userStore";
import { useUserPreferenceLearning } from "./useUserPreferenceLearning";

type User = Doc<"users">;
type UserShoe = Doc<"userShoes">;
type Shoe = Doc<"shoes">;

interface SoulMateCandidate {
  user: User;
  compatibilityScore: number;
  preferenceMatch: {
    comfort: number;
    performance: number;
    durability: number;
    aggressiveness: number;
    versatility: number;
  };
  sharedPreferences: {
    brands: string[];
    volumes: string[];
    disciplines: string[];
  };
  overlapAnalysis: {
    shoesInCommon: number;
    similarRatings: number;
    preferenceAlignment: number;
  };
  confidenceLevel: "high" | "medium" | "low";
}

interface SoulMateInsights {
  candidates: SoulMateCandidate[];
  topMatch: SoulMateCandidate | null;
  compatibilityDistribution: {
    high: number; // 95-100%
    medium: number; // 85-94%
    low: number; // 75-84%
  };
  globalTrends: {
    averageCompatibility: number;
    mostCommonBrands: string[];
    popularVolumes: string[];
    trendingDisciplines: string[];
  };
}

interface PreferenceProfile {
  comfort: number;
  performance: number;
  durability: number;
  aggressiveness: number;
  versatility: number;
  preferredBrands: string[];
  preferredVolumes: string[];
  preferredDisciplines: string[];
  confidence: number;
  sampleSize: number;
}

export function useSoulMateMatching() {
  const { user } = useUserStore();
  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    user ? { betterAuthId: user.id } : "skip",
  );
  const allUsers = useQuery(api.users.list);
  const allUserShoes = useQuery(api.popularity.list);
  const allShoes = useQuery(api.shoes.listAll);
  const { userPreferenceProfile } = useUserPreferenceLearning();

  const soulMateData = useMemo(() => {
    if (
      !convexUser ||
      !allUsers ||
      !allUserShoes ||
      !allShoes ||
      !userPreferenceProfile
    ) {
      return null;
    }

    // Get all other users (excluding current user)
    const otherUsers = allUsers.filter((u) => u._id !== convexUser._id);

    // Calculate compatibility scores for all other users
    const candidates = otherUsers
      .map((otherUser) => {
        const compatibility = calculateSoulMateCompatibility(
          convexUser,
          otherUser,
          userPreferenceProfile,
          allUserShoes,
          allShoes,
        );

        return {
          user: otherUser,
          ...compatibility,
        };
      })
      .filter((candidate) => candidate.compatibilityScore >= 75); // Only users with 75%+ compatibility

    // Sort by compatibility score (highest first)
    candidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Calculate distribution
    const distribution = {
      high: candidates.filter((c) => c.compatibilityScore >= 95).length,
      medium: candidates.filter(
        (c) => c.compatibilityScore >= 85 && c.compatibilityScore < 95,
      ).length,
      low: candidates.filter(
        (c) => c.compatibilityScore >= 75 && c.compatibilityScore < 85,
      ).length,
    };

    // Calculate global trends
    const globalTrends = calculateGlobalTrends(candidates);

    return {
      candidates,
      topMatch: candidates.length > 0 ? candidates[0] : null,
      compatibilityDistribution: distribution,
      globalTrends,
    };
  }, [convexUser, allUsers, allUserShoes, allShoes, userPreferenceProfile]);

  return soulMateData;
}

function calculateSoulMateCompatibility(
  currentUser: User,
  otherUser: User,
  currentUserProfile: PreferenceProfile,
  allUserShoes: UserShoe[],
  allShoes: Shoe[],
): Omit<SoulMateCandidate, "user"> {
  // Get other user's preference profile
  const otherUserProfile = calculateUserPreferenceProfile(
    allUserShoes.filter((shoe) => shoe.userId === otherUser._id),
    allShoes,
  );

  if (!otherUserProfile || otherUserProfile.sampleSize < 3) {
    return {
      compatibilityScore: 0,
      preferenceMatch: {
        comfort: 0,
        performance: 0,
        durability: 0,
        aggressiveness: 0,
        versatility: 0,
      },
      sharedPreferences: { brands: [], volumes: [], disciplines: [] },
      overlapAnalysis: {
        shoesInCommon: 0,
        similarRatings: 0,
        preferenceAlignment: 0,
      },
      confidenceLevel: "low" as const,
    };
  }

  // Calculate preference match scores (0-100 scale)
  const comfortMatch = calculatePreferenceAlignment(
    currentUserProfile.comfort,
    otherUserProfile.comfort,
  );
  const performanceMatch = calculatePreferenceAlignment(
    currentUserProfile.performance,
    otherUserProfile.performance,
  );
  const durabilityMatch = calculatePreferenceAlignment(
    currentUserProfile.durability,
    otherUserProfile.durability,
  );
  const aggressivenessMatch = calculatePreferenceAlignment(
    currentUserProfile.aggressiveness,
    otherUserProfile.aggressiveness,
  );
  const versatilityMatch = calculatePreferenceAlignment(
    currentUserProfile.versatility,
    otherUserProfile.versatility,
  );

  const preferenceMatch = {
    comfort: comfortMatch,
    performance: performanceMatch,
    durability: durabilityMatch,
    aggressiveness: aggressivenessMatch,
    versatility: versatilityMatch,
  };

  // Calculate shared preferences
  const sharedBrands = currentUserProfile.preferredBrands.filter(
    (brand: string) => otherUserProfile.preferredBrands.includes(brand),
  );
  const sharedVolumes = currentUserProfile.preferredVolumes.filter(
    (volume: string) => otherUserProfile.preferredVolumes.includes(volume),
  );
  const sharedDisciplines = currentUserProfile.preferredDisciplines.filter(
    (discipline: string) =>
      otherUserProfile.preferredDisciplines.includes(discipline),
  );

  const sharedPreferences = {
    brands: sharedBrands,
    volumes: sharedVolumes,
    disciplines: sharedDisciplines,
  };

  // Calculate overlap analysis
  const currentUserShoes = allUserShoes.filter(
    (shoe) => shoe.userId === currentUser._id,
  );
  const otherUserShoes = allUserShoes.filter(
    (shoe) => shoe.userId === otherUser._id,
  );

  const currentUserShoeIds = new Set(
    currentUserShoes.map((s) => s.shoeId.toString()),
  );
  const otherUserShoeIds = new Set(
    otherUserShoes.map((s) => s.shoeId.toString()),
  );

  const shoesInCommon = [...currentUserShoeIds].filter((shoeId) =>
    otherUserShoeIds.has(shoeId),
  ).length;

  // Calculate similar ratings for shoes both users have rated
  const similarRatings = calculateSimilarRatings(
    currentUserShoes,
    otherUserShoes,
  );

  // Calculate overall preference alignment
  const preferenceAlignment =
    Object.values(preferenceMatch).reduce((sum, score) => sum + score, 0) / 5;

  const overlapAnalysis = {
    shoesInCommon,
    similarRatings,
    preferenceAlignment,
  };

  // Calculate overall compatibility score
  const preferenceWeight = 0.4;
  const sharedWeight = 0.3;
  const overlapWeight = 0.3;

  const sharedScore =
    (sharedBrands.length * 10 +
      sharedVolumes.length * 15 +
      sharedDisciplines.length * 15) /
    40;
  const overlapScore =
    (shoesInCommon * 5 + similarRatings * 10 + preferenceAlignment * 15) / 30;

  const compatibilityScore = Math.min(
    100,
    preferenceAlignment * preferenceWeight +
    sharedScore * sharedWeight +
    overlapScore * overlapWeight,
  );

  // Determine confidence level
  const combinedSampleSize =
    currentUserProfile.sampleSize + otherUserProfile.sampleSize;
  const confidenceLevel =
    combinedSampleSize >= 10
      ? "high"
      : combinedSampleSize >= 6
        ? "medium"
        : "low";

  return {
    compatibilityScore,
    preferenceMatch,
    sharedPreferences,
    overlapAnalysis,
    confidenceLevel,
  };
}

function calculatePreferenceAlignment(
  currentValue: number,
  otherValue: number,
): number {
  const difference = Math.abs(currentValue - otherValue);
  const maxDifference = 4; // Maximum possible difference (5-1)
  const alignment = 1 - difference / maxDifference;
  return Math.max(0, Math.min(100, alignment * 100));
}

function calculateSimilarRatings(
  currentUserShoes: UserShoe[],
  otherUserShoes: UserShoe[],
): number {
  const commonShoes = currentUserShoes.filter((currentShoe) =>
    otherUserShoes.some((otherShoe) => otherShoe.shoeId === currentShoe.shoeId),
  );

  if (commonShoes.length === 0) return 0;

  let totalSimilarity = 0;
  let comparisons = 0;

  commonShoes.forEach((currentShoe) => {
    const otherShoe = otherUserShoes.find(
      (s) => s.shoeId === currentShoe.shoeId,
    );
    if (!otherShoe) return;

    // Compare comfort ratings
    if (currentShoe.comfortScore && otherShoe.comfortScore) {
      const diff = Math.abs(currentShoe.comfortScore - otherShoe.comfortScore);
      totalSimilarity += Math.max(0, 5 - diff);
      comparisons++;
    }

    // Compare performance ratings
    if (currentShoe.performanceRating && otherShoe.performanceRating) {
      const diff = Math.abs(
        currentShoe.performanceRating - otherShoe.performanceRating,
      );
      totalSimilarity += Math.max(0, 5 - diff);
      comparisons++;
    }

    // Compare durability ratings
    if (currentShoe.durabilityRating && otherShoe.durabilityRating) {
      const diff = Math.abs(
        currentShoe.durabilityRating - otherShoe.durabilityRating,
      );
      totalSimilarity += Math.max(0, 5 - diff);
      comparisons++;
    }
  });

  return comparisons > 0 ? (totalSimilarity / comparisons) * 20 : 0; // Scale to 0-100
}

function calculateUserPreferenceProfile(
  userShoes: UserShoe[],
  allShoes: Shoe[],
): PreferenceProfile | null {
  const ratedShoes = userShoes.filter(
    (shoe) =>
      shoe.comfortScore && shoe.performanceRating && shoe.durabilityRating,
  );

  if (ratedShoes.length === 0) return null;

  const totalComfort = ratedShoes.reduce(
    (sum, shoe) => sum + (shoe.comfortScore || 0),
    0,
  );
  const totalPerformance = ratedShoes.reduce(
    (sum, shoe) => sum + (shoe.performanceRating || 0),
    0,
  );
  const totalDurability = ratedShoes.reduce(
    (sum, shoe) => sum + (shoe.durabilityRating || 0),
    0,
  );

  const shoeDetails = ratedShoes
    .map((userShoe) => {
      return allShoes.find((s) => s._id === userShoe.shoeId);
    })
    .filter(Boolean) as Shoe[];

  const aggressivenessScores = shoeDetails.map((shoe) => {
    if (shoe.aggressiveness === "very_high") return 5;
    if (shoe.aggressiveness === "high") return 4;
    if (shoe.aggressiveness === "moderate") return 3;
    if (shoe.aggressiveness === "low") return 1;
    return 3;
  });

  const versatilityScores = shoeDetails.map((shoe) => {
    if (shoe.climbingDiscipline === "all_around") return 5;
    if (shoe.climbingDiscipline === "trad") return 4;
    if (shoe.climbingDiscipline === "sport") return 3;
    if (shoe.climbingDiscipline === "bouldering") return 3;
    if (shoe.climbingDiscipline === "indoor") return 2;
    return 3;
  });

  return {
    comfort: totalComfort / ratedShoes.length,
    performance: totalPerformance / ratedShoes.length,
    durability: totalDurability / ratedShoes.length,
    aggressiveness:
      aggressivenessScores.reduce((sum, score) => sum + score, 0) /
      aggressivenessScores.length,
    versatility:
      versatilityScores.reduce((sum, score) => sum + score, 0) /
      versatilityScores.length,
    preferredBrands: [],
    preferredVolumes: [],
    preferredDisciplines: [],
    confidence: Math.min(1, ratedShoes.length / 10),
    sampleSize: ratedShoes.length,
  };
}

function calculateGlobalTrends(
  candidates: SoulMateCandidate[],
): SoulMateInsights["globalTrends"] {
  if (candidates.length === 0) {
    return {
      averageCompatibility: 0,
      mostCommonBrands: [],
      popularVolumes: [],
      trendingDisciplines: [],
    };
  }

  const averageCompatibility =
    candidates.reduce(
      (sum, candidate) => sum + candidate.compatibilityScore,
      0,
    ) / candidates.length;

  // Aggregate all shared preferences
  const allSharedBrands = candidates.flatMap((c) => c.sharedPreferences.brands);
  const allSharedVolumes = candidates.flatMap(
    (c) => c.sharedPreferences.volumes,
  );
  const allSharedDisciplines = candidates.flatMap(
    (c) => c.sharedPreferences.disciplines,
  );

  // Count frequencies
  const brandCounts: Record<string, number> = {};
  const volumeCounts: Record<string, number> = {};
  const disciplineCounts: Record<string, number> = {};

  allSharedBrands.forEach((brand) => {
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  allSharedVolumes.forEach((volume) => {
    volumeCounts[volume] = (volumeCounts[volume] || 0) + 1;
  });

  allSharedDisciplines.forEach((discipline) => {
    disciplineCounts[discipline] = (disciplineCounts[discipline] || 0) + 1;
  });

  // Get top 5 most common
  const mostCommonBrands = Object.entries(brandCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([brand]) => brand);

  const popularVolumes = Object.entries(volumeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([volume]) => volume);

  const trendingDisciplines = Object.entries(disciplineCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([discipline]) => discipline);

  return {
    averageCompatibility,
    mostCommonBrands,
    popularVolumes,
    trendingDisciplines,
  };
}
