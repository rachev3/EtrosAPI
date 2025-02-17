import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import MatchPdfUpload from "../../models/MatchPdfUpload.js";
import Match from "../../models/Match.js";
import Player from "../../models/Player.js";
import PlayerStats from "../../models/PlayerStats.js";
import User from "../../models/User.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("PDF Upload Integration", () => {
  let adminToken;
  let samplePdfBuffer;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    // Create test admin user
    testUser = await User.create({
      username: "testadmin",
      name: "Test Admin",
      email: "admin@test.com",
      password: "testpassword",
      role: "admin",
    });

    // Create admin token
    adminToken = jwt.sign(
      { id: testUser._id, isAdmin: true },
      process.env.JWT_SECRET || "test_secret",
      { expiresIn: "1h" }
    );

    // Load sample PDF file
    const fixturePath = path.join(
      __dirname,
      "../__fixtures__/sample_match.pdf"
    );
    samplePdfBuffer = await fs.readFile(fixturePath);
  });

  afterAll(async () => {
    // Clean up database
    await Promise.all([
      MatchPdfUpload.deleteMany({}),
      Match.deleteMany({}),
      Player.deleteMany({}),
      PlayerStats.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Disconnect from database
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await Promise.all([
      MatchPdfUpload.deleteMany({}),
      Match.deleteMany({}),
      Player.deleteMany({}),
      PlayerStats.deleteMany({}),
    ]);
  });

  describe("PDF Upload Flow", () => {
    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/pdf/upload")
        .attach("pdf", samplePdfBuffer, "test.pdf");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authorized, no token");
    });

    it("should require admin privileges", async () => {
      // Create non-admin user
      const regularUser = await User.create({
        username: "regularuser",
        name: "Regular User",
        email: "user@test.com",
        password: "testpassword",
        role: "user",
      });

      const userToken = jwt.sign(
        { id: regularUser._id, isAdmin: false },
        process.env.JWT_SECRET || "test_secret",
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .post("/api/pdf/upload")
        .set("Authorization", `Bearer ${userToken}`)
        .attach("pdf", samplePdfBuffer, "test.pdf");

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Access denied, admin only");
    });

    it("should successfully preview PDF data", async () => {
      const response = await request(app)
        .post("/api/pdf/preview")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("pdf", samplePdfBuffer, "test.pdf");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("matchDetails");
      expect(response.body).toHaveProperty("teamStatistics");
      expect(response.body).toHaveProperty("playerStatistics");
      expect(response.body).toHaveProperty("potentialIssues");
    });

    it("should successfully upload and process PDF", async () => {
      const response = await request(app)
        .post("/api/pdf/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("pdf", samplePdfBuffer, "test.pdf");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("uploadId");
      expect(response.body).toHaveProperty("matchId");

      // Verify database entries
      const match = await Match.findById(response.body.matchId);
      expect(match).toBeTruthy();
      expect(match.playerStats.length).toBeGreaterThan(0);

      // Verify player stats
      const playerStats = await PlayerStats.findById(match.playerStats[0]);
      expect(playerStats).toBeTruthy();
      expect(playerStats.match.toString()).toBe(match._id.toString());
    });

    it("should prevent duplicate match uploads", async () => {
      // First upload
      await request(app)
        .post("/api/pdf/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("pdf", samplePdfBuffer, "test.pdf");

      // Second upload (should fail)
      const response = await request(app)
        .post("/api/pdf/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("pdf", samplePdfBuffer, "test.pdf");

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("existingUploadId");
    });

    it("should handle invalid PDF files", async () => {
      const invalidPdf = Buffer.from("invalid pdf content");

      const response = await request(app)
        .post("/api/pdf/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("pdf", invalidPdf, "invalid.pdf");

      expect(response.status).toBe(500);
      expect(response.body.message).toContain("Failed to process PDF upload");
    });
  });
});
