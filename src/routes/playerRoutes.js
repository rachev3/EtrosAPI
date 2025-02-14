import express from "express";
import {
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         name:
 *           type: string
 *           example: "John Doe"
 *         bornYear:
 *           type: number
 *           example: 1995
 *         position:
 *           type: array
 *           items:
 *             type: string
 *           example: ["PointGuard", "ShootingGuard"]
 *         height:
 *           type: string
 *           example: "6'3"
 *         weight:
 *           type: number
 *           example: 190
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         statsHistory:
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
 * /api/players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: List of all players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 *       500:
 *         description: Server error
 */
router.get("/", getPlayers);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get a single player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Player data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getPlayer);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - bornYear
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               bornYear:
 *                 type: number
 *                 example: 1995
 *               position:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["PointGuard", "ShootingGuard"]
 *               height:
 *                 type: string
 *                 example: "6'3"
 *               weight:
 *                 type: number
 *                 example: 190
 *               imageUrl:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Player created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Bad request (missing required fields or duplicate name)
 *       500:
 *         description: Server error
 */
router.post("/", protect, isAdmin, createPlayer);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Player updated successfully
 *       404:
 *         description: Player not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, isAdmin, updatePlayer);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Delete a player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The player ID
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *       404:
 *         description: Player not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, isAdmin, deletePlayer);

export default router;
