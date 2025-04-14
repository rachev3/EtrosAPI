import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import matchRoutes from "./routes/matchRoutes";
import articleRoutes from "./routes/articleRoutes";
import imageRoutes from "./routes/imageRoutes";
import playerStatsRoutes from "./routes/playerStatsRoutes";

import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/player-stats", playerStatsRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error: Error & { statusCode?: number } = new Error(
    `Route ${req.originalUrl} not found`
  );
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

export default app;
