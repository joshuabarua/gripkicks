import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '@/lib/query-client';
import { getUserStash, addShoeToStash as addShoeToStashService, removeShoeFromStash as removeShoeFromStashService, updateShoeInStash, toggleFavouriteInStash } from '@/services/stash';
import type { UserShoe } from '@/types/api';

// Optimized hook for fetching user stash with aggressive caching
export function useUserStash(userId?: string) {
  return useQuery({
    queryKey: queryKeys.userStash(userId || ''),
    queryFn: async () => {
      const result = await getUserStash();
      if (result.isErr()) {
        throw result.error;
      }
      return result.value;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - user data changes frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

// Optimized hook for all shoes data (cached for longer)
export function useAllShoes() {
  return useQuery({
    queryKey: queryKeys.shoes,
    queryFn: async () => {
      const response = await fetch('/api/shoes');
      if (!response.ok) throw new Error('Failed to fetch shoes');
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - shoes data rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
  });
}

// Optimized hook for popularity data
export function usePopularityData() {
  return useQuery({
    queryKey: queryKeys.popularity,
    queryFn: async () => {
      const response = await fetch('/api/popularity');
      if (!response.ok) throw new Error('Failed to fetch popularity data');
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    refetchOnWindowFocus: false,
  });
}

// Mutation for adding shoe to stash with optimistic updates
export function useAddShoeToStash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shoeId: string) => {
      const result = await addShoeToStashService(shoeId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onMutate: async (shoeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userStash("") });

      const previousStash = queryClient.getQueryData(queryKeys.userStash(""));

      queryClient.setQueryData(queryKeys.userStash(""), (old: UserShoe[] = []) => [
        ...old,
        {
          _id: `temp-${Date.now()}`,
          shoeId,
        } as UserShoe,
      ]);

      return { previousStash };
    },
    onError: (_err, _shoeId, context) => {
      queryClient.setQueryData(queryKeys.userStash(""), (context as { previousStash: UserShoe[] })?.previousStash);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userStash("") });
    },
  });
}

// Mutation for removing shoe from stash with optimistic updates
export function useRemoveShoeFromStash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shoeId: string) => {
      const result = await removeShoeFromStashService(shoeId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onMutate: async (shoeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userStash("") });

      const previousStash = queryClient.getQueryData(queryKeys.userStash(""));

      queryClient.setQueryData(queryKeys.userStash(""), (old: UserShoe[] = []) =>
        old.filter(shoe => shoe.shoeId !== shoeId)
      );

      return { previousStash };
    },
    onError: (_err, _shoeId, context) => {
      queryClient.setQueryData(queryKeys.userStash(""), (context as { previousStash: UserShoe[] })?.previousStash);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userStash("") });
    },
  });
}

// Mutation for updating shoe stats with optimistic updates
export function useUpdateShoeStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shoeId, updates }: { shoeId: string; updates: Partial<UserShoe> }) => {
      const result = await updateShoeInStash(shoeId, updates);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onMutate: async ({ shoeId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userStash("") });

      const previousStash = queryClient.getQueryData(queryKeys.userStash(""));

      queryClient.setQueryData(queryKeys.userStash(""), (old: UserShoe[] = []) =>
        old.map(shoe => shoe._id === shoeId ? { ...shoe, ...updates } : shoe)
      );

      return { previousStash };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(queryKeys.userStash(""), (context as { previousStash: UserShoe[] })?.previousStash);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userStash("") });
    },
  });
}

// Mutation for toggling favorite status with optimistic updates
export function useToggleFavourite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shoeId: string) => {
      const result = await toggleFavouriteInStash(shoeId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onMutate: async (shoeId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userStash("") });

      const previousStash = queryClient.getQueryData(queryKeys.userStash(""));

      queryClient.setQueryData(queryKeys.userStash(""), (old: UserShoe[] = []) =>
        old.map(shoe =>
          shoe._id === shoeId ? { ...shoe, isFavourite: !shoe.isFavourite } : shoe
        )
      );

      return { previousStash };
    },
    onError: (_err, _shoeId, context) => {
      queryClient.setQueryData(queryKeys.userStash(""), (context as { previousStash: UserShoe[] })?.previousStash);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userStash("") });
    },
  });
}

// Combined hook that provides all stash functionality
export function useStashWithCache(userId?: string) {
  const userStash = useUserStash(userId);
  const allShoes = useAllShoes();
  const popularityData = usePopularityData();
  const queryClient = useQueryClient();

  const addShoeMutation = useAddShoeToStash();
  const removeShoeMutation = useRemoveShoeFromStash();
  const updateStatsMutation = useUpdateShoeStats();
  const toggleFavouriteMutation = useToggleFavourite();

  const invalidateStashCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userStash(userId || '') });
  }, [userId, queryClient]);

  return {
    // Data
    userShoes: userStash.data || [],
    allShoes: allShoes.data || [],
    popularityMap: popularityData.data ?
      new Map(popularityData.data.map((p: { shoeId: string; count: number }) => [p.shoeId, p.count])) :
      new Map<string, number>(),

    // Loading states
    isLoading: userStash.isLoading || allShoes.isLoading || popularityData.isLoading,
    isError: userStash.isError || allShoes.isError || popularityData.isError,

    // Mutations
    addShoe: addShoeMutation.mutate,
    removeShoe: removeShoeMutation.mutate,
    updateStats: updateStatsMutation.mutate,
    toggleFavourite: toggleFavouriteMutation.mutate,

    // Cache management
    invalidateCache: invalidateStashCache,

    // Mutation states
    isAdding: addShoeMutation.isPending,
    isRemoving: removeShoeMutation.isPending,
    isUpdating: updateStatsMutation.isPending,
    isToggling: toggleFavouriteMutation.isPending,
  };
}
