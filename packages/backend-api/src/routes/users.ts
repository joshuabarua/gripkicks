import express, { Router } from 'express';
import { getAllUsers } from '@/controllers/userController'; 
import createBetterAuthMiddleware from '@/middleware/better-auth'; 
import { getAuthInstance } from '@/services/authService';

const router: Router = express.Router();

router.use(createBetterAuthMiddleware(getAuthInstance()));

router.get('/', getAllUsers); 

export default router;
