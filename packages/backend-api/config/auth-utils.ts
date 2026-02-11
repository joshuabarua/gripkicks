/**
 * Better Auth utilities for robust error handling and session management
 */

import { Auth } from './auth.config';

export type AuthResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthClient {
  constructor(private auth: Auth) {}

  /**
   * Safe session retrieval with never-throw pattern
   */
  async getSession(sessionToken: string): Promise<AuthResult<any>> {
    try {
      const session = await this.auth.api.getSession({
        headers: { authorization: `Bearer ${sessionToken}` }
      });
      
      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      return { success: true, data: session };
    } catch (error) {
      console.error('Session retrieval error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Safe user creation with validation
   */
  async createUser(userData: {
    email: string;
    name?: string;
    password: string;
  }): Promise<AuthResult<any>> {
    try {
      if (!userData.email || !userData.password) {
        return { success: false, error: 'Email and password are required' };
      }

      const user = await this.auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name || '',
        }
      });

      return { success: true, data: user };
    } catch (error) {
      console.error('User creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'User creation failed' 
      };
    }
  }

  /**
   * Safe email sign in with rate limiting awareness
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult<any>> {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const result = await this.auth.api.signInEmail({
        body: { email, password }
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle specific rate limit errors
      if (error instanceof Error && error.message.includes('rate limit')) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    }
  }

  /**
   * Safe session validation with automatic cleanup
   */
  async validateSession(sessionToken: string): Promise<AuthResult<{ valid: boolean; userId?: string }>> {
    try {
      const sessionResult = await this.getSession(sessionToken);
      
      if (!sessionResult.success || !sessionResult.data) {
        return { success: true, data: { valid: false } };
      }

      const session = sessionResult.data;
      const now = Date.now();
      
      // Check if session is expired
      if (session.expiresAt && session.expiresAt < now) {
        // Clean up expired session
        await this.auth.api.signOut({
          headers: { authorization: `Bearer ${sessionToken}` }
        });
        return { success: true, data: { valid: false } };
      }

      return { 
        success: true, 
        data: { 
          valid: true, 
          userId: session.user?.id 
        } 
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: true, data: { valid: false } };
    }
  }

  /**
   * Safe sign out with cleanup
   */
  async signOut(sessionToken: string): Promise<AuthResult<void>> {
    try {
      await this.auth.api.signOut({
        headers: { authorization: `Bearer ${sessionToken}` }
      });
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      };
    }
  }
}

/**
 * Rate limit aware utility for sensitive operations
 */
export class RateLimitAwareAuth {
  constructor(private authClient: AuthClient) {}

  /**
   * Attempt operation with exponential backoff
   */
  async withRetry<T>(
    operation: () => Promise<AuthResult<T>>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<AuthResult<T>> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        // If successful or not a rate limit error, return immediately
        if (result.success || !result.error?.includes('rate limit')) {
          return result;
        }

        // If rate limited and not the last attempt, wait with exponential backoff
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (attempt === maxRetries) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Operation failed after retries' 
          };
        }
      }
    }

    return { success: false, error: 'Maximum retries exceeded' };
  }
}

/**
 * Helper function to create auth client with error handling
 */
export function createRobustAuth(auth: Auth) {
  const authClient = new AuthClient(auth);
  const rateLimitAware = new RateLimitAwareAuth(authClient);

  return {
    authClient,
    rateLimitAware,
    getSession: (token: string) => authClient.getSession(token),
    createUser: (data: { email: string; name?: string; password: string }) => 
      authClient.createUser(data),
    signInWithEmail: (email: string, password: string) => 
      rateLimitAware.withRetry(() => authClient.signInWithEmail(email, password)),
    validateSession: (token: string) => authClient.validateSession(token),
    signOut: (token: string) => authClient.signOut(token),
  };
}
