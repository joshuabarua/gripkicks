// Frontend auth client for communicating with our backend API
import { User } from '../../types/user';

// Use relative URLs for API routes to avoid CORS issues and work with the Next.js proxy
// For direct backend calls in development, use this URL
const API_BASE_URL = '';

// Enable debug mode for network errors
const DEBUG = process.env.NODE_ENV === 'development';

// Auth error interface
export interface AuthError {
  status: number;
  message: string;
}

// Session interface
export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  expires?: string;
}

// Auth client for interacting with our backend Better Auth API
export const authClient = {
  // Get the current user session
  getSession: async (): Promise<Session | null> => {
    try {
      if (DEBUG) console.log('Fetching session from:', `${API_BASE_URL}/api/auth/session`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          return { user: null, isAuthenticated: false };
        }
        throw new Error(`Session fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        user: data.user,
        isAuthenticated: !!data.user,
        expires: data.expires,
      };
    } catch (error) {
      console.error('Session fetch error:', error);
      return { user: null, isAuthenticated: false };
    }
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<{ user: User; error?: AuthError }> => {
    try {
      if (DEBUG) console.log('Attempting login at:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          user: null as unknown as User,
          error: { 
            status: response.status, 
            message: data.message || 'Login failed' 
          } 
        };
      }

      return { user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        user: null as unknown as User, 
        error: { 
          status: 500, 
          message: 'An unexpected error occurred' 
        } 
      };
    }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, name?: string): Promise<{ user: User; error?: AuthError }> => {
    try {
      if (DEBUG) console.log('Attempting signup at:', `${API_BASE_URL}/api/auth/signup`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          user: null as unknown as User, 
          error: { 
            status: response.status, 
            message: data.message || 'Sign up failed' 
          } 
        };
      }

      return { user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        user: null as unknown as User, 
        error: { 
          status: 500, 
          message: 'An unexpected error occurred' 
        } 
      };
    }
  },

  // Sign out the current user
  signOut: async (): Promise<boolean> => {
    try {
      if (DEBUG) console.log('Attempting sign out at:', `${API_BASE_URL}/api/auth/signout`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Sign out failed with status:', response.status, errorData);
      }

      return response.ok;
    } catch (error) {
      console.error('Sign out network error:', error);
      return false;
    }
  },
};