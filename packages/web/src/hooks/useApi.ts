import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { ApiError } from '@/lib/errors';

// Types for API responses
interface HealthResponse {
  status: string;
  uptime: number;
  message: string;
}

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// Fetch user profile
export function useProfile() {
  return useQuery<ProfileResponse, ApiError>({
    queryKey: ['profile'],
    queryFn: async () => {
      const result = await fetchApi<ProfileResponse>('/api/v1/profile');
      return result.match(
        (data) => data,
        (error) => {
          throw error;
        }
      );
    },
  });
}

// Health check
export function useHealthCheck() {
  return useQuery<HealthResponse, ApiError>({
    queryKey: ['health'],
    queryFn: async () => {
      const result = await fetchApi<HealthResponse>('/health');
      return result.match(
        (data) => data,
        (error) => {
          throw error;
        }
      );
    },
    staleTime: 30000, // 30 seconds
  });
}
