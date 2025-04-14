import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/user", protect, getUserProfile);

export default router;
