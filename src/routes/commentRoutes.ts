import express, { Router } from "express";
import {
  getComments,
  getArticleComments,
  getUserComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

router.get("/", getComments);

router.get("/article/:articleId", getArticleComments);

router.get("/user/:userId", getUserComments);

router.post("/", protect, createComment);

router.put("/:id", protect, updateComment);

router.delete("/:id", protect, deleteComment);

export default router;
