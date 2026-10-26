import { useMemo, useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import type { UserShoe } from "@/types/api";
import { useCurrentUser } from "./useCurrentUser";

interface CatalogFilters {
  enabled: boolean;
  searchTerm: string;
  brand: string;
  gender: "all" | "men" | "women" | "kids" | "unisex";
}

interface UseStashDataOptions {
  enabled?: boolean;
  catalog?: CatalogFilters;
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

function mapStashItem(item: ConvexUserShoe): UserShoe {
  return {
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
    ...(item.shoe ? { shoe: item.shoe } : {}),
  };
}

export function useStashData(options?: UseStashDataOptions) {
  const { enabled = true, catalog } = options ?? {};

  const { session, convexUser: userData } = useCurrentUser();

  // Get user's stash in real-time when user data is available
  const realtimeStashData = useQuery(
    api.stash.getUserStash,
    userData ? { userId: userData._id } : "skip",
  );

  const [userShoes, setUserShoes] = useState<UserShoe[]>(() =>
    Array.isArray(realtimeStashData)
      ? realtimeStashData.map(mapStashItem)
      : [],
  );

  const [syncedStash, setSyncedStash] = useState(realtimeStashData);
  if (realtimeStashData !== syncedStash) {
    setSyncedStash(realtimeStashData);
    if (realtimeStashData !== undefined) {
      if (Array.isArray(realtimeStashData)) {
        setUserShoes(realtimeStashData.map(mapStashItem));
      } else {
        console.error("Invalid stash response: expected an array");
        setUserShoes([]);
      }
    } else if (!session?.user) {
      setUserShoes([]);
    }
  }

  // Only fetch popularity data if we have user shoes (cached for 10 minutes)
  const popularityData = useQuery(api.popularity.getAllShoesPopularity);

  // Only fetch catalog shoes when explicitly requested (e.g. Add dialog open),
  // filtered server-side so the full table never reaches the client
  const {
    results: shoesData,
    status: catalogStatus,
    loadMore: loadMoreCatalog,
  } = usePaginatedQuery(
    api.shoes.searchCatalog,
    catalog?.enabled
      ? {
        ...(catalog.searchTerm.trim() ? { searchTerm: catalog.searchTerm } : {}),
        ...(catalog.brand !== "all" ? { brand: catalog.brand } : {}),
        ...(catalog.gender !== "all" ? { gender: catalog.gender } : {}),
      }
      : "skip",
    { initialNumItems: 40 },
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

  const isLoading =
    enabled && !!session?.user && realtimeStashData === undefined;

  return {
    userShoes,
    setUserShoes,
    isLoading,
    allShoes,
    popularityMap,
    totalShoesInDatabase,
    uniqueBrands,
    userData,
    catalogHasMore: catalogStatus === "CanLoadMore",
    catalogIsLoadingMore: catalogStatus === "LoadingMore",
    catalogIsSearching: catalogStatus === "LoadingFirstPage",
    loadMoreCatalog,
  } as const;
}
