import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import { useUserStore } from '@/stores/userStore';

type UserShoe = Doc<'userShoes'>;
type Shoe = Doc<'shoes'>;

interface UserPreferenceProfile {
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

interface LearningInsights {
  profile: UserPreferenceProfile;
  recommendations: {
    comfortRange: { min: number; max: number };
    performanceRange: { min: number; max: number };
    durabilityRange: { min: number; max: number };
    aggressivenessLevel: 'low' | 'moderate' | 'high' | 'very_high';
    climbingStyle: 'indoor' | 'bouldering' | 'sport' | 'trad' | 'all_around';
    brandAffinity: Record<string, number>;
    volumePreference: 'low' | 'medium' | 'high';
  };
  trends: {
    improvingComfort: boolean;
    increasingPerformance: boolean;
    durabilityFocus: boolean;
    aggressivenessProgression: 'decreasing' | 'stable' | 'increasing';
  };
}

export function useUserPreferenceLearning() {
  const { user } = useUserStore();

  // Get Convex user data using Better Auth ID
  const userData = useQuery(api.users.findByBetterAuthId,
    user ? { betterAuthId: user.id } : "skip"
  );

  // Get user's stash using Convex user ID
  const userShoes = useQuery(api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip"
  );
  const shoes = useQuery(api.shoes.listAll);

  const userPreferenceProfile = useMemo(() => {
    if (!userShoes || !shoes || !userData) return null;

    // getUserStash already returns only shoes for this user
    const myShoes = userShoes;

    if (myShoes.length === 0) return null;

    return calculateUserPreferenceProfile(myShoes, shoes);
  }, [userShoes, shoes, userData]);

  const learningInsights = useMemo(() => {
    if (!userPreferenceProfile || !userShoes || !shoes) return null;

    // getUserStash already returns only shoes for this user
    const myShoes = userShoes;

    return generateLearningInsights(userPreferenceProfile, myShoes, shoes);
  }, [userPreferenceProfile, userShoes, shoes]);

  return {
    userPreferenceProfile,
    learningInsights,
    isLearningReady: userPreferenceProfile && userPreferenceProfile.sampleSize >= 3,
  };
}

function calculateUserPreferenceProfile(userShoes: UserShoe[], allShoes: Shoe[]): UserPreferenceProfile {
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
  const shoeDetails = ratedShoes.map(userShoe => {
    const shoe = allShoes.find(s => s._id === userShoe.shoeId);
    return shoe;
  }).filter(Boolean) as Shoe[];

  const aggressivenessScores = shoeDetails.map(shoe => {
    if (shoe.aggressiveness === 'very_high') return 5;
    if (shoe.aggressiveness === 'high') return 4;
    if (shoe.aggressiveness === 'moderate') return 3;
    if (shoe.aggressiveness === 'low') return 1;
    return 3;
  });

  const versatilityScores = shoeDetails.map(shoe => {
    if (shoe.climbingDiscipline === 'all_around') return 5;
    if (shoe.climbingDiscipline === 'trad') return 4;
    if (shoe.climbingDiscipline === 'sport') return 3;
    if (shoe.climbingDiscipline === 'bouldering') return 3;
    if (shoe.climbingDiscipline === 'indoor') return 2;
    return 3;
  });

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
    const volume = shoe.volume || 'medium_volume';
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
    comfort: avgComfort,
    performance: avgPerformance,
    durability: avgDurability,
    aggressiveness: avgAggressiveness,
    versatility: avgVersatility,
    preferredBrands,
    preferredVolumes,
    preferredDisciplines,
    confidence,
    sampleSize: ratedShoes.length,
  };
}

function generateLearningInsights(
  profile: UserPreferenceProfile,
  userShoes: UserShoe[],
  allShoes: Shoe[]
): LearningInsights {
  const ratedShoes = userShoes.filter(shoe =>
    shoe.comfortScore && shoe.performanceRating && shoe.durabilityRating
  );

  const shoeDetails = ratedShoes.map(userShoe => {
    return allShoes.find(s => s._id === userShoe.shoeId);
  }).filter(Boolean) as Shoe[];

  // Calculate preference ranges
  const comfortRange = {
    min: Math.max(1, profile.comfort - 0.5),
    max: Math.min(5, profile.comfort + 0.5)
  };

  const performanceRange = {
    min: Math.max(1, profile.performance - 0.5),
    max: Math.min(5, profile.performance + 0.5)
  };

  const durabilityRange = {
    min: Math.max(1, profile.durability - 0.5),
    max: Math.min(5, profile.durability + 0.5)
  };

  // Determine aggressiveness level
  let aggressivenessLevel: 'low' | 'moderate' | 'high' | 'very_high' = 'moderate';
  if (profile.aggressiveness >= 4.5) aggressivenessLevel = 'very_high';
  else if (profile.aggressiveness >= 3.5) aggressivenessLevel = 'high';
  else if (profile.aggressiveness >= 2.5) aggressivenessLevel = 'moderate';
  else aggressivenessLevel = 'low';

  // Determine climbing style
  const disciplineScores = profile.preferredDisciplines.map(discipline => {
    const count = shoeDetails.filter(shoe => shoe.climbingDiscipline === discipline).length;
    return { discipline, count };
  }).sort((a, b) => b.count - a.count);

  let climbingStyle: 'indoor' | 'bouldering' | 'sport' | 'trad' | 'all_around' = 'all_around';
  if (disciplineScores.length > 0) {
    const firstDisciplineScore = disciplineScores[0];
    if (firstDisciplineScore) {
      climbingStyle = firstDisciplineScore.discipline as 'indoor' | 'bouldering' | 'sport' | 'trad' | 'all_around';
    }
  }

  // Calculate brand affinity
  const brandAffinity: Record<string, number> = {};
  profile.preferredBrands.forEach((brand, index) => {
    brandAffinity[brand] = (profile.preferredBrands.length - index) / profile.preferredBrands.length;
  });

  // Determine volume preference
  let volumePreference: 'low' | 'medium' | 'high' = 'medium';
  if (profile.preferredVolumes.includes('low_volume')) volumePreference = 'low';
  if (profile.preferredVolumes.includes('high_volume')) volumePreference = 'high';

  // Analyze trends
  const sortedShoes = ratedShoes.sort((a, b) => {
    const aDate = new Date(a._creationTime || 0);
    const bDate = new Date(b._creationTime || 0);
    return aDate.getTime() - bDate.getTime();
  });

  const firstHalf = sortedShoes.slice(0, Math.floor(sortedShoes.length / 2));
  const secondHalf = sortedShoes.slice(Math.floor(sortedShoes.length / 2));

  const firstHalfAvgComfort = firstHalf.reduce((sum, shoe) => sum + (shoe.comfortScore || 0), 0) / (firstHalf.length || 1);
  const secondHalfAvgComfort = secondHalf.reduce((sum, shoe) => sum + (shoe.comfortScore || 0), 0) / (secondHalf.length || 1);

  const firstHalfAvgPerformance = firstHalf.reduce((sum, shoe) => sum + (shoe.performanceRating || 0), 0) / (firstHalf.length || 1);
  const secondHalfAvgPerformance = secondHalf.reduce((sum, shoe) => sum + (shoe.performanceRating || 0), 0) / (secondHalf.length || 1);

  const improvingComfort = secondHalfAvgComfort > firstHalfAvgComfort + 0.2;
  const increasingPerformance = secondHalfAvgPerformance > firstHalfAvgPerformance + 0.2;
  const durabilityFocus = profile.durability > (profile.comfort + profile.performance) / 2 + 0.5;

  const firstHalfAggressiveness = firstHalf.map(userShoe => {
    const shoe = allShoes.find(s => s._id === userShoe.shoeId);
    if (!shoe) return 3;
    if (shoe.aggressiveness === 'very_high') return 5;
    if (shoe.aggressiveness === 'high') return 4;
    if (shoe.aggressiveness === 'moderate') return 3;
    if (shoe.aggressiveness === 'low') return 1;
    return 3;
  }).reduce((sum, score) => sum + score, 0) / (firstHalf.length || 1);

  const secondHalfAggressiveness = secondHalf.map(userShoe => {
    const shoe = allShoes.find(s => s._id === userShoe.shoeId);
    if (!shoe) return 3;
    if (shoe.aggressiveness === 'very_high') return 5;
    if (shoe.aggressiveness === 'high') return 4;
    if (shoe.aggressiveness === 'moderate') return 3;
    if (shoe.aggressiveness === 'low') return 1;
    return 3;
  }).reduce((sum, score) => sum + score, 0) / (secondHalf.length || 1);

  let aggressivenessProgression: 'decreasing' | 'stable' | 'increasing' = 'stable';
  if (secondHalfAggressiveness > firstHalfAggressiveness + 0.3) aggressivenessProgression = 'increasing';
  else if (secondHalfAggressiveness < firstHalfAggressiveness - 0.3) aggressivenessProgression = 'decreasing';

  return {
    profile,
    recommendations: {
      comfortRange,
      performanceRange,
      durabilityRange,
      aggressivenessLevel,
      climbingStyle,
      brandAffinity,
      volumePreference,
    },
    trends: {
      improvingComfort,
      increasingPerformance,
      durabilityFocus,
      aggressivenessProgression,
    },
  };
}
