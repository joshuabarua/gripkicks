import { Hono } from 'hono';
import { login, session } from '@/controllers/authController'; 
import createBetterAuthMiddleware from '@/middleware/better-auth'; 
import { getAuthInstance } from '@/services/authService';

const auth = new Hono();

auth.post('/login', login);

auth.get('/session', async (c, next) => {
  const middleware = createBetterAuthMiddleware(getAuthInstance());
  return middleware(c, next);
}, session); 

export default auth;
