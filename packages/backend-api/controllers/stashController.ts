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

export const getUserStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new UnauthenticatedError('User not found in context')))
    );
  }

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
  const user = c.get('user');
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(c,
      Promise.resolve(err(new UnauthenticatedError('User not found in context')))
    );
  }

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
    (error) => {
      logApiError('Failed to add to stash', error, {
        method: 'POST',
        url: '/api/v1/stash',
        userId: user.id
      });
      return error instanceof Error ? new UnexpectedError(error.message) : new UnexpectedError('Unknown error');
    }
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const removeFromStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new UnauthenticatedError('User not found in context')))
    );
  }

  const userShoeId = c.req.param('shoeId');
  if (!userShoeId) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new ValidationError('Shoe ID is required')))
    );
  }

  const result = await ResultAsync.fromPromise(
    (async () => {
      const convexUrl = getConvexUrl();

      // Verify ownership
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
        throw new UnauthenticatedError('You can only remove your own shoes');
      }

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
    (error) => {
      logApiError('Failed to remove from stash', error, {
        method: 'DELETE',
        url: `/api/v1/stash/${userShoeId}`,
        userId: user.id
      });
      return error instanceof Error ? new UnexpectedError(error.message) : new UnexpectedError('Unknown error');
    }
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const updateUserShoeStats = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new UnauthenticatedError('User not found in context')))
    );
  }

  const userShoeId = c.req.param('userShoeId');
  if (!userShoeId) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new ValidationError('User shoe ID is required')))
    );
  }

  const result = await ResultAsync.fromPromise(
    (async () => {
      const body = await c.req.json();
      const convexUrl = getConvexUrl();

      // Verify ownership
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
    (error) => {
      logApiError('Failed to update shoe stats', error, {
        method: 'PUT',
        url: `/api/v1/stash/${userShoeId}`,
        userId: user.id
      });
      return error instanceof Error ? new UnexpectedError(error.message) : new UnexpectedError('Unknown error');
    }
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};

export const toggleFavourite = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new UnauthenticatedError('User not found in context')))
    );
  }

  const userShoeId = c.req.param('userShoeId');
  if (!userShoeId) {
    return resultAsyncToHonoResponse(c, 
      Promise.resolve(err(new ValidationError('User shoe ID is required')))
    );
  }

  const result = await ResultAsync.fromPromise(
    (async () => {
      const convexUrl = getConvexUrl();

      // Verify ownership
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
    (error) => {
      logApiError('Failed to toggle favourite', error, {
        method: 'POST',
        url: `/api/v1/stash/${userShoeId}/favourite`,
        userId: user.id
      });
      return error instanceof Error ? new UnexpectedError(error.message) : new UnexpectedError('Unknown error');
    }
  );

  return resultAsyncToHonoResponse(c, Promise.resolve(result));
};
