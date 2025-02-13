import express from "express";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of all articles
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
 *                   title:
 *                     type: string
 *                     example: Article Title
 *                   content:
 *                     type: string
 *                     example: This is the content of the article.
 *                   author:
 *                     type: string
 *                     example: Admin
 *       500:
 *         description: Server error
 */
router.get("/", getArticles); // Get all articles

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get a single article
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The article ID
 *     responses:
 *       200:
 *         description: Article data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *                 title:
 *                   type: string
 *                   example: Article Title
 *                 content:
 *                   type: string
 *                   example: This is the content of the article.
 *                 author:
 *                   type: string
 *                   example: Admin
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getArticle); // Get single article

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Article
 *               content:
 *                 type: string
 *                 example: This is the content of the new article.
 *               author:
 *                 type: string
 *                 example: Admin
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Article with this title already exists
 *       500:
 *         description: Server error
 */
router.post("/", protect, isAdmin, createArticle); // Add article (Admin only)

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Article Title
 *               content:
 *                 type: string
 *                 example: Updated content of the article.
 *               author:
 *                 type: string
 *                 example: Admin
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, isAdmin, updateArticle); // Update article (Admin only)

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The article ID
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, isAdmin, deleteArticle); // Delete article (Admin only)

export default router;
