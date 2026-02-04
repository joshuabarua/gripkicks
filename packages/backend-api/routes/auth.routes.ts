import { Hono } from 'hono';
import { protect } from '../middleware/auth.middlewares';
import { changeEmail, changePassword, deleteAccount } from '../controllers/authController';

const Auth = new Hono();

// Change email
Auth.post('/change-email', protect, changeEmail);

// Change password
Auth.post('/change-password', protect, changePassword);

// Delete account
Auth.delete('/delete-account', protect, deleteAccount);

export default Auth;
