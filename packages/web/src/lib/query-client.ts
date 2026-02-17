import { QueryClient } from '@tanstack/react-query';

// Create a client with aggressive caching for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus (better UX)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations 2 times
      retry: 2,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Query keys for better cache management
export const queryKeys = {
  // User-related queries
  user: ['user'] as const,
  userStash: (userId: string) => ['user', 'stash', userId] as const,
  
  // Shoe-related queries
  shoes: ['shoes'] as const,
  shoe: (id: string) => ['shoes', id] as const,
  shoesByBrand: (brand: string) => ['shoes', 'brand', brand] as const,
  
  // Popularity queries
  popularity: ['popularity'] as const,
  shoePopularity: (shoeId: string) => ['popularity', 'shoe', shoeId] as const,
  
  // Recommendations
  recommendations: (userId: string) => ['recommendations', userId] as const,
  
  // Statistics
  stats: ['stats'] as const,
  userStats: (userId: string) => ['stats', 'user', userId] as const,
} as const;
