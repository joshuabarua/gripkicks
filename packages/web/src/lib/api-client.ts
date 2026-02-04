import { hc } from 'hono/client';
import { ResultAsync } from 'neverthrow';
import { ApiError } from './errors';

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

// Helper function for API calls returning ResultAsync
export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<ResultAsync<T, ApiError>> {
  return ResultAsync.fromPromise(
    (async () => {
      const res = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!res.ok) {
        const errorData = res.headers.get('content-type')?.includes('application/json')
          ? await res.json().catch(() => ({}))
          : {};

        throw new ApiError({
          type: getErrorTypeFromStatus(res.status),
          message: errorData.message || `API error: ${res.status}`,
          details: errorData.details,
        });
      }

      return res.json();
    })(),
    (error) => {
      if (error instanceof ApiError) {
        return error;
      }
      return new ApiError({
        type: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown network error',
      });
    }
  );
}

// Helper to map HTTP status codes to error types
function getErrorTypeFromStatus(status: number): ApiError['type'] {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHENTICATED';
    case 403:
      return 'UNAUTHORIZED';
    case 404:
      return 'NOT_FOUND';
    case 408:
      return 'TIMEOUT_ERROR';
    case 418:
      return 'RANDOM_ERROR';
    case 422:
      return 'INVALID_DATA';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'INTERNAL_SERVER_ERROR';
    default:
      return 'NETWORK_ERROR';
  }
}

// Export the API client for use in components
export default apiClient;
