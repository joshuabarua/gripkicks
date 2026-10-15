import { Context } from 'hono';
import { UnauthenticatedError } from '../../src/lib/errors';

function checkUserAuthentication(c: Context) {
  const user = c.get('user');
  if (!user) {
    const error = new UnauthenticatedError('Authentication required');
    c.status(401);
    return c.json({ error: error.message });
  }
  return null;
}

export function getAuthenticatedUser(c: Context) {
  const authError = checkUserAuthentication(c);
  if (authError) return { error: authError };
  const user = c.get('user');
  return { user };
}
