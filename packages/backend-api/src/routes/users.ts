import express, { Router } from 'express';
import { getAllUsers } from '@/controllers/userController'; 
import createBetterAuthMiddleware from '@/middleware/better-auth'; 
import { getAuthInstance } from '@/services/authService';

const router: Router = express.Router();

router.use((req, res, next) => {
  const middleware = createBetterAuthMiddleware(getAuthInstance());
  middleware(req, res, next);
});

router.get('/', getAllUsers); 

export default router;
