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
 *                 type: object
 *                 properties:
 *                   playerId:
 *                     type: string
 *                     example: 60d0fe4f5311236168a109ca
 *                   matchId:
 *                     type: string
 *                     example: 60d0fe4f5311236168a109cb
 *                   points:
 *                     type: integer
 *                     example: 25
 *                   rebounds:
 *                     type: integer
 *                     example: 10
 *                   assists:
 *                     type: integer
 *                     example: 5
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
 *               type: object
 *               properties:
 *                 playerId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *                 matchId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109cb
 *                 points:
 *                   type: integer
 *                   example: 25
 *                 rebounds:
 *                   type: integer
 *                   example: 10
 *                 assists:
 *                   type: integer
 *                   example: 5
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
 *               type: object
 *               properties:
 *                 playerId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *                 matchId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109cb
 *                 points:
 *                   type: integer
 *                   example: 25
 *                 rebounds:
 *                   type: integer
 *                   example: 10
 *                 assists:
 *                   type: integer
 *                   example: 5
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
 *             type: object
 *             required:
 *               - playerId
 *               - matchId
 *               - points
 *               - rebounds
 *               - assists
 *             properties:
 *               playerId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109ca
 *               matchId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109cb
 *               points:
 *                 type: integer
 *                 example: 25
 *               rebounds:
 *                 type: integer
 *                 example: 10
 *               assists:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Player stats added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 playerId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *                 matchId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109cb
 *                 points:
 *                   type: integer
 *                   example: 25
 *                 rebounds:
 *                   type: integer
 *                   example: 10
 *                 assists:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request data
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
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
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *                 example: 30
 *               rebounds:
 *                 type: integer
 *                 example: 12
 *               assists:
 *                 type: integer
 *                 example: 7
 *     responses:
 *       200:
 *         description: Player stats updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 playerId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *                 matchId:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109cb
 *                 points:
 *                   type: integer
 *                   example: 30
 *                 rebounds:
 *                   type: integer
 *                   example: 12
 *                 assists:
 *                   type: integer
 *                   example: 7
 *       404:
 *         description: Player stats not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Player stats not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Player stats deleted successfully
 *       404:
 *         description: Player stats not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Player stats not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.delete("/:id", protect, isAdmin, deletePlayerStats);

export default router;
