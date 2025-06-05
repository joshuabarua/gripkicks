import 'dotenv/config'; 
import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { toNodeHandler } from 'better-auth/node';
import { initializeAuth } from '@/lib/auth'; 
import createBetterAuthMiddleware from '@/middleware/better-auth'; 
import prisma from './db'; 
import { setAuthInstance } from './services/authService'; 

import authRoutes from '@/routes/auth';
import shoeRoutes from '@/routes/shoes';
import userRoutes from '@/routes/users';

async function startServer() {
  try {
    console.log('Attempting to connect Prisma client...');
    await prisma.$connect(); 
    console.log('✅ Prisma client connected successfully.');

    const auth = initializeAuth(prisma);
    console.log('Better Auth adapter:', auth);
    setAuthInstance(auth);
    const betterAuthMiddleware = createBetterAuthMiddleware(auth);

    const app: Express = express();
    const PORT: string | number = process.env.PORT || 3001;

    app.use(cors()); 

    app.all('/api/auth/*', toNodeHandler(auth));

    app.use(bodyParser.json());

    app.use('/api', authRoutes);
    app.use(betterAuthMiddleware); 
    app.use('/api/shoes', shoeRoutes);
    app.use('/api/users', userRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize and start server:', error);
    await prisma.$disconnect(); 
    process.exit(1); 
  }
}

startServer();

