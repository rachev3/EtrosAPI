import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPhoto, deletePhoto } from "../controllers/imageController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", protect, isAdmin, upload.single("image"), uploadPhoto);

router.delete("/delete", protect, isAdmin, deletePhoto);

export default router;
