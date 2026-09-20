import { Context } from 'hono';
import { callConvex, getConvexSiteUrl } from '../utils/convexClient';

export const syncUserToConvex = async (c: Context) => {
  try {
    const { id, email, name, image, emailVerified } = c.get('user');

    const convexResult = await callConvex('/api/sync-user', {
      id,
      email,
      name,
      image,
      emailVerified,
    });

    return c.json({
      success: true,
      message: 'User synced to Convex successfully',
      convexUrl: getConvexSiteUrl(),
      convexResult,
    });
  } catch (error) {
    console.error('Backend: Error syncing user to Convex:', error);
    return c.json({
      success: false,
      error: 'Failed to sync user to Convex',
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
};
