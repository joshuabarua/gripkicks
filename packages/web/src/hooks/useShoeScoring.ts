import { useEffect, useMemo } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useFootProfile } from "./useFootProfile";
import { useUserPreferenceLearning } from "./useUserPreferenceLearning";
import { useCurrentUser } from "./useCurrentUser";
import { calculateShoeScore, preferencesFromProfile, type SoleMateAggregate } from "convex/utils/matchScore";

export function useShoeScoring(userPreferences?: {
  comfort: number;
  performance: number;
  durability: number;
}) {
  const {
    results: shoes,
    status: shoesStatus,
    loadMore: loadMoreShoes,
  } = usePaginatedQuery(api.shoes.list, {}, { initialNumItems: 100 });
  const popularityData = useQuery(api.popularity.getAllShoesPopularity);

  useEffect(() => {
    if (shoesStatus === "CanLoadMore") loadMoreShoes(100);
  }, [shoesStatus, loadMoreShoes]);
  const { profile: footProfile, isLoading: profileLoading } = useFootProfile();
  const { userPreferenceProfile, isLearningReady } =
    useUserPreferenceLearning();
  const { convexUser } = useCurrentUser();
  const userShoes = useQuery(
    api.stash.getUserStash,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  const typedUserShoes = userShoes as
    | Array<{ comfortScore?: number }>
    | undefined;
  const stashCount = typedUserShoes?.length ?? 0;
  const ratedCount =
    typedUserShoes?.filter((shoe) => shoe.comfortScore !== undefined).length ?? 0;

  const effectivePreferences = useMemo(
    () => preferencesFromProfile(userPreferenceProfile) ?? userPreferences,
    [userPreferenceProfile, userPreferences],
  );

  const soleMateData = useQuery(
    api.stash.getSoleMateAggregates,
    footProfile?.shape && footProfile?.volume
      ? { footShape: footProfile.shape.toLowerCase(), footVolume: footProfile.volume.toLowerCase() }
      : "skip",
  );

  const soleMateMap = useMemo(() => {
    if (!Array.isArray(soleMateData)) {
      if (soleMateData !== undefined) {
        console.error("Invalid Sole Mate response: expected an array");
      }
      return new Map<string, SoleMateAggregate>();
    }
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

  const isLoading =
    shoesStatus !== "Exhausted" ||
    popularityData === undefined ||
    profileLoading;

  return { scoredShoes, isLoading, isLearningReady, userPreferenceProfile, stashCount, ratedCount };
}
