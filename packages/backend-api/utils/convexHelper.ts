import { logApiError } from './errorLogger';

const CONVEX_TIMEOUT = 10000; // 10 seconds

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = CONVEX_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

export function getConvexUrl(): string {
  const convexUrl = process.env.CONVEX_HTTP_URL || 
    process.env.CONVEX_SITE_URL ||
    (process.env.CONVEX_URL?.replace('.convex.cloud', '.convex.site')) ||
    'http://localhost:3210';
  
  return convexUrl;
}

export async function findUserByBetterAuthId(betterAuthId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const convexUrl = getConvexUrl();
  
  try {
    const response = await fetchWithTimeout(`${convexUrl}/api/users/findByBetterAuthId`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betterAuthId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      return { success: false, error: 'User not found in database' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    // Log error with proper context
    const errorContext = {
      method: 'POST',
      url: '/api/users/findByBetterAuthId',
      userId: betterAuthId, // Using betterAuthId as identifier
    };
    console.error('Failed to find user in Convex:', error, errorContext);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateUserInConvex(
  userId: string,
  updateData: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  const convexUrl = getConvexUrl();
  
  try {
    const response = await fetchWithTimeout(`${convexUrl}/api/users/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        ...updateData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    logApiError('Failed to update user in Convex', error, {
      method: 'POST',
      url: '/api/users/update',
      userId,
      body: updateData
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
