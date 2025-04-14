import express, { Router } from "express";
import {
  getAllPlayerStats,
  getStatsByPlayer,
  getStatsByMatch,
  addPlayerStats,
  updatePlayerStats,
  deletePlayerStats,
} from "../controllers/playerStatsController";
import { protect, isAdmin } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.get("/", getAllPlayerStats);

router.get("/player/:playerId", getStatsByPlayer);

router.get("/match/:matchId", getStatsByMatch);

router.post("/", protect, isAdmin, addPlayerStats);

router.put("/:id", protect, isAdmin, updatePlayerStats);

router.delete("/:id", protect, isAdmin, deletePlayerStats);

export default router;
