import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadPhoto, deletePhoto } from "../controllers/imageController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadPhoto);

router.delete("/delete", deletePhoto);

export default router;
