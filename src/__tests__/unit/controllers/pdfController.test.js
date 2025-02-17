import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock dependencies
jest.mock("@/utils/pdfParser.js", () => ({
  parseMatchStatistics: jest.fn(),
}));
jest.mock("@/models/MatchPdfUpload.js");
jest.mock("@/models/Match.js");
jest.mock("@/models/Player.js");
jest.mock("@/models/PlayerStats.js");

// Import after mocks using namespace import
import * as pdfParser from "@/utils/pdfParser.js";
import {
  uploadMatchPdf,
  previewMatchPdf,
} from "@/controllers/pdfController.js";
import MatchPdfUpload from "@/models/MatchPdfUpload.js";
import Match from "@/models/Match.js";
import Player from "@/models/Player.js";
import PlayerStats from "@/models/PlayerStats.js";

// Define a variable to reference the mocked function
const parseMatchStatisticsMock = jest.requireMock(
  "@/utils/pdfParser.js"
).parseMatchStatistics;

describe("PDF Controller", () => {
  let mockReq;
  let mockRes;
  let mockParsedData;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock request and response
    mockReq = {
      file: {
        buffer: Buffer.from("mock pdf content"),
        originalname: "test.pdf",
      },
      user: {
        _id: "mockUserId",
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup mock parsed data
    mockParsedData = {
      metadata: {
        date: new Date("2024-01-01"),
        venue: "Test Venue",
        gameNo: "1",
        attendance: 100,
        duration: "40:00",
        isEtrosHome: true,
      },
      homeTeam: {
        name: "Етрос",
        score: 80,
        players: [
          {
            name: "Test Player",
            number: "10",
            minutes: "20:00",
            fieldGoals: { made: 5, attempts: 10 },
            twoPoints: { made: 3, attempts: 6 },
            threePoints: { made: 2, attempts: 4 },
            freeThrows: { made: 2, attempts: 2 },
            rebounds: { offensive: 2, defensive: 3 },
            assists: 4,
            turnovers: 2,
            steals: 1,
            blocks: 1,
            fouls: { personal: 2, drawn: 1 },
          },
        ],
      },
      awayTeam: {
        name: "Opponent",
        score: 75,
      },
      teamStats: {
        fieldGoalsMade: 30,
        fieldGoalsAttempted: 60,
      },
    };

    // Setup mock implementations
    parseMatchStatisticsMock.mockImplementation(async (buffer) => {
      if (!buffer || !(buffer instanceof Buffer)) {
        throw new Error("Invalid PDF structure");
      }
      return mockParsedData;
    });

    // Default mock implementations
    MatchPdfUpload.findOne = jest.fn(() => ({
      exec: () => null,
    }));
    MatchPdfUpload.findByIdAndUpdate = jest
      .fn()
      .mockResolvedValue({ _id: "newUploadId" });
    MatchPdfUpload.create = jest.fn().mockResolvedValue({ _id: "newUploadId" });
    Match.findOne = jest.fn(() => ({
      exec: () => null,
    }));
    Match.create = jest.fn().mockResolvedValue({
      _id: "newMatchId",
      playerStats: [],
      save: jest.fn().mockResolvedValue(true),
    });
    Player.findOne = jest.fn(() => ({
      exec: () => ({
        _id: "playerId",
        statsHistory: [],
        save: jest.fn().mockResolvedValue(true),
      }),
    }));
    PlayerStats.create = jest.fn().mockResolvedValue({ _id: "newStatsId" });
  });

  describe("uploadMatchPdf", () => {
    it("should return 400 if no file is uploaded", async () => {
      mockReq.file = null;

      await uploadMatchPdf(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "No PDF file uploaded",
      });
    });

    it("should handle duplicate match uploads", async () => {
      // Setup duplicate match scenario
      MatchPdfUpload.findOne = jest.fn(() => ({
        exec: () => ({ _id: "existingUploadId" }),
      }));

      await uploadMatchPdf(mockReq, mockRes);

      expect(parseMatchStatisticsMock).toHaveBeenCalledWith(
        mockReq.file.buffer
      );
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "A match with this date and opponent already exists",
        existingUploadId: "existingUploadId",
      });
    });

    it("should successfully process a new match upload", async () => {
      // Ensure no duplicate exists
      MatchPdfUpload.findOne = jest.fn(() => ({
        exec: () => null,
      }));

      await uploadMatchPdf(mockReq, mockRes);

      expect(parseMatchStatisticsMock).toHaveBeenCalledWith(
        mockReq.file.buffer
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "PDF processed successfully",
          uploadId: "newUploadId",
          matchId: "newMatchId",
          playerManagement: expect.any(Object),
        })
      );
    });

    it("should handle PDF parsing errors", async () => {
      parseMatchStatisticsMock.mockRejectedValue(
        new Error("PDF parsing failed")
      );

      await uploadMatchPdf(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Failed to process PDF upload"),
        })
      );
    });
  });

  describe("previewMatchPdf", () => {
    it("should return 400 if no file is uploaded", async () => {
      mockReq.file = null;

      await previewMatchPdf(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "No PDF file uploaded",
      });
    });

    it("should successfully generate a preview", async () => {
      // Ensure no duplicate exists
      MatchPdfUpload.findOne = jest.fn(() => ({
        exec: () => null,
      }));

      await previewMatchPdf(mockReq, mockRes);

      expect(parseMatchStatisticsMock).toHaveBeenCalledWith(
        mockReq.file.buffer
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          matchDetails: expect.any(Object),
          teamStatistics: expect.any(Object),
          playerStatistics: expect.any(Array),
          potentialIssues: expect.any(Object),
          uploadToken: expect.any(String),
        })
      );
    });

    it("should handle duplicate match check in preview", async () => {
      // Setup duplicate match scenario
      MatchPdfUpload.findOne = jest.fn(() => ({
        exec: () => ({ _id: "existingUploadId" }),
      }));

      await previewMatchPdf(mockReq, mockRes);

      expect(parseMatchStatisticsMock).toHaveBeenCalledWith(
        mockReq.file.buffer
      );
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "A match with this date and opponent already exists",
        existingUploadId: "existingUploadId",
      });
    });
  });
});
