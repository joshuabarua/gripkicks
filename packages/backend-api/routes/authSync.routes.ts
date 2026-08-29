import { Hono } from 'hono';
import { syncUserToConvex } from '../controllers/authSyncController';
import { protect } from '../middleware/auth.middlewares';

const app = new Hono();

// Sync user to Convex after authentication
app.post('/sync-user', protect, syncUserToConvex);

export default app;
