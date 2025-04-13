import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// import Routes
import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import playerStatsRoutes from "./routes/playerStatsRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// import middleware
import errorHandler from "./middleware/errorHandler.js";

// Load Environment Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/player-stats", playerStatsRoutes);
app.use("/api/comments", commentRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware (must be the last middleware)
app.use(errorHandler);

export default app;
