import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // User Registration
router.post("/login", loginUser); // User Login
router.get("/user", protect, getUserProfile); // Get user profile (Protected)

export default router;
