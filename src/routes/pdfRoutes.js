import express from "express";
import multer from "multer";
import {
  uploadMatchPdf,
  getUploadStatus,
  previewMatchPdf,
  confirmMatchPdf,
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

/**
 * @swagger
 * /api/pdf/upload:
 *   post:
 *     summary: Upload and process a basketball match statistics PDF
 *     description: Uploads a FIBA box score PDF file, processes it to extract match statistics, and stores the data in the database
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: The PDF file containing match statistics (max 5MB)
 *     responses:
 *       201:
 *         description: PDF successfully processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PDF processed successfully"
 *                 uploadId:
 *                   type: string
 *                   example: "67b25e697b75d5c1cf088264"
 *                 matchId:
 *                   type: string
 *                   example: "67b25e697b75d5c1cf088265"
 *                 playerManagement:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Димитър Рачев (#3)"]
 *                     existing:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Йосиф Омар (#16)"]
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           error:
 *                             type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No PDF file uploaded"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not admin
 *       409:
 *         description: Duplicate match found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "A match with this date and opponent already exists"
 *                 existingUploadId:
 *                   type: string
 *                   example: "67b25e697b75d5c1cf088264"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to process PDF upload"
 *                 details:
 *                   type: string
 */
router.post("/upload", protect, isAdmin, upload.single("pdf"), uploadMatchPdf);

/**
 * @swagger
 * /api/pdf/status/{uploadId}:
 *   get:
 *     summary: Get the status of a PDF upload
 *     description: Retrieves the current status of a PDF upload and processing operation
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the upload to check
 *         example: "67b25e697b75d5c1cf088264"
 *     responses:
 *       200:
 *         description: Upload status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, completed, failed]
 *                   example: "completed"
 *                 errorMessage:
 *                   type: string
 *                   example: null
 *                 matchId:
 *                   type: string
 *                   example: "67b25e697b75d5c1cf088265"
 *                 matchDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-14T10:00:00.000Z"
 *                 opponent:
 *                   type: string
 *                   example: "Зограф Трявна"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not admin
 *       404:
 *         description: Upload not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Upload not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to get upload status"
 */
router.get("/status/:uploadId", protect, isAdmin, getUploadStatus);

/**
 * @swagger
 * /api/pdf/preview:
 *   post:
 *     summary: Preview basketball match statistics from PDF before saving
 *     description: Uploads a FIBA box score PDF file and returns extracted data for review without saving
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: The PDF file containing match statistics (max 5MB)
 *     responses:
 *       200:
 *         description: PDF successfully parsed and preview generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matchDetails:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     venue:
 *                       type: string
 *                     teams:
 *                       type: object
 *                 teamStatistics:
 *                   type: object
 *                 playerStatistics:
 *                   type: array
 *                   items:
 *                     type: object
 *                 potentialIssues:
 *                   type: object
 *                 uploadToken:
 *                   type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Duplicate match found
 *       500:
 *         description: Server error
 */
router.post(
  "/preview",
  protect,
  isAdmin,
  upload.single("pdf"),
  previewMatchPdf
);

/**
 * @swagger
 * /api/pdf/confirm:
 *   post:
 *     summary: Confirm and save previewed match statistics
 *     description: Confirms the previewed data and saves it to the database, with optional adjustments
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uploadToken:
 *                 type: string
 *                 description: Token received from preview endpoint
 *               adjustments:
 *                 type: object
 *                 description: Optional adjustments to the previewed data
 *     responses:
 *       201:
 *         description: Match data successfully saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 uploadId:
 *                   type: string
 *                 matchId:
 *                   type: string
 *                 playerManagement:
 *                   type: object
 *       400:
 *         description: Invalid request or token
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post("/confirm", protect, isAdmin, confirmMatchPdf);

export default router;
