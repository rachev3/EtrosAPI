import express, { Router } from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
} from "../controllers/matchController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.get("/", getMatches);

router.get("/:id", getMatch);

router.post("/", protect, isAdmin, createMatch);

router.put("/:id", protect, isAdmin, updateMatch);

router.delete("/:id", protect, isAdmin, deleteMatch);

export default router;
