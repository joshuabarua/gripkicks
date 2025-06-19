import { env, getRuntimeKey } from 'hono/adapter'
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress'
import { getRouterName, showRoutes } from 'hono/dev'
import { auth } from './config/auth.config';
import { errorHandler, notFound } from './middleware';
import Users from './routes/users';

const port = process.env?.PORT || 8000
const API_BASE = process.env.API_BASE || '/api/v1'

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>({ strict: false });

app.use(logger());
app.use(compress({ encoding: 'gzip' }))
app.use('*', cors());

app.use('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  maxAge: 86400,
}), async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);
  await next();
});

// Health check
app.get(API_BASE + '/health', (c) => {

  if (getRuntimeKey() === 'workerd') {
    return c.text('You are on Cloudflare')
  } else if (getRuntimeKey() === 'bun') {
    return c.text('You are on Bun')
  }

  return c.json({ status: 'ok', uptime: process.uptime(), message: `You are on ${getRuntimeKey()}, Hi! Welcome!` })
})


// Auth handler (all Better Auth endpoints)
app.all('/api/auth/*', async (c) => auth.handler(c.req.raw));

// Users Route
app.route(API_BASE + '/users', Users)

// Error Handler (improved to use err)
app.onError(errorHandler)

// Not Found Handler (standardized response)
app.notFound(notFound)

//signup
app.post('/api/auth/signup/', async (c) => {
  const body = await c.req.json();
  const result = await auth.api.signUpEmail({ body });
  return c.json(result);
});

//login
app.post('/api/auth/login/', async (c) => {
  const body = await c.req.json();
  const result = await auth.api.signInEmail({ body });
  return c.json(result);
});

// Example: Session info endpoint
app.get(API_BASE + '/session', (c) => {
  const user = c.get('user');
  const session = c.get('session');
  if (!user) return c.body(null, 401);
  return c.json({ user, session });
});


// Start server on port 3001
serve({ fetch: app.fetch, port: Number(port), hostname: '0.0.0.0' });

// Show Routes
console.log(`🚀 API server running at http://localhost:${port}${API_BASE}`);
// console.log(getRouterName(app))
showRoutes(app)
