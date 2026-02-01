import express from "express";
import { getUserForSidebar, searchUsers, getCurrentUser } from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Get all users for sidebar (except current user)
router.get("/sidebar", protectRoute, getUserForSidebar);

// Search users by username
router.get("/search", protectRoute, searchUsers);

// Get current logged-in user info
router.get("/current", protectRoute, getCurrentUser);

export default router;
