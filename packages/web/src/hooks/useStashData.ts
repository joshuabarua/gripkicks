import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { GetStashResponse, UserShoe } from '@/types/api';
import { shoeCache } from '@/lib/cache';
import { getUserStash } from '@/services/stash';

interface UseStashDataOptions {
  enabled?: boolean;
  onError?: (message: string) => void;
}

export function useStashData(sessionUserId?: string, options?: UseStashDataOptions) {
  const [userShoes, setUserShoes] = useState<UserShoe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { enabled = true, onError } = options ?? {};

  const shoesData = useQuery(api.shoes.list);
  const popularityData = useQuery(api.popularity.getAllShoesPopularity);

  const allShoes = useMemo(() => shoesData ?? [], [shoesData]);
  const popularityMap = useMemo(() => (
    popularityData ? new Map(popularityData.map((p) => [p.shoeId, p.count])) : new Map<string, number>()
  ), [popularityData]);
  const totalShoesInDatabase = useMemo(
    () => popularityData?.reduce((sum, p) => sum + p.count, 0) ?? 0,
    [popularityData]
  );
  const uniqueBrands = useMemo(
    () => [...new Set(allShoes.map((shoe) => shoe.brand))].sort(),
    [allShoes]
  );

  const fetchUserStash = useCallback(async () => {
    if (!sessionUserId || !enabled) return;

    const cacheKey = `user-stash-${sessionUserId}`;

    setIsLoading(true);
    const cachedData = shoeCache.get<GetStashResponse>(cacheKey);
    if (cachedData) {
      setUserShoes(cachedData.data || []);
      setIsLoading(false);
      return;
    }

    const result = await getUserStash();
    result.match(
      (value) => {
        setUserShoes(value.data || []);
        shoeCache.set(cacheKey, value, 5 * 60 * 1000);
      },
      (error) => {
        console.error('Failed to fetch user stash:', error);
        onError?.('Failed to load your shoe collection');
      }
    );
    setIsLoading(false);
  }, [sessionUserId, enabled, onError]);

  useEffect(() => {
    if (sessionUserId && enabled) {
      void fetchUserStash();
    } else {
      setUserShoes([]);
      setIsLoading(false);
    }
  }, [sessionUserId, enabled, fetchUserStash]);

  const invalidateCache = useCallback(() => {
    if (sessionUserId) {
      shoeCache.delete(`user-stash-${sessionUserId}`);
    }
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
