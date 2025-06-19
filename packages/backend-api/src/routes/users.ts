import { Hono } from 'hono';
import { getAllUsers } from '@/controllers/userController';

const users = new Hono();

users.get('/', getAllUsers);

export default users;
