import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import type { UserShoe } from "@/types/api";
import { shoeCache } from "@/lib/cache";
import { getUserStash } from "@/services/stash";

interface CatalogFilters {
  enabled: boolean;
  searchTerm: string;
  brand: string;
  gender: string;
}

interface UseStashDataOptions {
  enabled?: boolean;
  catalog?: CatalogFilters;
  onError?: (message: string) => void;
}

type Shoe = Doc<"shoes">;

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
  fitLongevity?: string;
  sizingDeviation?: number;
  shoe?: Omit<Shoe, "rubberTechnology" | "brandAggressiveness" | "brandStiffness"> & {
    _creationTime: number;
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

  const { enabled = true, catalog, onError } = options ?? {};

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      hasAttemptedFallbackRef.current = false;
      setRealtimeEnabled(false);
    });

    return () => {
      cancelled = true;
    };
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

  // Only fetch catalog shoes when explicitly requested (e.g. Add dialog open),
  // filtered server-side so the full table never reaches the client
  const shoesData = useQuery(
    api.shoes.searchCatalog,
    catalog?.enabled
      ? {
        ...(catalog.searchTerm.trim() ? { searchTerm: catalog.searchTerm } : {}),
        ...(catalog.brand !== "all" ? { brand: catalog.brand } : {}),
        ...(catalog.gender !== "all" ? { gender: catalog.gender } : {}),
      }
      : "skip",
  );
  const brandsData = useQuery(
    api.shoes.listBrands,
    catalog?.enabled ? {} : "skip",
  );

  const allShoes = useMemo(() => {
    if (!Array.isArray(shoesData)) {
      if (shoesData !== undefined) {
        console.error("Invalid catalog response: expected an array");
      }
      return [];
    }
    return shoesData;
  }, [shoesData]);
  const popularityMap = useMemo(() => {
    if (!Array.isArray(popularityData)) {
      if (popularityData !== undefined) {
        console.error("Invalid popularity response: expected an array");
      }
      return new Map<string, number>();
    }
    return new Map(popularityData.map((p) => [p.shoeId, p.count]));
  }, [popularityData]);
  const totalShoesInDatabase = useMemo(
    () =>
      Array.isArray(popularityData)
        ? popularityData.reduce((sum, p) => sum + p.count, 0)
        : 0,
    [popularityData],
  );
  const uniqueBrands = useMemo(() => {
    if (!Array.isArray(brandsData)) {
      if (brandsData !== undefined) {
        console.error("Invalid brands response: expected an array");
      }
      return [];
    }
    return brandsData;
  }, [brandsData]);

  const fetchUserStash = useCallback(async () => {
    if (!sessionUserId || !enabled || realtimeEnabled) return;

    const cacheKey = `user-stash-${sessionUserId}`;

    setIsLoading(true);
    const cachedData = shoeCache.get<UserShoe[]>(cacheKey);
    if (Array.isArray(cachedData)) {
      setUserShoes(cachedData);
      setIsLoading(false);
      return;
    }

    const result = await getUserStash();
    result.match(
      (value) => {
        if (!Array.isArray(value)) {
          console.error("Invalid stash response: expected an array");
          setUserShoes([]);
          return;
        }
        setUserShoes(value);
        shoeCache.set(cacheKey, value, 5 * 60 * 1000);
      },
      (error) => {
        console.error("Failed to fetch user stash:", error);
        onErrorRef.current?.("Failed to load your shoe collection");
      },
    );
    setIsLoading(false);
  }, [sessionUserId, enabled, realtimeEnabled]);

  // Use real-time data when available, fallback to REST API
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;

      if (realtimeStashData !== undefined) {
        hasAttemptedFallbackRef.current = false;
        if (!Array.isArray(realtimeStashData)) {
          console.error("Invalid stash response: expected an array");
          setUserShoes([]);
          setRealtimeEnabled(true);
          setIsLoading(false);
          return;
        }
        const mappedUserShoes: UserShoe[] = realtimeStashData.map(
          (item: ConvexUserShoe) => ({
          _id: item._id,
          shoeId: item.shoeId,
          ...(item.size !== undefined ? { size: item.size } : {}),
          ...(item.purchaseDate !== undefined ? { purchaseDate: item.purchaseDate } : {}),
          ...(item.condition !== undefined ? { condition: item.condition } : {}),
          ...(item.notes !== undefined ? { notes: item.notes } : {}),
          ...(item.comfortScore !== undefined ? { comfortScore: item.comfortScore } : {}),
          ...(item.performanceRating !== undefined ? { performanceRating: item.performanceRating } : {}),
          ...(item.durabilityRating !== undefined ? { durabilityRating: item.durabilityRating } : {}),
          ...(item.isFavourite !== undefined ? { isFavourite: item.isFavourite } : {}),
          ...(item.fitLongevity !== undefined ? { fitLongevity: item.fitLongevity } : {}),
          ...(item.sizingDeviation !== undefined ? { sizingDeviation: item.sizingDeviation } : {}),
          ...(item.shoe
            ? {
              shoe: {
                _id: item.shoe._id,
                name: item.shoe.name,
                brand: item.shoe.brand,
                modelName: item.shoe.modelName,
                ...(item.shoe.variantLabel !== undefined ? { variantLabel: item.shoe.variantLabel } : {}),
                ...(item.shoe.parentModelId !== undefined ? { parentModelId: item.shoe.parentModelId } : {}),
                ...(item.shoe.imageUrl !== undefined ? { imageUrl: item.shoe.imageUrl } : {}),
                ...(item.shoe.slug !== undefined ? { slug: item.shoe.slug } : {}),
                ...(item.shoe.gender !== undefined ? { gender: item.shoe.gender } : {}),
                aggressiveness: item.shoe.aggressiveness,
                stiffness: item.shoe.stiffness,
                climbingDiscipline: item.shoe.climbingDiscipline,
                volume: item.shoe.volume,
                ...(item.shoe.rubberTechnologyId !== undefined ? { rubberTechnologyId: item.shoe.rubberTechnologyId } : {}),
              },
            }
            : {}),
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
    });

    return () => {
      cancelled = true;
    };
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
    userData,
  } as const;
}
