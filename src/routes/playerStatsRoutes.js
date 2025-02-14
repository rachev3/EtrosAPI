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

/**
 * @swagger
 * components:
 *   schemas:
 *     PlayerStats:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         match:
 *           type: string
 *           example: "60d0fe4f5311236168a109cb"
 *         player:
 *           type: string
 *           example: "60d0fe4f5311236168a109cc"
 *         fieldGoalsMade:
 *           type: number
 *           example: 5
 *         fieldGoalsAttempted:
 *           type: number
 *           example: 10
 *         twoPointsMade:
 *           type: number
 *           example: 4
 *         twoPointsAttempted:
 *           type: number
 *           example: 6
 *         threePointsMade:
 *           type: number
 *           example: 1
 *         threePointsAttempted:
 *           type: number
 *           example: 4
 *         freeThrowsMade:
 *           type: number
 *           example: 3
 *         freeThrowsAttempted:
 *           type: number
 *           example: 4
 *         offensiveRebounds:
 *           type: number
 *           example: 2
 *         defensiveRebounds:
 *           type: number
 *           example: 5
 *         totalAssists:
 *           type: number
 *           example: 7
 *         totalSteals:
 *           type: number
 *           example: 3
 *         totalBlocks:
 *           type: number
 *           example: 1
 *         totalTurnovers:
 *           type: number
 *           example: 2
 *         totalFouls:
 *           type: number
 *           example: 4
 *         plusMinus:
 *           type: number
 *           example: 8
 *         efficiency:
 *           type: number
 *           example: 20
 *         totalPoints:
 *           type: number
 *           example: 15
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/player-stats:
 *   get:
 *     summary: Get all player stats
 *     tags: [PlayerStats]
 *     responses:
 *       200:
 *         description: List of all player stats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerStats'
 *       500:
 *         description: Server error
 */
router.get("/", getAllPlayerStats);

/**
 * @swagger
 * /api/player-stats/player/{playerId}:
 *   get:
 *     summary: Get stats by player
 *     tags: [PlayerStats]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Player stats data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerStats'
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
router.get("/player/:playerId", getStatsByPlayer);

/**
 * @swagger
 * /api/player-stats/match/{matchId}:
 *   get:
 *     summary: Get stats by match
 *     tags: [PlayerStats]
 *     parameters:
 *       - in: path
 *         name: matchId
 *         schema:
 *           type: string
 *         required: true
 *         description: The match ID
 *     responses:
 *       200:
 *         description: Match stats data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerStats'
 *       404:
 *         description: Match stats not found
 *       500:
 *         description: Server error
 */
router.get("/match/:matchId", getStatsByMatch);

/**
 * @swagger
 * /api/player-stats:
 *   post:
 *     summary: Add player stats
 *     tags: [PlayerStats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerStats'
 *     responses:
 *       201:
 *         description: Player stats added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlayerStats'
 *       400:
 *         description: Bad request (missing required fields)
 *       500:
 *         description: Server error
 */
router.post("/", protect, isAdmin, addPlayerStats);

/**
 * @swagger
 * /api/player-stats/{id}:
 *   put:
 *     summary: Update player stats
 *     tags: [PlayerStats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The player stats ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlayerStats'
 *     responses:
 *       200:
 *         description: Player stats updated successfully
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, isAdmin, updatePlayerStats);

/**
 * @swagger
 * /api/player-stats/{id}:
 *   delete:
 *     summary: Delete player stats
 *     tags: [PlayerStats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The player stats ID
 *     responses:
 *       200:
 *         description: Player stats deleted successfully
 *       404:
 *         description: Player stats not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, isAdmin, deletePlayerStats);

export default router;
