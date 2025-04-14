import express, { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/user", protect, getUserProfile);

export default router;
