import { Context } from 'hono';
import prisma from '@/config/db.config';

export const getAllUsers = async (c: Context): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      // select: {
      //   id: true,
      //   name: true,
      //   email: true,
      //   isAdmin: true,
      //   createdAt: true
      // }
    });

    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
};
