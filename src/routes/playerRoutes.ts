import express, { Router } from "express";
import {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.get("/", getPlayers);

router.get("/:id", getPlayer);

router.post("/", protect, isAdmin, createPlayer);

router.put("/:id", protect, isAdmin, updatePlayer);

router.delete("/:id", protect, isAdmin, deletePlayer);

export default router;
