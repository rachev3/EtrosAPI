import { parseMatchStatistics } from "../utils/pdfParser.js";
import MatchPdfUpload from "../models/MatchPdfUpload.js";
import Match from "../models/Match.js";
import PlayerStats from "../models/PlayerStats.js";
import Player from "../models/Player.js";

// Function to check and create players if they don't exist
const manageEtrosPlayers = async (players) => {
  const results = {
    created: [],
    existing: [],
    errors: [],
  };

  console.log("Managing players:", players);

  for (const playerData of players) {
    try {
      // Skip DNP players
      if (playerData.didNotPlay) {
        continue;
      }

      // Clean the player name
      const cleanName = playerData.name.trim();

      // Check if player exists
      let player = await Player.findOne({ name: cleanName });

      if (!player) {
        // Create new player with minimal required data
        player = await Player.create({
          name: cleanName,
          number: playerData.number,
          bornYear: 2000, // Placeholder year
        });

        console.log(`Created new player: ${cleanName} (#${playerData.number})`);
        results.created.push(`${cleanName} (#${playerData.number})`);
      } else {
        // Update player number if it has changed
        if (player.number !== playerData.number) {
          player.number = playerData.number;
          await player.save();
        }
        console.log(
          `Found existing player: ${cleanName} (#${playerData.number})`
        );
        results.existing.push(`${cleanName} (#${playerData.number})`);
      }
    } catch (error) {
      console.error(`Error managing player ${playerData.name}:`, error);
      results.errors.push({
        name: playerData.name,
        error: error.message,
      });
    }
  }

  return results;
};

// Upload and process PDF
export const uploadMatchPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const { buffer } = req.file;

    // Parse the PDF content
    const parsedData = await parseMatchStatistics(buffer);

    // Debug log to see the structure
    console.log("Parsed Data Structure:", JSON.stringify(parsedData, null, 2));

    // Get the Етрос team data
    const etrosTeam = parsedData.metadata.isEtrosHome
      ? parsedData.homeTeam
      : parsedData.awayTeam;
    const opponentTeam = parsedData.metadata.isEtrosHome
      ? parsedData.awayTeam
      : parsedData.homeTeam;

    if (!etrosTeam || !etrosTeam.players) {
      throw new Error("Failed to extract Етрос team data from the PDF");
    }

    // Manage Etros players before processing the match
    const playerResults = await manageEtrosPlayers(etrosTeam.players);
    console.log("Player management results:", playerResults);

    // Check for duplicates using the parsed date and opponent
    const existingUpload = await MatchPdfUpload.findOne({
      matchDate: parsedData.metadata.date,
      opponent: opponentTeam.name,
    });

    if (existingUpload) {
      return res.status(409).json({
        message: "A match with this date and opponent already exists",
        existingUploadId: existingUpload._id,
      });
    }

    // Create new upload record
    const upload = await MatchPdfUpload.create({
      fileName: req.file.originalname,
      uploadedBy: req.user._id,
      matchDate: parsedData.metadata.date,
      opponent: opponentTeam.name,
      processingStatus: "processing",
    });

    try {
      // Use the parsed team stats directly instead of calculating from players
      const teamStats = parsedData.teamStats;
      console.log("Team stats to be saved:", teamStats);

      // Check for an existing upcoming match
      const existingMatch = await Match.findOne({
        date: parsedData.metadata.date,
        opponent: opponentTeam.name,
        status: "upcoming",
      });

      let match;

      if (existingMatch) {
        console.log("Updating existing match with stats:", teamStats);
        // Update existing match
        match = await Match.findByIdAndUpdate(
          existingMatch._id,
          {
            status: "finished",
            ourScore: etrosTeam.score,
            opponentScore: opponentTeam.score,
            result: etrosTeam.score > opponentTeam.score ? "Win" : "Loss",
            teamStats,
          },
          { new: true }
        );
      } else {
        // Create new match record
        match = await Match.create({
          date: parsedData.metadata.date,
          location: parsedData.metadata.venue,
          opponent: opponentTeam.name,
          status: "finished",
          ourScore: etrosTeam.score,
          opponentScore: opponentTeam.score,
          result: etrosTeam.score > opponentTeam.score ? "Win" : "Loss",
          teamStats,
        });
      }

      // Create player statistics records for Етрос players only
      for (const playerStat of etrosTeam.players) {
        if (!playerStat.didNotPlay) {
          const player = await Player.findOne({ name: playerStat.name.trim() });
          if (!player) continue;

          // Check for existing stats
          const existingStats = await PlayerStats.findOne({
            match: match._id,
            player: player._id,
          });
          if (existingStats) continue;

          const playerStats = await PlayerStats.create({
            match: match._id,
            player: player._id,
            fieldGoalsMade: parseInt(playerStat.fieldGoals.made),
            fieldgoalsAttempted: parseInt(playerStat.fieldGoals.attempts),
            twoPointsMade: parseInt(playerStat.twoPoints.made),
            twoPointsAttempted: parseInt(playerStat.twoPoints.attempts),
            threePointsMade: parseInt(playerStat.threePoints.made),
            threePointsAttempted: parseInt(playerStat.threePoints.attempts),
            freeThrowsMade: parseInt(playerStat.freeThrows.made),
            freeThrowsAttempted: parseInt(playerStat.freeThrows.attempts),
            offensiveRebounds: parseInt(playerStat.rebounds.offensive),
            defensiveRebounds: parseInt(playerStat.rebounds.defensive),
            totalAssists: parseInt(playerStat.assists),
            totalSteals: parseInt(playerStat.steals),
            totalBlocks: parseInt(playerStat.blocks),
            totalTurnovers: parseInt(playerStat.turnovers),
            totalFouls: parseInt(playerStat.fouls.personal),
            plusMinus: parseInt(playerStat.plusMinus),
            efficiency: parseInt(playerStat.efficiency),
            totalPoints: parseInt(playerStat.points),
          });

          // Add the player stats to the match's playerStats array if not already there
          if (!match.playerStats.includes(playerStats._id)) {
            match.playerStats.push(playerStats._id);
          }

          // Add the stats to the player's statsHistory if not already there
          if (!player.statsHistory.includes(playerStats._id)) {
            player.statsHistory.push(playerStats._id);
            await player.save();
          }
        }
      }

      // Save the match with updated playerStats array
      await match.save();

      // Update upload record with success status
      await MatchPdfUpload.findByIdAndUpdate(upload._id, {
        processingStatus: "completed",
        matchId: match._id,
      });

      // Verify the saved match data
      const savedMatch = await Match.findById(match._id);
      console.log("Saved match data:", savedMatch);

      res.status(201).json({
        message: existingMatch
          ? "Match updated successfully"
          : "PDF processed successfully",
        uploadId: upload._id,
        matchId: match._id,
        playerManagement: {
          created: playerResults.created,
          existing: playerResults.existing,
          errors: playerResults.errors,
        },
      });
    } catch (processingError) {
      // Update upload record with error status
      await MatchPdfUpload.findByIdAndUpdate(upload._id, {
        processingStatus: "failed",
        errorMessage: processingError.message,
      });

      throw processingError;
    }
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      message: "Failed to process PDF upload: " + error.message,
      details: error.stack,
    });
  }
};

// Get upload status
export const getUploadStatus = async (req, res) => {
  try {
    const upload = await MatchPdfUpload.findById(req.params.uploadId);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    res.json({
      status: upload.processingStatus,
      errorMessage: upload.errorMessage,
      matchId: upload.matchId,
      matchDate: upload.matchDate,
      opponent: upload.opponent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get upload status: " + error.message });
  }
};
