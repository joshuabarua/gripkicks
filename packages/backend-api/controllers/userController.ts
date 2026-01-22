import { Context } from 'hono';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (c: Context): Promise<Response> => {
  try {
    const users = await prisma.user.findMany();
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return c.json({ success: false, message: 'User not found', error: 'No user found with the provided ID' }, 404);
    }
    return c.json(user);
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
    const profile = await prisma.user.findUnique({ where: { id: user.id } });
    if (!profile) {
      return c.json({ success: false, message: 'Profile not found', error: 'No profile found for the user' }, 404);
    }
    return c.json(profile);
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
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: updateFields,
    });
    return c.json({ success: true, message: 'Profile updated successfully', data: updatedProfile });
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
    
    // Validate favoriteShoeId if provided
    if (favoriteShoeId) {
      const shoe = await prisma.shoe.findUnique({ where: { id: favoriteShoeId } });
      if (!shoe) {
        return c.json({ success: false, message: 'Shoe not found' }, 404);
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        footShape: footShape || undefined,
        favoriteShoeId: favoriteShoeId || undefined,
        onboardingComplete: true,
      },
      include: {
        favoriteShoe: true,
      },
    });
    
    return c.json({ 
      success: true, 
      message: 'Onboarding completed successfully', 
      data: updatedUser 
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return c.json({ success: false, message: 'Failed to complete onboarding', error: String(error) }, 500);
  }
};

export const getShoes = async (c: Context): Promise<Response> => {
  try {
    const shoes = await prisma.shoe.findMany({
      include: {
        rubberTechnology: true,
      },
      orderBy: [{ brand: 'asc' }, { name: 'asc' }],
    });
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
    const stash = await prisma.userShoe.findMany({
      where: { userId: user.id },
      include: { shoe: true },
      orderBy: { createdAt: 'desc' },
    });
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
    
    // Check if shoe exists
    const shoe = await prisma.shoe.findUnique({ where: { id: shoeId } });
    if (!shoe) {
      return c.json({ success: false, message: 'Shoe not found' }, 404);
    }
    
    // Add to stash (upsert to handle duplicates)
    const userShoe = await prisma.userShoe.upsert({
      where: {
        userId_shoeId: { userId: user.id, shoeId },
      },
      update: {},
      create: { userId: user.id, shoeId },
      include: { shoe: true },
    });
    
    return c.json({ success: true, message: 'Added to stash', data: userShoe });
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
    
    await prisma.userShoe.deleteMany({
      where: { userId: user.id, shoeId },
    });
    
    return c.json({ success: true, message: 'Removed from stash' });
  } catch (error) {
    console.error('Error removing from stash:', error);
    return c.json({ success: false, message: 'Failed to remove from stash', error: String(error) }, 500);
  }
};
