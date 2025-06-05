import { authClient } from './auth';

// Interfaces for auth types
interface AuthError {
  message: string;
  code?: string;
  [key: string]: unknown;
}

interface ErrorContext {
  error: AuthError;
  [key: string]: unknown;
}

interface Session {
  user: unknown;
  isAuthenticated: boolean;
  expires?: string;
  [key: string]: unknown;
}

// Export compatible interfaces for existing components
export const signIn = {
  email: async ({ email, password, fetchOptions }: { 
    email: string; 
    password: string; 
    fetchOptions?: { 
      onResponse?: () => void; 
      onError?: (context: ErrorContext) => void; 
      onSuccess?: (session: Session) => void; 
    } 
  }) => {
    try {
      // Signal response received if callback provided
      fetchOptions?.onResponse?.();
      
      const result = await authClient.login(email, password);
      
      if (result.error) {
        // Handle login error
        fetchOptions?.onError?.({ error: { message: result.error.message } });
        return { error: result.error.message };
      }
      
      // Get updated session after login
      const session = await authClient.getSession();
      
      // Call success callback if provided (only with non-null session)
      if (session && fetchOptions?.onSuccess) {
        fetchOptions.onSuccess(session as Session);
      }
      
      return { success: true, session };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      fetchOptions?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  }
};

export const signUp = {
  email: async ({ email, password, name, fetchOptions }: { 
    email: string; 
    password: string; 
    name?: string; 
    fetchOptions?: { 
      onResponse?: () => void; 
      onError?: (context: ErrorContext) => void; 
      onSuccess?: (session: Session) => void; 
    } 
  }) => {
    try {
      // Signal response received if callback provided
      fetchOptions?.onResponse?.();
      
      const result = await authClient.signUp(email, password, name);
      
      if (result.error) {
        // Handle signup error
        fetchOptions?.onError?.({ error: { message: result.error.message } });
        return { error: result.error.message };
      }
      
      // Get updated session after signup
      const session = await authClient.getSession();
      
      // Call success callback if provided (only with non-null session)
      if (session && fetchOptions?.onSuccess) {
        fetchOptions.onSuccess(session as Session);
      }
      
      return { success: true, session };
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      console.error('Signup error:', errorMessage);
      fetchOptions?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  }
};

export const signOut = async () => {
  try {
    const result = await authClient.signOut();
    return { success: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
    console.error('Sign out error:', errorMessage);
    return { error: errorMessage };
  }
};

export const useSession = () => {
  // This is a simplified mock of the useSession hook
  // In a real implementation, you would use React Query or SWR to fetch and cache the session
  return {
    data: null,
    status: 'loading',
    update: async () => {
      return await authClient.getSession();
    }
  };
};