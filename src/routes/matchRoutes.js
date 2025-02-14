import express from "express";
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  deleteMatch,
} from "../controllers/matchController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Match:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         opponent:
 *           type: string
 *           example: "Team X"
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2025-02-14T00:00:00.000Z
 *         location:
 *           type: string
 *           example: "Home"
 *         result:
 *           type: string
 *           enum: [Win, Loss, Pending]
 *           example: "Win"
 *         ourScore:
 *           type: number
 *           example: 90
 *         opponentScore:
 *           type: number
 *           example: 85
 *         teamStats:
 *           type: object
 *           properties:
 *             fieldGoalsMade:
 *               type: number
 *               example: 35
 *             fieldGoalsAttempted:
 *               type: number
 *               example: 70
 *             threePointsMade:
 *               type: number
 *               example: 10
 *             threePointsAttempted:
 *               type: number
 *               example: 25
 *             freeThrowsMade:
 *               type: number
 *               example: 10
 *             freeThrowsAttempted:
 *               type: number
 *               example: 12
 *             offensiveRebounds:
 *               type: number
 *               example: 10
 *             defensiveRebounds:
 *               type: number
 *               example: 25
 *             totalAssists:
 *               type: number
 *               example: 22
 *             totalSteals:
 *               type: number
 *               example: 6
 *             totalBlocks:
 *               type: number
 *               example: 5
 *             totalTurnovers:
 *               type: number
 *               example: 11
 *             totalFouls:
 *               type: number
 *               example: 14
 *             totalPoints:
 *               type: number
 *               example: 90
 *         playerStats:
 *           type: array
 *           items:
 *             type: string
 *           example: ["65ffb6a88cd740bb1c6e3f25", "65ffb6a88cd740bb1c6e3f26"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of all matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *       500:
 *         description: Server error
 */
router.get("/", getMatches);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a single match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match ID
 *     responses:
 *       200:
 *         description: Match data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getMatch);

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opponent
 *               - date
 *               - location
 *             properties:
 *               opponent:
 *                 type: string
 *                 example: "Team X"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-14T00:00:00.000Z"
 *               location:
 *                 type: string
 *                 example: "Home"
 *               ourScore:
 *                 type: number
 *                 example: 90
 *               opponentScore:
 *                 type: number
 *                 example: 85
 *               teamStats:
 *                 $ref: '#/components/schemas/Match/properties/teamStats'
 *               playerStats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["65ffb6a88cd740bb1c6e3f25"]
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", protect, isAdmin, createMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Update a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       200:
 *         description: Match updated successfully
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, isAdmin, updateMatch);

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The match ID
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, isAdmin, deleteMatch);

export default router;
