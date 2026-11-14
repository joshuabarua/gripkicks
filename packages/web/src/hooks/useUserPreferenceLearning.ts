import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Doc } from 'convex/_generated/dataModel';
import { useCurrentUser } from './useCurrentUser';
import { aggressivenessToScore } from 'convex/utils/scoring';
import { calculateUserPreferenceProfile, type UserPreferenceProfile } from 'convex/utils/matchScore';

type Shoe = Doc<'shoes'>;
type StashEntry = Doc<'userShoes'> & { shoe?: Shoe | null };

interface LearningInsights {
  profile: UserPreferenceProfile;
  recommendations: {
    comfortRange: { min: number; max: number };
    performanceRange: { min: number; max: number };
    durabilityRange: { min: number; max: number };
    aggressivenessLevel: 'flat' | 'moderate' | 'aggressive';
    climbingStyle: 'bouldering' | 'competition' | 'gym' | 'sport' | 'trad';
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
  const { convexUser } = useCurrentUser();
  const userData = convexUser;

  // Get user's stash using Convex user ID
  const userShoes = useQuery(api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip"
  );

  const userPreferenceProfile = useMemo(() => {
    if (!userShoes || !userData) return null;

    if (userShoes.length === 0) return null;

    return calculateUserPreferenceProfile(userShoes);
  }, [userShoes, userData]);

  const learningInsights = useMemo(() => {
    if (!userPreferenceProfile || !userShoes) return null;

    return generateLearningInsights(userPreferenceProfile, userShoes);
  }, [userPreferenceProfile, userShoes]);

  return {
    userPreferenceProfile,
    learningInsights,
    isLearningReady: userPreferenceProfile && userPreferenceProfile.sampleSize >= 3,
  };
}

function generateLearningInsights(
  profile: UserPreferenceProfile,
  userShoes: StashEntry[]
): LearningInsights {
  const ratedShoes = userShoes.filter(shoe =>
    shoe.comfortScore && shoe.performanceRating && shoe.durabilityRating
  );

  const shoeDetails = ratedShoes
    .map(userShoe => userShoe.shoe)
    .filter(Boolean) as Shoe[];

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
  let aggressivenessLevel: 'flat' | 'moderate' | 'aggressive' = 'moderate';
  if (profile.aggressiveness >= 4) aggressivenessLevel = 'aggressive';
  else if (profile.aggressiveness < 2) aggressivenessLevel = 'flat';

  // Determine climbing style
  const disciplineScores = profile.preferredDisciplines.map(discipline => {
    const count = shoeDetails.filter(shoe => shoe.climbingDiscipline === discipline).length;
    return { discipline, count };
  }).sort((a, b) => b.count - a.count);

  let climbingStyle: 'bouldering' | 'competition' | 'gym' | 'sport' | 'trad' = 'gym';
  if (disciplineScores.length > 0) {
    const firstDisciplineScore = disciplineScores[0];
    if (firstDisciplineScore) {
      climbingStyle = firstDisciplineScore.discipline as 'bouldering' | 'competition' | 'gym' | 'sport' | 'trad';
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

  const calculateAggressivenessScore = (userShoe: StashEntry): number =>
    aggressivenessToScore(userShoe.shoe?.aggressiveness, 3);

  const firstHalfAggressiveness = firstHalf.map(calculateAggressivenessScore).reduce((sum, score) => sum + score, 0) / (firstHalf.length || 1);
  const secondHalfAggressiveness = secondHalf.map(calculateAggressivenessScore).reduce((sum, score) => sum + score, 0) / (secondHalf.length || 1);

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
