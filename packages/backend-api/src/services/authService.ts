import { betterAuth } from 'better-auth';

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function setAuthInstance(instance: ReturnType<typeof betterAuth>) {
  authInstance = instance;
}

export function getAuthInstance() {
  if (!authInstance) {
    throw new Error('Auth instance not initialized. Make sure it is set in main.ts first.');
  }
  return authInstance;
}
