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

router.get("/", getArticles); // Get all articles
router.get("/:id", getArticle); // Get single article
router.post("/", protect, isAdmin, createArticle); // Add article (Admin only)
router.put("/:id", protect, isAdmin, updateArticle); // Update article (Admin only)
router.delete("/:id", protect, isAdmin, deleteArticle); // Delete article (Admin only)

export default router;
