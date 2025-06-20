import { Hono } from 'hono'
//
import { getUsers, getUserById, getProfile, editProfile } from '../controllers/userController'
import { isAdmin, protect } from '../middleware/auth.middlewares'

const Users = new Hono()

// Get All Users
Users.get('/', isAdmin, getUsers)

// Get User Profile
Users.get('/profile', protect, getProfile)

// // Edit User Profile
Users.put('/profile', protect, editProfile)

// // Get Single User
Users.get('/:id', protect, getUserById)

export default Users