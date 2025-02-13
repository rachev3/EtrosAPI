import express from "express";
import upload from "../middlewares/upload.js";
import { uploadPhoto } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadPhoto);

export default router;
