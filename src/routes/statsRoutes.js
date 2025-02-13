import express from "express";
import {
  getTeamStats,
  getPlayerStats,
} from "../controllers/statsController.js";

const router = express.Router();

router.get("/team", getTeamStats); // Get team statistics
router.get("/players", getPlayerStats); // Get player statistics

export default router;
