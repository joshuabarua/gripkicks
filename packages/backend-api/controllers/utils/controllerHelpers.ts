import { Context } from 'hono';
import { ResultAsync, err } from 'neverthrow';
import { UnauthenticatedError, ValidationError, UnexpectedError } from '../../src/lib/errors';
import { resultAsyncToHonoResponse } from '../../utils/response';
import { getConvexUrl, fetchWithTimeout } from '../../utils/convexHelper';
import { logApiError } from '../../utils/errorLogger';

export function checkUserAuthentication(c: Context) {
  const user = c.get('user');
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(c,
      Promise.resolve(err(new UnauthenticatedError('User not found in context')))
    );
  }
  return null;
}

export function validateRequiredParam(value: any, paramName: string, c: Context) {
  if (!value) {
    return resultAsyncToHonoResponse(c,
      Promise.resolve(err(new ValidationError(`${paramName} is required`)))
    );
  }
  return null;
}

export async function verifyOwnership(c: Context, userShoeId: string) {
  const user = c.get('user');
  const convexUrl = getConvexUrl();

  const ownershipResponse = await fetchWithTimeout(`${convexUrl}/api/stash/verifyOwnership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userShoeId: userShoeId,
      betterAuthUserId: user.id
    })
  });

  if (!ownershipResponse.ok) {
    throw new UnexpectedError('Failed to verify ownership');
  }

  const ownershipData = await ownershipResponse.json();
  if (!ownershipData.data?.owned) {
    throw new UnauthenticatedError('You can only modify your own shoes');
  }
}

export function logControllerError(operation: string, error: any, method: string, url: string, userId: string) {
  logApiError(`Failed to ${operation}`, error, {
    method,
    url,
    userId
  });
}

export function handleControllerError(error: any, operation: string, method: string, url: string, userId: string) {
  logControllerError(operation, error, method, url, userId);
  return error instanceof Error ? new UnexpectedError(error.message) : new UnexpectedError('Unknown error');
}

export async function authenticatedConvexRequest<T>(
  c: Context,
  endpoint: string,
  method: string = 'POST',
  body?: any
): Promise<T> {
  const user = c.get('user');
  const convexUrl = getConvexUrl();

  const response = await fetchWithTimeout(`${convexUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new UnexpectedError(`Convex request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}
