import express from "express";
import multer from "multer";
import {
  uploadMatchPdf,
  getUploadStatus,
} from "../controllers/pdfController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
router.post("/upload", protect, isAdmin, upload.single("pdf"), uploadMatchPdf);
router.get("/status/:uploadId", protect, isAdmin, getUploadStatus);

export default router;
