import { PrismaClient } from '@prisma/client';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';


export function initializeAuth(prismaInstance: PrismaClient) {
  console.log('DEBUG: Initializing Better Auth with Prisma adapter');
  
  try {
    const options = {
      secret: process.env.BETTER_AUTH_SECRET || 'development-secret-do-not-use-in-production',
      database: prismaAdapter(prismaInstance, {
        provider: 'postgresql',
      }),
      emailAndPassword: { 
        enabled: true,
      },
      session: {
        expiresIn: 7 * 24 * 60 * 60, // 7 days
      },
    } satisfies BetterAuthOptions;

    console.log('Better Auth options configured with Prisma adapter');
    
    return betterAuth(options);
  } catch (error) {
    console.error('Error initializing Better Auth:', error);
    throw error;
  }
}