import { showRoutes } from 'hono/dev';
import { errorHandler, notFound } from '../middleware';
import { auth } from '../config/auth.config';
import Users from '../routes/users.routes';
import createApp from '../lib/create-app';
import { createServer } from 'http';
import { Context } from 'hono';

// Initialize app with middleware
const app = createApp();

// Set API base path
const API_BASE = process.env.API_BASE || '/api/v1';

// Health check endpoint
app.get('/health', (c: Context) => {
  return c.json({ 
    status: 'ok', 
    uptime: Math.floor(process.uptime() * 1000), // Convert to milliseconds
    message: 'Welcome to the API!'
  });
});

// Auth endpoints
app.post('/auth/signup', async (c: Context) => {
  const body = await c.req.json();
  console.log('Signup request:', body);
  const result = await auth.api.signUpEmail({ body });
  return c.json(result);
});

// Better Auth handler for all /auth/* routes
export const authHandler = async (c: Context) => {
  return auth.handler(c.req.raw);
};

// Register API routes with base path
app.route(API_BASE, Users);

// Register auth handler for all /api/v1/auth/* routes
app.on(['POST', 'GET'], `${API_BASE}/auth/*`, authHandler);

// Error handling
app.onError(errorHandler);
app.notFound(notFound);

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const hostname = process.env.HOST || '0.0.0.0';

  // Show all routes
  console.log('Registered routes:');
  console.log(showRoutes(app));

  // Start Node.js server
  const server = createServer(app.fetch);
  server.listen(port, hostname, () => {
    console.log(`Server started on http://${hostname}:${port}`);
    console.log(`API base URL: ${API_BASE}`);
  });
}

export default app;
