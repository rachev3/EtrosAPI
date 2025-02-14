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
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         title:
 *           type: string
 *           example: "New Basketball Season Preview"
 *         content:
 *           type: string
 *           example: "This article discusses the upcoming basketball season."
 *         author:
 *           type: string
 *           example: "Admin"
 *         metaTitle:
 *           type: string
 *           example: "Basketball Season 2024"
 *         metaDescription:
 *           type: string
 *           example: "An in-depth preview of the upcoming basketball season."
 *         metaKeywords:
 *           type: array
 *           items:
 *             type: string
 *           example: ["basketball", "season", "preview"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

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
 *                 $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 */
router.get("/", getArticles);

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
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getArticle);

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
 *                 example: "New Basketball Season"
 *               content:
 *                 type: string
 *                 example: "This article discusses the latest basketball updates."
 *               author:
 *                 type: string
 *                 example: "Admin"
 *               metaTitle:
 *                 type: string
 *                 example: "Basketball News 2024"
 *               metaDescription:
 *                 type: string
 *                 example: "All the latest updates about the basketball season."
 *               metaKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["basketball", "sports", "season"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/image1.jpg"]
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Bad request (duplicate title or missing fields)
 *       500:
 *         description: Server error
 */
router.post("/", protect, isAdmin, createArticle);

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
 *                 example: "Updated Basketball Season"
 *               content:
 *                 type: string
 *                 example: "Updated details about the upcoming basketball season."
 *               author:
 *                 type: string
 *                 example: "Admin"
 *               metaTitle:
 *                 type: string
 *                 example: "Updated Basketball News 2024"
 *               metaDescription:
 *                 type: string
 *                 example: "Updated insights into the basketball season."
 *               metaKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["updated", "basketball", "news"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/updated_image.jpg"]
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, isAdmin, updateArticle);

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
router.delete("/:id", protect, isAdmin, deleteArticle);

export default router;
