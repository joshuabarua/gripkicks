import { Context } from 'hono';
import { UnauthenticatedError, UnexpectedError, AppError } from '../../src/lib/errors';
import { getConvexServiceHeaders, getConvexUrl } from '../../utils/convexHelper';

export function checkUserAuthentication(c: Context) {
  const user = c.get('user');
  if (!user) {
    const error = new UnauthenticatedError('Authentication required');
    c.status(401);
    return c.json({ error: error.message });
  }
  return null;
}

export function getAuthenticatedUser(c: Context) {
  const authError = checkUserAuthentication(c);
  if (authError) return { error: authError };
  const user = c.get('user');
  return { user };
}

export function validateRequiredParam(value: string | undefined, paramName: string, c: Context) {
  if (!value) {
    const error = new Error(`${paramName} is required`);
    c.status(400);
    return c.json({ error: error.message });
  }
  return null;
}

export async function verifyOwnership(c: Context, userShoeId: string) {
  const user = c.get('user');
  if (!user?.id) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const response = await fetch(`${getConvexUrl()}/api/stash/verifyOwnership`, {
    method: 'POST',
    headers: getConvexServiceHeaders(),
    body: JSON.stringify({
      userShoeId,
      betterAuthUserId: user.id,
    }),
  });
  const result = await response.json();
  if (!response.ok || result?.data?.owned !== true) {
    return c.json({ error: 'Shoe not found in your stash' }, 404);
  }

  return null;
}

export function handleControllerError(error: unknown, action: string, method: string, path: string, userId: string): AppError {
  console.error(`[${method}] ${path} - Error ${action} for user ${userId}:`, error);
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof Error) {
    return new UnexpectedError(error.message);
  }
  return new UnexpectedError('An unexpected error occurred');
}

export async function authenticatedConvexRequest(c: Context, endpoint: string, method: string, body: Record<string, unknown>) {
  const convexUrl = getConvexUrl();

  const user = c.get('user');
  if (!user) {
    throw new UnauthenticatedError('Authentication required');
  }

  const response = await fetch(`${convexUrl}${endpoint}`, {
    method,
    headers: getConvexServiceHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Convex request failed: ${response.statusText}`);
  }

  return response.json();
}
