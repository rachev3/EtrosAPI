import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger configuration options
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Etros API",
      version: "1.0.0",
      description: "API documentation for the Etros API",
    },
    servers: [
      {
        url: "https://etrosapi.onrender.com",
        description: "Live API",
      },
      {
        url: "http://localhost:5000",
        description: "Local Development",
      },
    ],
  },
  apis: [
    "src/routes/authRoutes.js",
    "src/routes/playerRoutes.js",
    "src/routes/matchRoutes.js",
    "src/routes/articleRoutes.js",
    "src/routes/statsRoutes.js",
    "src/routes/imageRoutes.js",
    "src/routes/playerStatsRoutes.js",
  ], // Scans all route files for API documentation
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
