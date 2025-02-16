import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// import Routes
import authRoutes from "./routes/authRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import playerStatsRoutes from "./routes/playerStatsRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

// Load Environment Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Etros API Documentation",
      version: "1.0.0",
      description:
        "API documentation for the Etros basketball statistics system",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://etrosapi.onrender.com"
            : "http://localhost:5000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [join(__dirname, "routes", "*.js")], // Using absolute path
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/player-stats", playerStatsRoutes);
app.use("/api/pdf", pdfRoutes);

export default app;
