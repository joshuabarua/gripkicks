import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';

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
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => fetchApi<ProfileResponse>('/api/v1/profile'),
  });
}

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => fetchApi<HealthResponse>('/health'),
    staleTime: 30000, // 30 seconds
  });
}

// Export fetchApi for direct use
export { fetchApi };
