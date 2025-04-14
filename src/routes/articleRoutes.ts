import express, { Router } from "express";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.get("/", getArticles);

router.get("/:id", getArticle);

router.post("/", protect, isAdmin, createArticle);

router.put("/:id", protect, isAdmin, updateArticle);

router.delete("/:id", protect, isAdmin, deleteArticle);

export default router;
