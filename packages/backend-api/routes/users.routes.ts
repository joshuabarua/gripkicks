import { Hono } from "hono";
import {
  getUsers,
  getUserById,
  getProfile,
  editProfile,
  completeOnboarding,
  getShoes,
} from "../controllers/userController";
import { isAdmin, protect } from "../middleware/auth.middlewares";

const Users = new Hono();

// Get All Users
Users.get("/", isAdmin, getUsers);

// Get User Profile
Users.get("/profile", protect, getProfile);

// Edit User Profile
Users.put("/profile", protect, editProfile);

// Complete Onboarding
Users.post("/onboarding", protect, completeOnboarding);

// Get All Shoes (for onboarding selection)
Users.get("/shoes", getShoes);

// Get Single User
Users.get("/:id", isAdmin, getUserById);

export default Users;
