import express, { Router } from "express";
import upload from "../middleware/uploadMiddleware";
import { uploadPhoto, deletePhoto } from "../controllers/imageController";
import { protect, isAdmin } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.post("/upload", protect, isAdmin, upload.single("image"), uploadPhoto);

router.delete("/delete", protect, isAdmin, deletePhoto);

export default router;
