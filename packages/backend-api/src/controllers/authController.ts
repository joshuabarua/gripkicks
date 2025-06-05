import { Request, Response } from 'express';
import { getAuthInstance } from '../services/authService';
import { AuthenticatedRequest } from '@/middleware/better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { APIError } from 'better-auth/api'; 

// --- Request Body Interfaces ---
interface LoginRequestBody {
  email?: string;
  password?: string;
}

// interface GoogleLoginRequestBody {
//   idToken?: string; 
//   accessToken?: string;
// }

// --- Controller Functions ---

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    const response = await getAuthInstance().api.signInEmail({
      body: { email, password },
      headers: fromNodeHeaders(req.headers), 
    });

    res.json({ message: 'Login successful', user: response });

  } catch (error) {
    if (error instanceof APIError) {
      res.status(Number(error.status) || 401).json({ message: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An unexpected error occurred during login.' });
    }
  }
};

/**
Handles user login/signup with Google.
// export const googleLogin = async (req: Request, res: Response): Promise<void> => {
//   res.status(501).json({ message: 'Google login to be handled by better-auth endpoint /api/auth/signin/google' });
// };
**/

/**
 * Retrieves the current user's session information.
 * This endpoint should be protected by `betterAuthMiddleware`.
 * If the middleware is applied to the route, `req.user` will be populated.
 */
export const session = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user) {
    res.status(200).json({ message: 'Session valid', user: req.user });
  } else {
    res.status(401).json({ message: 'No active session or invalid token.' });
  }
};
