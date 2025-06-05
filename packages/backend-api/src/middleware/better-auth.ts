import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  isAdmin?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export default function createBetterAuthMiddleware(authInstance: any) { 
  return async function betterAuthMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const authHeader = req.headers.authorization;

    try {
      const session = await authInstance.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session || !session.user) {
        res.status(401).json({ message: 'Unauthorized: No active session or user not found in session' });
        return;
      }

      req.user = session.user as AuthenticatedUser;
      next();
    } catch (error) {
      console.error('Session verification error:', error);
      res.status(401).json({ message: 'Unauthorized: Session verification failed or an error occurred' });
    }
  };
}
