import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export function initializeAuth(prismaInstance: PrismaClient) {
  console.log('DEBUG: Initializing Better Auth with Prisma adapter');
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || 'default-secret-for-dev-please-change',
    emailAndPassword: { enabled: true },
    database: prismaAdapter(prismaInstance, { provider: 'postgresql' })
  });
}