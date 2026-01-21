import { Hono } from 'hono'
import { getUsers, getUserById, getProfile, editProfile, completeOnboarding, getShoes, getUserStash, addToStash, removeFromStash } from '../controllers/userController'
import { isAdmin, protect } from '../middleware/auth.middlewares'

const Users = new Hono()

// Get All Users
Users.get('/', isAdmin, getUsers)

// Get User Profile
Users.get('/profile', protect, getProfile)

// Edit User Profile
Users.put('/profile', protect, editProfile)

// Complete Onboarding
Users.post('/onboarding', protect, completeOnboarding)

// Get All Shoes (for onboarding selection)
Users.get('/shoes', getShoes)

// User Stash (shoe collection)
Users.get('/stash', protect, getUserStash)
Users.post('/stash', protect, addToStash)
Users.delete('/stash/:shoeId', protect, removeFromStash)

// Get Single User
Users.get('/:id', protect, getUserById)

export default Users