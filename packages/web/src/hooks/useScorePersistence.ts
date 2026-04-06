import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUserStore } from "@/stores/userStore";
import { useUserPreferenceLearning } from "./useUserPreferenceLearning";
import { useShoeScoring } from "./useShoeScoring";
import { useSoulMateMatching } from "./useSoulMateMatching";

interface UserScoreProfile {
  userId: string;
  overallScore: number;
  preferenceProfile: {
    comfort: number;
    performance: number;
    durability: number;
    aggressiveness: number;
    versatility: number;
  };
  learnedPreferences: {
    preferredBrands: string[];
    preferredVolumes: string[];
    preferredDisciplines: string[];
    confidence: number;
    sampleSize: number;
  };
  footProfile: {
    shape: string;
    volume: string;
  } | null;
  lastUpdated: number;
  version: number;
}

interface ScoreUpdateHistory {
  timestamp: number;
  previousScore: number;
  newScore: number;
  changeReason:
  | "shoe_added"
  | "shoe_updated"
  | "shoe_removed"
  | "profile_updated"
  | "recalculation";
  affectedShoes: string[];
}

type ScoreChangeReason = ScoreUpdateHistory["changeReason"];

interface AchievementScoreProfile {
  overallScore: number;
}

interface AchievementPreferenceProfile {
  sampleSize: number;
  preferredBrands: string[];
  preferredDisciplines: string[];
}

interface ScoreHistoryPoint {
  timestamp: number;
  newScore: number;
}

export function useScorePersistence() {
  const { user } = useUserStore();
  const { userPreferenceProfile } = useUserPreferenceLearning();
  useShoeScoring();

  // Resolve Better Auth ID → Convex user ID
  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    user ? { betterAuthId: user.id } : "skip",
  );

  const updateUserScore = useMutation(api.userScores.updateScoreProfile);
  const addScoreHistory = useMutation(api.userScores.addScoreHistory);
  const existingScoreProfile = useQuery(
    api.userScores.getScoreProfile,
    convexUser?._id ? { userId: convexUser._id } : "skip",
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateReason, setLastUpdateReason] = useState<string>("");

  // Calculate current user score based on all data
  const calculateCurrentScore = useCallback((): UserScoreProfile | null => {
    if (!user || !convexUser || !userPreferenceProfile) return null;

    // Base score from preference profile (0-100 scale)
    const preferenceScore =
      ((userPreferenceProfile.comfort +
        userPreferenceProfile.performance +
        userPreferenceProfile.durability +
        userPreferenceProfile.aggressiveness +
        userPreferenceProfile.versatility) /
        5) *
      20; // Scale to 0-100

    // Bonus for sample size (more data = higher score)
    const sampleSizeBonus = Math.min(
      10,
      userPreferenceProfile.sampleSize * 0.5,
    );

    // Bonus for confidence in preferences
    const confidenceBonus = userPreferenceProfile.confidence * 5;

    // Bonus for brand diversity (having experience with multiple brands)
    const brandDiversityBonus = Math.min(
      5,
      userPreferenceProfile.preferredBrands.length * 1,
    );

    // Bonus for discipline versatility
    const disciplineVersatilityBonus = Math.min(
      5,
      userPreferenceProfile.preferredDisciplines.length * 1.5,
    );

    const overallScore = Math.min(
      100,
      preferenceScore +
      sampleSizeBonus +
      confidenceBonus +
      brandDiversityBonus +
      disciplineVersatilityBonus,
    );

    return {
      userId: convexUser._id,
      overallScore,
      preferenceProfile: {
        comfort: userPreferenceProfile.comfort,
        performance: userPreferenceProfile.performance,
        durability: userPreferenceProfile.durability,
        aggressiveness: userPreferenceProfile.aggressiveness,
        versatility: userPreferenceProfile.versatility,
      },
      learnedPreferences: {
        preferredBrands: userPreferenceProfile.preferredBrands,
        preferredVolumes: userPreferenceProfile.preferredVolumes,
        preferredDisciplines: userPreferenceProfile.preferredDisciplines,
        confidence: userPreferenceProfile.confidence,
        sampleSize: userPreferenceProfile.sampleSize,
      },
      footProfile: null, // Will be populated from foot profile store
      lastUpdated: Date.now(),
      version: (existingScoreProfile?.version || 0) + 1,
    };
  }, [user, convexUser, userPreferenceProfile, existingScoreProfile]);

  // Update score profile in database
  const updateScoreProfile = useCallback(
    async (reason: string, affectedShoes: string[] = []) => {
      if (!user || !convexUser || isUpdating) return;

      setIsUpdating(true);
      setLastUpdateReason(reason);

      try {
        const currentScore = calculateCurrentScore();
        if (!currentScore) return;

        const previousScore = existingScoreProfile?.overallScore || 0;

        // Update user score profile
        const scorePayload = {
          userId: convexUser._id,
          overallScore: currentScore.overallScore,
          preferenceProfile: currentScore.preferenceProfile,
          learnedPreferences: currentScore.learnedPreferences,
          lastUpdated: currentScore.lastUpdated,
          version: currentScore.version,
          ...(currentScore.footProfile ? { footProfile: currentScore.footProfile } : {}),
        };

        await updateUserScore(scorePayload);

        // Add to history if score changed
        if (Math.abs(currentScore.overallScore - previousScore) > 0.1) {
          await addScoreHistory({
            userId: convexUser._id,
            history: {
              timestamp: Date.now(),
              previousScore,
              newScore: currentScore.overallScore,
              changeReason: reason as ScoreChangeReason,
              affectedShoes,
            },
          });
        }

        console.log(
          `Score updated for user ${user.id}: ${previousScore} → ${currentScore.overallScore} (${reason})`,
        );
      } catch (error) {
        console.error("Failed to update score profile:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [
      user,
      convexUser,
      isUpdating,
      calculateCurrentScore,
      existingScoreProfile,
      updateUserScore,
      addScoreHistory,
    ],
  );

  // Auto-update score when preferences change
  useEffect(() => {
    if (userPreferenceProfile && existingScoreProfile) {
      const currentScore = calculateCurrentScore();
      if (
        currentScore &&
        Math.abs(
          currentScore.overallScore - existingScoreProfile.overallScore,
        ) > 1
      ) {
        updateScoreProfile("recalculation");
      }
    }
  }, [
    userPreferenceProfile,
    calculateCurrentScore,
    existingScoreProfile,
    updateScoreProfile,
  ]);

  // Manual trigger for score updates
  const triggerScoreUpdate = useCallback(
    (
      reason:
        | "shoe_added"
        | "shoe_updated"
        | "shoe_removed"
        | "profile_updated",
      shoeIds: string[] = [],
    ) => {
      updateScoreProfile(reason, shoeIds);
    },
    [updateScoreProfile],
  );

  return {
    currentScore: existingScoreProfile,
    isUpdating,
    lastUpdateReason,
    triggerScoreUpdate,
    calculateCurrentScore,
    scoreHistory: existingScoreProfile?.history || [],
  };
}

// Hook for listening to shoe sanctuary changes and triggering score updates
export function useScoreAutoUpdate() {
  const { user } = useUserStore();

  // Get Convex user data using Better Auth ID
  const userData = useQuery(
    api.users.findByBetterAuthId,
    user ? { betterAuthId: user.id } : "skip",
  );

  // Get user's stash using Convex user ID
  const userShoes = useQuery(
    api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip",
  );

  const { triggerScoreUpdate } = useScorePersistence();
  const [previousShoeCount, setPreviousShoeCount] = useState(0);
  const [previousShoeIds, setPreviousShoeIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!userShoes) return;

    const currentShoeIds = new Set(
      userShoes.map((shoe) => shoe._id.toString()),
    );
    const currentShoeCount = userShoes.length;

    // Check if shoes were added
    if (currentShoeCount > previousShoeCount) {
      const addedShoes = [...currentShoeIds].filter(
        (id) => !previousShoeIds.has(id),
      );
      triggerScoreUpdate("shoe_added", addedShoes);
    }
    // Check if shoes were removed
    else if (currentShoeCount < previousShoeCount) {
      const removedShoes = [...previousShoeIds].filter(
        (id) => !currentShoeIds.has(id),
      );
      triggerScoreUpdate("shoe_removed", removedShoes);
    }
    // Check if shoes were updated (same count but different IDs)
    else if (
      currentShoeCount === previousShoeCount &&
      ![...currentShoeIds].every((id) => previousShoeIds.has(id))
    ) {
      const updatedShoes = [...currentShoeIds].filter(
        (id) => !previousShoeIds.has(id),
      );
      triggerScoreUpdate("shoe_updated", updatedShoes);
    }

    setPreviousShoeCount(currentShoeCount);
    setPreviousShoeIds(currentShoeIds);
  }, [userShoes, previousShoeCount, previousShoeIds, triggerScoreUpdate]);
}

// Hook for enhanced user profile with score data
export function useEnhancedUserProfile() {
  const { user } = useUserStore();
  const { userPreferenceProfile, learningInsights } =
    useUserPreferenceLearning();
  const { currentScore } = useScorePersistence();
  const soulMateData = useSoulMateMatching();

  const enhancedProfile = useMemo(() => {
    if (!user || !userPreferenceProfile || !currentScore) return null;

    return {
      user,
      scoreProfile: currentScore,
      preferenceProfile: userPreferenceProfile,
      learningInsights,
      soulMateData,
      achievements: calculateUserAchievements(
        currentScore,
        userPreferenceProfile,
      ),
      ranking: calculateUserRanking(currentScore.overallScore),
      progression: calculateScoreProgression(currentScore.history || []),
    };
  }, [
    user,
    userPreferenceProfile,
    currentScore,
    learningInsights,
    soulMateData,
  ]);

  return enhancedProfile;
}

function calculateUserAchievements(
  scoreProfile: AchievementScoreProfile,
  preferenceProfile: AchievementPreferenceProfile,
): string[] {
  const achievements: string[] = [];

  // Score-based achievements
  if (scoreProfile.overallScore >= 90) achievements.push("Elite Climber");
  else if (scoreProfile.overallScore >= 80) achievements.push("Expert Climber");
  else if (scoreProfile.overallScore >= 70)
    achievements.push("Advanced Climber");
  else if (scoreProfile.overallScore >= 60)
    achievements.push("Intermediate Climber");
  else if (scoreProfile.overallScore >= 50)
    achievements.push("Beginner Climber");

  // Experience-based achievements
  if (preferenceProfile.sampleSize >= 20) achievements.push("Shoe Connoisseur");
  else if (preferenceProfile.sampleSize >= 10)
    achievements.push("Experienced Climber");
  else if (preferenceProfile.sampleSize >= 5)
    achievements.push("Shoe Explorer");

  // Brand diversity achievements
  if (preferenceProfile.preferredBrands.length >= 5)
    achievements.push("Brand Expert");
  else if (preferenceProfile.preferredBrands.length >= 3)
    achievements.push("Brand Explorer");

  // Discipline versatility achievements
  if (preferenceProfile.preferredDisciplines.length >= 4)
    achievements.push("All-Round Climber");
  else if (preferenceProfile.preferredDisciplines.length >= 2)
    achievements.push("Multi-Discipline");

  return achievements;
}

function calculateUserRanking(score: number): {
  rank: string;
  percentile: number;
  totalUsers: number;
} {
  // This would typically come from a database query
  // For now, return estimated values
  const estimatedRank = Math.max(1, Math.floor(1000 - score * 10));
  const percentile = Math.min(99, Math.floor((100 - score) * 0.9));

  return {
    rank: `#${estimatedRank}`,
    percentile,
    totalUsers: 1000, // This would be actual user count
  };
}

function calculateScoreProgression(history: ScoreHistoryPoint[]): {
  trend: "improving" | "stable" | "declining";
  weeklyChange: number;
  monthlyChange: number;
  allTimeHigh: number;
  allTimeLow: number;
} {
  if (history.length === 0) {
    return {
      trend: "stable",
      weeklyChange: 0,
      monthlyChange: 0,
      allTimeHigh: 0,
      allTimeLow: 0,
    };
  }

  const scores = history.map((h) => h.newScore);
  const allTimeHigh = Math.max(...scores);
  const allTimeLow = Math.min(...scores);

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recentWeek = history.filter((h) => h.timestamp >= oneWeekAgo);
  const recentMonth = history.filter((h) => h.timestamp >= oneMonthAgo);

  const firstWeekEntry = recentWeek[0];
  const lastWeekEntry = recentWeek[recentWeek.length - 1];
  const firstMonthEntry = recentMonth[0];
  const lastMonthEntry = recentMonth[recentMonth.length - 1];

  const weeklyChange =
    firstWeekEntry && lastWeekEntry
      ? lastWeekEntry.newScore - firstWeekEntry.newScore
      : 0;

  const monthlyChange =
    firstMonthEntry && lastMonthEntry
      ? lastMonthEntry.newScore - firstMonthEntry.newScore
      : 0;

  let trend: "improving" | "stable" | "declining" = "stable";
  if (monthlyChange > 2) trend = "improving";
  else if (monthlyChange < -2) trend = "declining";

  return {
    trend,
    weeklyChange,
    monthlyChange,
    allTimeHigh,
    allTimeLow,
  };
}
