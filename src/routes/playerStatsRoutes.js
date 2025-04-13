import express from "express";
import {
  getAllPlayerStats,
  getStatsByPlayer,
  getStatsByMatch,
  addPlayerStats,
  updatePlayerStats,
  deletePlayerStats,
} from "../controllers/playerStatsController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPlayerStats);

router.get("/player/:playerId", getStatsByPlayer);

router.get("/match/:matchId", getStatsByMatch);

router.post("/", protect, isAdmin, addPlayerStats);

router.put("/:id", protect, isAdmin, updatePlayerStats);

router.delete("/:id", protect, isAdmin, deletePlayerStats);

export default router;
