import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/better-auth'; 
import prisma from '@/db'; 

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
