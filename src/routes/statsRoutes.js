import express from "express";
import {
  getTeamStats,
  getPlayerStats,
} from "../controllers/statsController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamStats:
 *       type: object
 *       properties:
 *         season:
 *           type: string
 *           example: "2023-2024"
 *         totalMatches:
 *           type: integer
 *           example: 15
 *         totalWins:
 *           type: integer
 *           example: 10
 *         totalLosses:
 *           type: integer
 *           example: 5
 *         winPercentage:
 *           type: string
 *           example: "66.7%"
 *         topScorer:
 *           type: object
 *           properties:
 *             playerId:
 *               type: string
 *               example: "60d0fe4f5311236168a109ca"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             pointsPerGame:
 *               type: number
 *               example: 20.5
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PlayerStats:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d0fe4f5311236168a109ca"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         totalPoints:
 *           type: integer
 *           example: 320
 *         totalRebounds:
 *           type: integer
 *           example: 120
 *         totalAssists:
 *           type: integer
 *           example: 80
 *         gamesPlayed:
 *           type: integer
 *           example: 16
 *         pointsPerGame:
 *           type: number
 *           example: 20.0
 *         reboundsPerGame:
 *           type: number
 *           example: 7.5
 *         assistsPerGame:
 *           type: number
 *           example: 5.0
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/stats/team:
 *   get:
 *     summary: Get team statistics for the current season
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Team statistics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamStats'
 *       500:
 *         description: Server error
 */
router.get("/team", getTeamStats);

/**
 * @swagger
 * /api/stats/players:
 *   get:
 *     summary: Get player statistics for the current season
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Player statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerStats'
 *       500:
 *         description: Server error
 */
router.get("/players", getPlayerStats);

export default router;
