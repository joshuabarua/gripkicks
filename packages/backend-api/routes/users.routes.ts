import { Hono } from "hono";
import {
  getUsers,
  getUserById,
  getProfile,
  editProfile,
  completeOnboarding,
  getShoes,
  getUsersCount,
} from "../controllers/userController";
import {
  getUserStash,
  addToStash,
  removeFromStash,
  updateUserShoeStats,
  toggleFavourite,
} from "../controllers/stashController";
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

// Public user count (for marketing/founder meter)
Users.get("/count", getUsersCount);
Users.get("/users/count", getUsersCount);

// User Stash (shoe collection)
Users.get("/stash", protect, getUserStash);
Users.post("/stash", protect, addToStash);
Users.put("/stash/:userShoeId", protect, updateUserShoeStats);
Users.post("/stash/:userShoeId/favourite", protect, toggleFavourite);
Users.delete("/stash/:shoeId", protect, removeFromStash);

// Get Single User
Users.get("/:id", isAdmin, getUserById);

export default Users;
