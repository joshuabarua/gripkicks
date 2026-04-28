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
import { checkUserAuthentication, validateRequiredParam, verifyOwnership, handleControllerError, authenticatedConvexRequest } from './utils/controllerHelpers';

export const getUserStash = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');

  const result = await ResultAsync.fromPromise(
    authenticatedConvexRequest(c, '/api/stash/getUserStash', 'POST', { betterAuthId: user.id }),
    (error) => handleControllerError(error, 'fetch stash', 'GET', '/api/v1/stash', user.id)
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const addToStash = async (c: Context): Promise<Response> => {
  const authError = checkUserAuthentication(c);
  if (authError) return authError;

  const user = c.get('user');
  const body = await c.req.json();
  const { shoeId } = body;

  if (!shoeId) {
    return resultAsyncToHonoResponse(c, Promise.resolve(err(new ValidationError('Shoe ID is required'))));
  }

  const result = await ResultAsync.fromPromise(
    authenticatedConvexRequest(c, '/api/stash/addToStash', 'POST', {
      betterAuthId: user.id,
      shoeId
    }),
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

  await verifyOwnership(c, userShoeId);

  const result = await ResultAsync.fromPromise(
    authenticatedConvexRequest(c, '/api/stash/deleteUserShoe', 'POST', { userShoeId }),
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

  const body = await c.req.json();
  await verifyOwnership(c, userShoeId);

  const result = await ResultAsync.fromPromise(
    authenticatedConvexRequest(c, '/api/stash/updateUserShoeStats', 'POST', {
      userShoeId,
      size: body.size,
      purchaseDate: body.purchaseDate,
      condition: body.condition,
      notes: body.notes,
      comfortScore: body.comfortScore ? parseInt(body.comfortScore) : undefined,
      performanceRating: body.performanceRating ? parseInt(body.performanceRating) : undefined,
      durabilityRating: body.durabilityRating ? parseInt(body.durabilityRating) : undefined
    }),
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

  await verifyOwnership(c, userShoeId);

  const result = await ResultAsync.fromPromise(
    authenticatedConvexRequest(c, '/api/stash/toggleFavourite', 'POST', { userShoeId }),
    (error) => handleControllerError(error, 'toggle favourite', 'PATCH', `/api/v1/stash/${userShoeId}/favourite`, user.id)
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};
