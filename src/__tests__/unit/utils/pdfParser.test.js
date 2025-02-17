import { jest, describe, it, expect, beforeAll } from "@jest/globals";
import { parseMatchStatistics } from "../../../utils/pdfParser.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("PDF Parser", () => {
  let samplePdfBuffer;

  beforeAll(async () => {
    // Load sample PDF file
    const fixturePath = path.join(
      __dirname,
      "../../__fixtures__/sample_match.pdf"
    );
    samplePdfBuffer = await fs.readFile(fixturePath);
  });

  describe("parseMatchStatistics", () => {
    it("should parse match metadata correctly", async () => {
      const result = await parseMatchStatistics(samplePdfBuffer);

      expect(result).toHaveProperty("metadata");
      expect(result.metadata).toHaveProperty("date");
      expect(result.metadata).toHaveProperty("venue");
      expect(result.metadata).toHaveProperty("gameNo");
      expect(result.metadata).toHaveProperty("attendance");
      expect(result.metadata).toHaveProperty("duration");
      expect(result.metadata).toHaveProperty("isEtrosHome");
    });

    it("should parse team statistics correctly", async () => {
      const result = await parseMatchStatistics(samplePdfBuffer);

      expect(result).toHaveProperty("teamStats");
      expect(result.teamStats).toHaveProperty("fieldGoalsMade");
      expect(result.teamStats).toHaveProperty("fieldGoalsAttempted");
      expect(result.teamStats).toHaveProperty("twoPointsMade");
      expect(result.teamStats).toHaveProperty("twoPointsAttempted");
      expect(result.teamStats).toHaveProperty("threePointsMade");
      expect(result.teamStats).toHaveProperty("threePointsAttempted");
      expect(result.teamStats).toHaveProperty("freeThrowsMade");
      expect(result.teamStats).toHaveProperty("freeThrowsAttempted");
    });

    it("should parse player statistics correctly", async () => {
      const result = await parseMatchStatistics(samplePdfBuffer);
      const etrosTeam = result.metadata.isEtrosHome
        ? result.homeTeam
        : result.awayTeam;

      expect(etrosTeam).toHaveProperty("players");
      expect(Array.isArray(etrosTeam.players)).toBe(true);

      if (etrosTeam.players.length > 0) {
        const player = etrosTeam.players[0];
        expect(player).toHaveProperty("name");
        expect(player).toHaveProperty("number");
        expect(player).toHaveProperty("minutes");
        expect(player).toHaveProperty("fieldGoals");
        expect(player).toHaveProperty("twoPoints");
        expect(player).toHaveProperty("threePoints");
        expect(player).toHaveProperty("freeThrows");
        expect(player).toHaveProperty("rebounds");
        expect(player).toHaveProperty("assists");
        expect(player).toHaveProperty("turnovers");
        expect(player).toHaveProperty("steals");
        expect(player).toHaveProperty("blocks");
        expect(player).toHaveProperty("fouls");
      }
    });

    it("should handle DNP players correctly", async () => {
      const result = await parseMatchStatistics(samplePdfBuffer);
      const etrosTeam = result.metadata.isEtrosHome
        ? result.homeTeam
        : result.awayTeam;

      const dnpPlayers = etrosTeam.players.filter(
        (player) => player.didNotPlay
      );
      dnpPlayers.forEach((player) => {
        expect(player.didNotPlay).toBe(true);
        expect(player).toHaveProperty("name");
        expect(player).toHaveProperty("number");
      });
    });

    it("should throw an error for invalid PDF", async () => {
      const invalidBuffer = Buffer.from("invalid pdf content");

      await expect(parseMatchStatistics(invalidBuffer)).rejects.toThrow();
    });
  });
});
