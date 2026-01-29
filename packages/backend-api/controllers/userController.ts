import { Context } from 'hono';

// TODO: Replace with Convex when ready

export const getUsers = async (c: Context): Promise<Response> => {
  try {
    // TODO: Replace with Convex query
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
    // TODO: Replace with Convex query
    // For now, return basic user info from context
    return c.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ success: false, message: 'Failed to fetch profile', error: String(error) }, 500);
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
  if (Object.keys(updateFields).length === 0) {
    return c.json({ success: false, message: 'No fields to update' }, 400);
  }
  try {
    // TODO: Replace with Convex mutation
    // For now, just return success with the updated fields
    return c.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: { ...user, ...updateFields } 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ success: false, message: 'Failed to update profile', error: String(error) }, 500);
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
    
    // TODO: Replace with Convex mutation
    // For now, just return success with the onboarding data
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
    console.error('Error completing onboarding:', error);
    return c.json({ success: false, message: 'Failed to complete onboarding', error: String(error) }, 500);
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
    // TODO: Replace with Convex query
    // For now, return empty stash
    const stash: any[] = [];
    return c.json({ success: true, data: stash });
  } catch (error) {
    console.error('Error fetching stash:', error);
    return c.json({ success: false, message: 'Failed to fetch stash', error: String(error) }, 500);
  }
};

export const addToStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  
  try {
    const body = await c.req.json();
    const { shoeId } = body;
    
    if (!shoeId) {
      return c.json({ success: false, message: 'Shoe ID is required' }, 400);
    }
    
    // TODO: Replace with Convex mutation
    // For now, just return success without database operations
    return c.json({ success: true, message: 'Added to stash', data: { userId: user.id, shoeId } });
  } catch (error) {
    console.error('Error adding to stash:', error);
    return c.json({ success: false, message: 'Failed to add to stash', error: String(error) }, 500);
  }
};

export const removeFromStash = async (c: Context): Promise<Response> => {
  const user = c.get('user');
  if (!user || !user.id) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  
  try {
    const shoeId = c.req.param('shoeId');
    
    if (!shoeId) {
      return c.json({ success: false, message: 'Shoe ID is required' }, 400);
    }
    
    // TODO: Replace with Convex mutation
    // For now, just return success without database operations
    return c.json({ success: true, message: 'Removed from stash' });
  } catch (error) {
    console.error('Error removing from stash:', error);
    return c.json({ success: false, message: 'Failed to remove from stash', error: String(error) }, 500);
  }
};
