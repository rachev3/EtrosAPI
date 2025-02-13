import express from "express";
import {
  getTeamStats,
  getPlayerStats,
} from "../controllers/statsController.js";

const router = express.Router();

/**
 * @swagger
 * /api/stats/team:
 *   get:
 *     summary: Get team statistics
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Team statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wins:
 *                   type: integer
 *                   example: 10
 *                 losses:
 *                   type: integer
 *                   example: 5
 *                 draws:
 *                   type: integer
 *                   example: 3
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
router.get("/team", getTeamStats); // Get team statistics

/**
 * @swagger
 * /api/stats/players:
 *   get:
 *     summary: Get player statistics
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Player statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 60d0fe4f5311236168a109ca
 *                   name:
 *                     type: string
 *                     example: Player Name
 *                   goals:
 *                     type: integer
 *                     example: 15
 *                   assists:
 *                     type: integer
 *                     example: 7
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
router.get("/players", getPlayerStats); // Get player statistics

export default router;
