import express from "express";
import {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPlayers); // Get all players
router.get("/:id", getPlayer); // Get single player
router.post("/", protect, isAdmin, createPlayer); // Add player (Admin only)
router.put("/:id", protect, isAdmin, updatePlayer); // Update player (Admin only)
router.delete("/:id", protect, isAdmin, deletePlayer); // Delete player (Admin only)

export default router;
