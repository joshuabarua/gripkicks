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
