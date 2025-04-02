import express from "express";
import {
  getComments,
  getArticleComments,
  getUserComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d21b4667d0d8992e610c85
 *         content:
 *           type: string
 *           example: "Great article! Very informative."
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 60d21b4667d0d8992e610c80
 *             username:
 *               type: string
 *               example: john_doe
 *         article:
 *           type: string
 *           example: 60d21b4667d0d8992e610c82
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isVisible:
 *           type: boolean
 *           example: true
 */

// Routes accessible by all users
/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Fields to populate (e.g., author,article)
 *     responses:
 *       200:
 *         description: List of all comments
 *       500:
 *         description: Server error
 */
router.get("/", getComments);

/**
 * @swagger
 * /api/comments/article/{articleId}:
 *   get:
 *     summary: Get comments for a specific article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the article
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Fields to populate (e.g., author)
 *     responses:
 *       200:
 *         description: List of comments for the article
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.get("/article/:articleId", getArticleComments);

/**
 * @swagger
 * /api/comments/user/{userId}:
 *   get:
 *     summary: Get comments by a specific user
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Fields to populate (e.g., article)
 *     responses:
 *       200:
 *         description: List of comments by the user
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", getUserComments);

// Routes requiring authentication
/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - articleId
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great article! Very informative."
 *               articleId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c82
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.post("/", protect, createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content."
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the author of the comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the author of the comment or not an admin
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, deleteComment);

export default router;
