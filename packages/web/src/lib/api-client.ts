import { hc } from 'hono/client';

// Create type-safe Hono RPC client
// Note: For full type safety, run `yarn build` in backend-api first
// Then import: import type { AppType } from 'backend-api/src/main';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Basic client without full type inference (works without building backend)
export const apiClient = hc(apiBaseUrl, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      credentials: 'include', // Include cookies for auth
    });
  },
});

// Helper function for API calls
export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  
  return res.json();
}

// Export the API client for use in components
export default apiClient;
