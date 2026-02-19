import { useMemo, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useSession } from "@/lib/auth";

export interface AggregatedRating {
  shoe: {
    _id: string;
    name: string;
    brand: string;
    imageUrl?: string;
    slug?: string;
    gender?: string;
    aggressiveness: string;
    stiffness: string;
    climbingDiscipline: string;
    volume: string;
  };
  avgComfortScore: number;
  avgPerformanceRating: number;
  avgDurabilityRating: number;
  totalRatings: number;
  matchScore: number;
  isSoleSibling: boolean;
}

interface ShoeRecommendation {
  _id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  slug?: string;
  gender?: string;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  avgComfortScore?: number;
  avgPerformanceRating?: number;
  avgDurabilityRating?: number;
  totalRatings: number;
  matchScore: number;
  isSoleSibling: boolean;
}

interface PaginatedResult {
  items: ShoeRecommendation[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

interface UseFindMyShoeReturn {
  recommendations: AggregatedRating[];
  soleSiblingSpotlight: AggregatedRating[];
  isLoading: boolean;
  hasProfile: boolean;
  hasShoes: boolean;
  userShoeCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
    pageSize: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
  };
}

const DEFAULT_PAGE_SIZE = 20;

export function useFindMyShoe(
  pageSize: number = DEFAULT_PAGE_SIZE,
): UseFindMyShoeReturn {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);

  const convexUser = useQuery(
    api.users.findByBetterAuthId,
    session?.user?.id ? { betterAuthId: session.user.id } : "skip",
  );

  const userStash = useQuery(
    api.stash.getUserStash,
    convexUser ? { userId: convexUser._id } : "skip",
  );

  const recommendationsQuery =
    "recommendations:getShoeRecommendations" as unknown as Parameters<
      typeof useQuery
    >[0];
  const recommendationsArgs = (convexUser?.footShape && convexUser?.footVolume
    ? {
        userId: convexUser._id,
        footShape: convexUser.footShape,
        footVolume: convexUser.footVolume,
        page: currentPage,
        pageSize,
      }
    : "skip") as unknown as Parameters<typeof useQuery>[1];

  const paginatedResult = useQuery(recommendationsQuery, recommendationsArgs);

  const isLoading =
    session === undefined ||
    convexUser === undefined ||
    userStash === undefined ||
    paginatedResult === undefined;

  const hasProfile = useMemo(() => {
    return !!(convexUser?.footShape && convexUser?.footVolume);
  }, [convexUser]);

  const hasShoes = useMemo(() => {
    return (userStash?.length ?? 0) > 0;
  }, [userStash]);

  const userShoeCount = userStash?.length ?? 0;

  const formattedRecommendations: AggregatedRating[] = useMemo(() => {
    if (!paginatedResult?.items) return [];

    return (paginatedResult as unknown as PaginatedResult).items.map(
      (shoe) => ({
        shoe: {
          _id: shoe._id,
          name: shoe.name,
          brand: shoe.brand,
          imageUrl: shoe.imageUrl,
          slug: shoe.slug,
          gender: shoe.gender,
          aggressiveness: shoe.aggressiveness,
          stiffness: shoe.stiffness,
          climbingDiscipline: shoe.climbingDiscipline,
          volume: shoe.volume,
        },
        avgComfortScore: shoe.avgComfortScore ?? 0,
        avgPerformanceRating: shoe.avgPerformanceRating ?? 0,
        avgDurabilityRating: shoe.avgDurabilityRating ?? 0,
        totalRatings: shoe.totalRatings,
        matchScore: shoe.matchScore,
        isSoleSibling: shoe.isSoleSibling,
      }),
    );
  }, [paginatedResult]);

  const soleSiblingSpotlight = useMemo(() => {
    return formattedRecommendations.filter((r) => r.isSoleSibling);
  }, [formattedRecommendations]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const nextPage = useCallback(() => {
    if ((paginatedResult as unknown as PaginatedResult | undefined)?.hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginatedResult]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const pagination = useMemo(
    () => ({
      currentPage:
        (paginatedResult as unknown as PaginatedResult | undefined)
          ?.currentPage ?? 1,
      totalPages:
        (paginatedResult as unknown as PaginatedResult | undefined)
          ?.totalPages ?? 0,
      totalCount:
        (paginatedResult as unknown as PaginatedResult | undefined)
          ?.totalCount ?? 0,
      hasMore:
        (paginatedResult as unknown as PaginatedResult | undefined)?.hasMore ??
        false,
      pageSize,
      goToPage,
      nextPage,
      prevPage,
    }),
    [paginatedResult, pageSize, goToPage, nextPage, prevPage],
  );

  return {
    recommendations: formattedRecommendations,
    soleSiblingSpotlight,
    isLoading,
    hasProfile,
    hasShoes,
    userShoeCount,
    pagination,
  };
}
