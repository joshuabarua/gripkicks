import express, { Router } from 'express';
import { login, session } from '@/controllers/authController'; 
import createBetterAuthMiddleware from '@/middleware/better-auth'; 
import { getAuthInstance } from '@/services/authService';

const router: Router = express.Router();

router.post('/login', login);
router.get('/session', createBetterAuthMiddleware(getAuthInstance()), session); 

export default router;
