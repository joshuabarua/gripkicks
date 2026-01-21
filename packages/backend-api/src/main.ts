import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { showRoutes } from 'hono/dev';
import { serve } from '@hono/node-server';
import { errorHandler, notFound } from '../middleware';
import { auth } from '../config/auth.config';
import Users from '../routes/users.routes';
import createApp from '../lib/create-app';
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

// Better Auth handler - handles all auth routes at /api/auth/*
app.on(['GET', 'POST'], '/api/auth/*', async (c: Context) => {
  return auth.handler(c.req.raw);
});

// Register API routes with base path
app.route(API_BASE, Users);

// Error handling
app.onError(errorHandler);
app.notFound(notFound);

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 3001;
  const hostname = process.env.HOST || '0.0.0.0';

  // Show all routes
  console.log('Registered routes:');
  console.log(showRoutes(app));

  // Start Node.js server using @hono/node-server
  serve({
    fetch: app.fetch,
    port,
    hostname,
  }, (info) => {
    console.log(`Server started on http://${info.address}:${info.port}`);
    console.log(`API base URL: ${API_BASE}`);
  });
}

// Export app type for Hono RPC client
export type AppType = typeof app;

export default app;
