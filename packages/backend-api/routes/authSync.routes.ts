import { Hono } from 'hono';
import { syncUserToConvex } from '../controllers/authSyncController';

const app = new Hono();

// Sync user to Convex after authentication
app.post('/sync-user', syncUserToConvex);

export default app;
