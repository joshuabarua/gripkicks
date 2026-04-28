import { Context } from 'hono';
import { ResultAsync, err, ok } from 'neverthrow';
import { 
  UnauthenticatedError, 
  ValidationError, 
  NotFoundError,
  UnexpectedError 
} from '../src/lib/errors';
import { resultAsyncToHonoResponse } from '../utils/response';
import { getConvexUrl, fetchWithTimeout } from '../utils/convexHelper';
import { logApiError } from '../utils/errorLogger';
import { checkUserAuthentication, validateRequiredParam, verifyOwnership, handleControllerError } from './utils/controllerHelpers';

export const getUserStash = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');

  const result = await ResultAsync.fromPromise(
    (async () => {
      const convexUrl = getConvexUrl();

      // Get user's stash
      const stashResponse = await fetchWithTimeout(`${convexUrl}/api/stash/getUserStash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betterAuthId: user.id })
      });

      if (!stashResponse.ok) {
        console.error('Failed to get stash from Convex:', await stashResponse.text());
        return [];
      }

      const stashData = await stashResponse.json();
      return stashData.data || [];
    })(),
    (error) => new UnexpectedError('Failed to fetch stash')
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const addToStash = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');

  const result = await ResultAsync.fromPromise(
    (async () => {
      const body = await c.req.json();
      const { shoeId } = body;

      if (!shoeId) {
        throw new ValidationError('Shoe ID is required');
      }

      const convexUrl = getConvexUrl();

      // Add to stash using betterAuthId
      const addResponse = await fetchWithTimeout(`${convexUrl}/api/stash/addToStash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betterAuthId: user.id,
          shoeId: shoeId
        })
      });

      if (!addResponse.ok) {
        throw new UnexpectedError('Failed to add to stash');
      }

      const addData = await addResponse.json();
      return addData;
    })(),
    (error) => handleControllerError(error, 'add to stash', 'POST', '/api/v1/stash', user.id)
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const removeFromStash = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');

  const userShoeId = c.req.param('shoeId');
  const paramError = validateRequiredParam(userShoeId, 'Shoe ID', c);
  if (paramError) return paramError;

  const result = await ResultAsync.fromPromise(
    (async () => {
      const convexUrl = getConvexUrl();

      await verifyOwnership(c, userShoeId);

      // Delete the userShoe document
      const deleteResponse = await fetchWithTimeout(`${convexUrl}/api/stash/deleteUserShoe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userShoeId })
      });

      if (!deleteResponse.ok) {
        throw new UnexpectedError('Failed to remove from stash');
      }

      return { success: true, message: 'Removed from stash' };
    })(),
    (error) => handleControllerError(error, 'remove from stash', 'DELETE', `/api/v1/stash/${userShoeId}`, user.id)
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const updateUserShoeStats = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');

  const userShoeId = c.req.param('userShoeId');
  const paramError = validateRequiredParam(userShoeId, 'User shoe ID', c);
  if (paramError) return paramError;

  const result = await ResultAsync.fromPromise(
    (async () => {
      const body = await c.req.json();
      const convexUrl = getConvexUrl();

      await verifyOwnership(c, userShoeId);

      // Update shoe stats
      const updateResponse = await fetchWithTimeout(`${convexUrl}/api/stash/updateUserShoeStats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userShoeId: userShoeId,
          size: body.size,
          purchaseDate: body.purchaseDate,
          condition: body.condition,
          notes: body.notes,
          comfortScore: body.comfortScore ? parseInt(body.comfortScore) : undefined,
          performanceRating: body.performanceRating ? parseInt(body.performanceRating) : undefined,
          durabilityRating: body.durabilityRating ? parseInt(body.durabilityRating) : undefined
        })
      });

      if (!updateResponse.ok) {
        throw new UnexpectedError('Failed to update shoe stats');
      }

      const updateData = await updateResponse.json();
      return {
        success: true,
        message: 'Shoe stats updated successfully',
        data: updateData.data
      };
    })(),
    (error) => handleControllerError(error, 'update shoe stats', 'PUT', `/api/v1/stash/${userShoeId}`, user.id)
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const toggleFavourite = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');

  const userShoeId = c.req.param('userShoeId');
  const paramError = validateRequiredParam(userShoeId, 'User shoe ID', c);
  if (paramError) return paramError;

  const result = await ResultAsync.fromPromise(
    (async () => {
      const convexUrl = getConvexUrl();

      await verifyOwnership(c, userShoeId);

      // Toggle favourite
      const toggleResponse = await fetchWithTimeout(`${convexUrl}/api/stash/toggleFavourite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userShoeId })
      });

      if (!toggleResponse.ok) {
        throw new UnexpectedError('Failed to toggle favourite');
      }

      const toggleData = await toggleResponse.json();
      return {
        success: true,
        message: 'Favourite status updated',
        data: toggleData.data
      };
    })(),
    (error) => handleControllerError(error, 'toggle favourite', 'POST', `/api/v1/stash/${userShoeId}/favourite`, user.id)
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};
