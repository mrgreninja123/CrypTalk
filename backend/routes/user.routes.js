import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUserForSidebar, searchUsers, getCurrentUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserForSidebar);
router.get("/search", protectRoute, searchUsers);
router.get("/profile", protectRoute, getCurrentUser);

export default router;