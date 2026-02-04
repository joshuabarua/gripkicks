import { Context } from 'hono';
import { logApiError, createErrorResponse } from '../utils/errorLogger';
import { userService } from '../services/user.service';
import { resultToHonoResponse } from '../utils/response';
import { UnauthorizedError } from '../src/lib/errors';
import { findUserByBetterAuthId, updateUserInConvex, getConvexUrl, fetchWithTimeout } from '../utils/convexHelper';

export const getUsers = async (c: Context): Promise<Response> => {
  try {
    // TODO: Replace with Convex when ready
    // For now, return empty users array
    const users: any[] = [];
    return c.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ success: false, message: 'Failed to fetch users', error: String(error) }, 500);
  }
};

export const getUserById = async (c: Context): Promise<Response> => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ success: false, message: 'User ID is required' }, 400);
  }
  try {
    // TODO: Replace with Convex query
    // For now, return null user
    return c.json({ success: false, message: 'User not found', error: 'No user found with the provided ID' }, 404);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ success: false, message: 'Failed to fetch user', error: String(error) }, 500);
  }
};

export const getProfile = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }

  try {
    // Find user in Convex using Better Auth ID
    const userResult = await findUserByBetterAuthId(user.id);
    
    if (!userResult.success) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      data: userResult.data
    });
  } catch (error) {
    logApiError('Failed to get profile', error, {
      method: 'GET',
      url: '/api/v1/profile',
      userId: user.id
    });
    return c.json(createErrorResponse(error, 'Failed to get profile'), 500);
  }
};

export const editProfile = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }
  const body = await c.req.json();
  const updateFields: Record<string, any> = {};
  if (typeof body.name === 'string' && body.name !== '') updateFields.name = body.name;
  if (typeof body.phone === 'string' && body.phone !== '') updateFields.phone = body.phone;
  if (typeof body.image === 'string' && body.image !== '') updateFields.image = body.image;
  if (typeof body.footShape === 'string' && body.footShape !== '') updateFields.footShape = body.footShape;
  if (typeof body.footVolume === 'string' && body.footVolume !== '') updateFields.footVolume = body.footVolume;
  if (Object.keys(updateFields).length === 0) {
    return c.json({ success: false, message: 'No fields to update' }, 400);
  }
  try {
    // Find user in Convex using Better Auth ID
    const userResult = await findUserByBetterAuthId(user.id);
    
    if (!userResult.success) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    // Update the user using the Convex user ID
    const updateResult = await updateUserInConvex(userResult.data._id, updateFields);
    
    if (!updateResult.success) {
      return c.json({ success: false, message: 'Failed to update profile' }, 500);
    }

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateResult.data
    });
  } catch (error) {
    logApiError('Failed to update profile', error, {
      method: 'PUT',
      url: '/api/v1/profile',
      userId: user.id,
      body: updateFields
    });
    return c.json(createErrorResponse(error, 'Failed to update profile'), 500);
  }
};

export const completeOnboarding = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized', error: 'User not found in context' }, 401);
  }

  try {
    const body = await c.req.json();
    const { footShape, favoriteShoeId } = body;

    // Validate footShape
    const validFootShapes = ['egyptian', 'roman', 'greek', 'germanic', 'celtic'];
    if (footShape && !validFootShapes.includes(footShape)) {
      return c.json({ success: false, message: 'Invalid foot shape' }, 400);
    }

    // Find user in Convex using Better Auth ID
    const userResult = await findUserByBetterAuthId(user.id);
    
    if (!userResult.success) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }

    // Update user with onboarding data
    const updateResult = await updateUserInConvex(userResult.data._id, {
      footShape: footShape || undefined,
      onboardingComplete: true
    });

    if (!updateResult.success) {
      return c.json({ success: false, message: 'Failed to complete onboarding' }, 500);
    }

    return c.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        id: user.id,
        footShape: footShape || undefined,
        favoriteShoeId: favoriteShoeId || undefined,
        onboardingComplete: true,
      }
    });
  } catch (error) {
    logApiError('Failed to complete onboarding', error, {
      method: 'POST',
      url: '/api/v1/users/onboarding',
      userId: user.id,
    });
    return c.json(createErrorResponse(error, 'Failed to complete onboarding'), 500);
  }
};

export const getShoes = async (c: Context): Promise<Response> => {
  try {
    // For now, return empty array until Convex is properly set up
    // TODO: Replace with actual Convex query
    const shoes: any[] = [];
    return c.json({ success: true, data: shoes });
  } catch (error) {
    console.error('Error fetching shoes:', error);
    return c.json({ success: false, message: 'Failed to fetch shoes', error: String(error) }, 500);
  }
};

export const getUserStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  try {
    const convexUrl = getConvexUrl();

    // Try to get user's Convex ID
    let userResponse = await fetchWithTimeout(`${convexUrl}/api/users/findByBetterAuthId`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betterAuthId: user.id })
    });

    // If user doesn't exist in Convex, return empty stash
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Failed to get user from Convex:', errorText);
      return c.json({ success: true, data: [] });
    }

    const userData = await userResponse.json();

    if (!userData.data) {
      // User not synced yet, return empty stash
      return c.json({ success: true, data: [] });
    }

    // Get user's stash
    const stashResponse = await fetchWithTimeout(`${convexUrl}/api/stash/getUserStash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userData.data._id })
    });

    if (!stashResponse.ok) {
      console.error('Failed to get stash from Convex:', await stashResponse.text());
      return c.json({ success: true, data: [] });
    }

    const stashData = await stashResponse.json();
    return c.json({ success: true, data: stashData.data || [] });
  } catch (error) {
    logApiError('Failed to fetch stash', error, {
      method: 'GET',
      url: '/api/v1/stash',
      userId: user.id
    });
    return c.json(createErrorResponse(error, 'Failed to fetch stash'), 500);
  }
};

export const addToStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  let shoeId: string | undefined;

  try {
    const body = await c.req.json();
    shoeId = body.shoeId;

    if (!shoeId) {
      return c.json({ success: false, message: 'Shoe ID is required' }, 400);
    }

    // Get the Convex HTTP URL
    const convexUrl = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL ||
      (process.env.CONVEX_URL?.replace('.convex.cloud', '.convex.site')) ||
      'http://localhost:3210';

    // First, try to get user's Convex ID
    const userResponse = await fetch(`${convexUrl}/api/users/findByBetterAuthId`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betterAuthId: user.id })
    });

    let userData;
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    // If user doesn't exist in Convex, sync them first
    if (!userResponse.ok || !userData?.data) {
      console.log('User not found in Convex, syncing first...');

      // Sync user to Convex with deduplication
      const syncResponse = await fetch(`${convexUrl}/api/sync-user-deduplicated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betterAuthId: user.id,
          email: user.email,
          name: user.name || '',
          image: user.image || '',
          emailVerified: user.emailVerified || false,
        })
      });

      if (!syncResponse.ok) {
        console.error('Failed to sync user to Convex:', await syncResponse.text());
        return c.json({ success: false, message: 'Failed to sync user' }, 500);
      }

      // Try getting user again
      const userResponse2 = await fetch(`${convexUrl}/api/users/findByBetterAuthId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betterAuthId: user.id })
      });

      if (!userResponse2.ok) {
        console.error('Failed to get user from Convex after sync:', await userResponse2.text());
        return c.json({ success: false, message: 'Failed to find user after sync' }, 500);
      }

      userData = await userResponse2.json();
    }

    if (!userData?.data) {
      return c.json({ success: false, message: 'User not found in Convex' }, 404);
    }

    // Add to stash
    const addResponse = await fetch(`${convexUrl}/api/stash/addToStash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userData.data._id,
        shoeId: shoeId
      })
    });

    if (!addResponse.ok) {
      console.error('Failed to add to stash in Convex:', await addResponse.text());
      return c.json({ success: false, message: 'Failed to add to stash' }, 500);
    }

    const addData = await addResponse.json();
    return c.json({ success: true, message: 'Added to stash', data: addData });
  } catch (error) {
    logApiError('Failed to add to stash', error, {
      method: 'POST',
      url: '/api/v1/stash',
      userId: user.id,
      body: shoeId ? { shoeId } : undefined
    });
    return c.json(createErrorResponse(error, 'Failed to add to stash'), 500);
  }
};

export const removeFromStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  const userShoeId = c.req.param('shoeId');

  if (!userShoeId) {
    return c.json({ success: false, message: 'Shoe ID is required' }, 400);
  }

  try {
    // Get the Convex HTTP URL
    const convexUrl = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL ||
      (process.env.CONVEX_URL?.replace('.convex.cloud', '.convex.site')) ||
      'http://localhost:3210';

    // Verify ownership before removing
    const ownershipResponse = await fetch(`${convexUrl}/api/stash/verifyOwnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userShoeId: userShoeId,
        betterAuthUserId: user.id
      })
    });

    if (!ownershipResponse.ok) {
      const errorText = await ownershipResponse.text();
      logApiError('Failed to verify ownership', new Error(errorText), {
        method: 'POST',
        url: '/api/stash/verifyOwnership',
        userId: user.id,
        body: { userShoeId }
      });
      return c.json(createErrorResponse(new Error(errorText), 'Failed to verify ownership'), 500);
    }

    const ownershipData = await ownershipResponse.json();
    if (!ownershipData.data?.owned) {
      logApiError('Ownership verification failed', new Error(ownershipData.data?.reason || 'Access denied'), {
        method: 'DELETE',
        url: `/api/v1/stash/${userShoeId}`,
        userId: user.id
      });
      return c.json({ success: false, message: 'You can only remove your own shoes' }, 403);
    }

    // Delete the userShoe document directly
    const deleteResponse = await fetch(`${convexUrl}/api/stash/deleteUserShoe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userShoeId: userShoeId
      })
    });

    if (!deleteResponse.ok) {
      console.error('Failed to delete user shoe in Convex:', await deleteResponse.text());
      return c.json({ success: false, message: 'Failed to remove from stash' }, 500);
    }

    return c.json({ success: true, message: 'Removed from stash' });
  } catch (error) {
    logApiError('Failed to remove from stash', error, {
      method: 'DELETE',
      url: `/api/v1/stash/${userShoeId}`,
      userId: user.id
    });
    return c.json(createErrorResponse(error, 'Failed to remove from stash'), 500);
  }
};

export const updateUserShoeStats = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  const userShoeId = c.req.param('userShoeId');

  if (!userShoeId) {
    return c.json({ success: false, message: 'User shoe ID is required' }, 400);
  }

  let body: any;

  try {
    body = await c.req.json();

    const convexUrl = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL ||
      (process.env.CONVEX_URL?.replace('.convex.cloud', '.convex.site')) ||
      'http://localhost:3210';

    const ownershipResponse = await fetch(`${convexUrl}/api/stash/verifyOwnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userShoeId: userShoeId,
        betterAuthUserId: user.id
      })
    });

    if (!ownershipResponse.ok) {
      const errorText = await ownershipResponse.text();
      logApiError('Failed to verify ownership', new Error(errorText), {
        method: 'POST',
        url: '/api/stash/verifyOwnership',
        userId: user.id,
        body: { userShoeId }
      });
      return c.json(createErrorResponse(new Error(errorText), 'Failed to verify ownership'), 500);
    }

    const ownershipData = await ownershipResponse.json();
    if (!ownershipData.data?.owned) {
      logApiError('Ownership verification failed', new Error(ownershipData.data?.reason || 'Access denied'), {
        method: 'PUT',
        url: `/api/v1/stash/${userShoeId}`,
        userId: user.id,
        body: body
      });
      return c.json({ success: false, message: 'You can only modify your own shoes' }, 403);
    }

    const updateResponse = await fetch(`${convexUrl}/api/stash/updateUserShoeStats`, {
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
      const errorText = await updateResponse.text();
      logApiError('Failed to update shoe stats in Convex', new Error(errorText), {
        method: 'POST',
        url: '/api/stash/updateUserShoeStats',
        userId: user.id,
        body
      });
      return c.json(createErrorResponse(new Error(errorText), 'Failed to update shoe stats'), 500);
    }

    const updateData = await updateResponse.json();
    return c.json({
      success: true,
      message: 'Shoe stats updated successfully',
      data: updateData.data
    });
  } catch (error) {
    logApiError('Failed to update shoe stats', error, {
      method: 'PUT',
      url: `/api/v1/stash/${userShoeId}`,
      userId: user.id,
      body: body || undefined
    });
    return c.json(createErrorResponse(error, 'Failed to update shoe stats'), 500);
  }
};

export const toggleFavourite = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  const userShoeId = c.req.param('userShoeId');

  if (!userShoeId) {
    return c.json({ success: false, message: 'User shoe ID is required' }, 400);
  }

  try {
    const convexUrl = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL ||
      (process.env.CONVEX_URL?.replace('.convex.cloud', '.convex.site')) ||
      'http://localhost:3210';

    const ownershipResponse = await fetch(`${convexUrl}/api/stash/verifyOwnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userShoeId: userShoeId,
        betterAuthUserId: user.id
      })
    });

    if (!ownershipResponse.ok) {
      const errorText = await ownershipResponse.text();
      return c.json(createErrorResponse(new Error(errorText), 'Failed to verify ownership'), 500);
    }

    const ownershipData = await ownershipResponse.json();
    if (!ownershipData.data?.owned) {
      return c.json({ success: false, message: 'You can only modify your own shoes' }, 403);
    }

    const toggleResponse = await fetch(`${convexUrl}/api/stash/toggleFavourite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userShoeId })
    });

    if (!toggleResponse.ok) {
      const errorText = await toggleResponse.text();
      return c.json(createErrorResponse(new Error(errorText), 'Failed to toggle favourite'), 500);
    }

    const toggleData = await toggleResponse.json();
    return c.json({
      success: true,
      message: 'Favourite status updated',
      data: toggleData.data
    });
  } catch (error) {
    logApiError('Failed to toggle favourite', error, {
      method: 'POST',
      url: `/api/v1/stash/${userShoeId}/favourite`,
      userId: user.id
    });
    return c.json(createErrorResponse(error, 'Failed to toggle favourite'), 500);
  }
};
