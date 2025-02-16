import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// import Routes
import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import playerStatsRoutes from "./routes/playerStatsRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

import setupSwagger from "./config/swagger.js";

// Load Environment Variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Setup Swagger Docs
setupSwagger(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/player-stats", playerStatsRoutes);
app.use("/api/pdf", pdfRoutes);

export default app;
