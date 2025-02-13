import express from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
} from "../controllers/matchController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getMatches); // Get all matches
router.get("/:id", getMatch); // Get single match
router.post("/", protect, isAdmin, createMatch); // Add match (Admin only)
router.put("/:id", protect, isAdmin, updateMatch); // Update match (Admin only)
router.delete("/:id", protect, isAdmin, deleteMatch); // Delete match (Admin only)

export default router;
