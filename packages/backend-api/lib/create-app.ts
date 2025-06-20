import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';

const createApp = () => {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use('*', compress());
  app.use(
    '*',
    cors({
      origin: 'http://localhost:3000',
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    })
  );

  return app;
};

export default createApp;
