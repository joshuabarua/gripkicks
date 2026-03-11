import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { UserShoe } from "@/types/api";
import { shoeCache } from "@/lib/cache";
import { getUserStash } from "@/services/stash";
import { Id } from "convex/_generated/dataModel";

interface UseStashDataOptions {
  enabled?: boolean;
  onError?: (message: string) => void;
}

// Convex user shoe type (from schema)
interface ConvexUserShoe {
  _id: Id<"userShoes">;
  _creationTime: number;
  userId: Id<"users">;
  shoeId: Id<"shoes">;
  size?: string;
  purchaseDate?: string;
  condition?: string;
  notes?: string;
  comfortScore?: number;
  performanceRating?: number;
  durabilityRating?: number;
  isFavourite?: boolean;
  shoe?: {
    _id: Id<"shoes">;
    _creationTime: number;
    name: string;
    brand: string;
    modelName: string;
    variantLabel?: string;
    parentModelId?: Id<"shoes">;
    imageUrl?: string;
    slug?: string;
    gender?: "men" | "women" | "kids" | "unisex";
    aggressiveness: string;
    stiffness: string;
    climbingDiscipline: string;
    volume: string;
    rubberTechnologyId?: Id<"rubberTechnologies">;
  } | null;
}

export function useStashData(
  sessionUserId?: string,
  options?: UseStashDataOptions,
) {
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const hasAttemptedFallbackRef = useRef(false);
  const onErrorRef = useRef<UseStashDataOptions["onError"]>(undefined);

  const { enabled = true, onError } = options ?? {};

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    hasAttemptedFallbackRef.current = false;
    setRealtimeEnabled(false);
  }, [sessionUserId]);

  // Consolidated queries - only fetch what's needed
  const userData = useQuery(
    api.users.findByBetterAuthId,
    sessionUserId ? { betterAuthId: sessionUserId } : "skip",
  );

  // Get user's stash in real-time when user data is available
  const realtimeStashData = useQuery(
    api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip",
  );

  // Only fetch popularity data if we have user shoes (cached for 10 minutes)
  const popularityData = useQuery(api.popularity.getAllShoesPopularity);

  // Only fetch all shoes when needed for search/add functionality (uses non-paginated version)
  const shoesData = useQuery(api.shoes.listAll);

  const allShoes = useMemo(() => shoesData ?? [], [shoesData]);
  const popularityMap = useMemo(
    () =>
      popularityData
        ? new Map(popularityData.map((p) => [p.shoeId, p.count]))
        : new Map<string, number>(),
    [popularityData],
  );
  const totalShoesInDatabase = useMemo(
    () => popularityData?.reduce((sum, p) => sum + p.count, 0) ?? 0,
    [popularityData],
  );
  const uniqueBrands = useMemo(
    () => [...new Set(allShoes.map((shoe) => shoe.brand))].sort(),
    [allShoes],
  );

  const fetchUserStash = useCallback(async () => {
    if (!sessionUserId || !enabled) return;

    const cacheKey = `user-stash-${sessionUserId}`;

    setIsLoading(true);
    const cachedData = shoeCache.get<UserShoe[]>(cacheKey);
    if (cachedData) {
      setUserShoes(cachedData);
      setIsLoading(false);
      return;
    }

    const result = await getUserStash();
    result.match(
      (value) => {
        setUserShoes(value);
        shoeCache.set(cacheKey, value, 5 * 60 * 1000);
      },
      (error) => {
        console.error("Failed to fetch user stash:", error);
        onErrorRef.current?.("Failed to load your shoe collection");
      },
    );
    setIsLoading(false);
  }, [sessionUserId, enabled]);

  // Use real-time data when available, fallback to REST API
  useEffect(() => {
    if (realtimeStashData !== undefined) {
      hasAttemptedFallbackRef.current = false;
      const mappedUserShoes: UserShoe[] = realtimeStashData.map(
        (item: ConvexUserShoe) => ({
          _id: item._id,
          shoeId: item.shoeId,
          shoe: item.shoe
            ? {
              _id: item.shoe._id,
              name: item.shoe.name,
              brand: item.shoe.brand,
              modelName: item.shoe.modelName,
              variantLabel: item.shoe.variantLabel,
              parentModelId: item.shoe.parentModelId,
              imageUrl: item.shoe.imageUrl,
              slug: item.shoe.slug,
              gender: item.shoe.gender,
              aggressiveness: item.shoe.aggressiveness,
              stiffness: item.shoe.stiffness,
              climbingDiscipline: item.shoe.climbingDiscipline,
              volume: item.shoe.volume,
              rubberTechnologyId: item.shoe.rubberTechnologyId,
            }
            : undefined,
          size: item.size,
          purchaseDate: item.purchaseDate,
          condition: item.condition,
          notes: item.notes,
          comfortScore: item.comfortScore,
          performanceRating: item.performanceRating,
          durabilityRating: item.durabilityRating,
          isFavourite: item.isFavourite,
        }),
      );

      setUserShoes(mappedUserShoes);
      setRealtimeEnabled(true);
      setIsLoading(false);
    } else if (
      userData &&
      !realtimeEnabled &&
      !hasAttemptedFallbackRef.current
    ) {
      hasAttemptedFallbackRef.current = true;
      void fetchUserStash();
    } else if (!sessionUserId) {
      setUserShoes([]);
      setIsLoading(false);
      setRealtimeEnabled(false);
      hasAttemptedFallbackRef.current = false;
    }
  }, [
    realtimeStashData,
    userData,
    sessionUserId,
    realtimeEnabled,
    fetchUserStash,
  ]);

  const invalidateCache = useCallback(() => {
    if (sessionUserId) {
      shoeCache.delete(`user-stash-${sessionUserId}`);
    }
    hasAttemptedFallbackRef.current = false;
  }, [sessionUserId]);

  return {
    userShoes,
    setUserShoes,
    isLoading,
    fetchUserStash,
    invalidateCache,
    allShoes,
    popularityMap,
    totalShoesInDatabase,
    uniqueBrands,
  } as const;
}
