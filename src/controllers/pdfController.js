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
        results.created.push(`${cleanName} (#${playerData.number})`);
      } else {
        // Update player number if it has changed
        if (player.number !== playerData.number) {
          player.number = playerData.number;
          await player.save();
        }
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

      // Check for an existing upcoming match
      const existingMatch = await Match.findOne({
        date: parsedData.metadata.date,
        opponent: opponentTeam.name,
        status: "upcoming",
      });

      let match;

      if (existingMatch) {
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

// Preview PDF data without saving
export const previewMatchPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const { buffer } = req.file;

    // Parse the PDF content
    const parsedData = await parseMatchStatistics(buffer);

    // Get the Етрос team data
    const etrosTeam = parsedData.metadata.isEtrosHome
      ? parsedData.homeTeam
      : parsedData.awayTeam;
    const opponentTeam = parsedData.metadata.isEtrosHome
      ? parsedData.awayTeam
      : parsedData.homeTeam;

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

    // Validate player data and check for potential issues
    const playerValidation = await validatePlayerData(etrosTeam.players);

    // Prepare preview response
    const preview = {
      matchDetails: {
        date: parsedData.metadata.date,
        venue: parsedData.metadata.venue,
        gameNumber: parsedData.metadata.gameNo,
        attendance: parsedData.metadata.attendance,
        duration: parsedData.metadata.duration,
        teams: {
          etros: {
            isHome: parsedData.metadata.isEtrosHome,
            score: etrosTeam.score,
          },
          opponent: {
            name: opponentTeam.name,
            score: opponentTeam.score,
          },
        },
      },
      teamStatistics: parsedData.teamStats,
      playerStatistics: etrosTeam.players.map((player) => ({
        ...player,
        validationStatus:
          playerValidation.playerStatuses[player.name] || "unknown",
      })),
      potentialIssues: {
        ...playerValidation.issues,
        dataInconsistencies: validateTeamData(parsedData),
      },
      uploadToken: generateUploadToken(parsedData), // For confirming upload later
    };

    res.status(200).json(preview);
  } catch (error) {
    console.error("PDF preview error:", error);
    res.status(500).json({
      message: "Failed to preview PDF: " + error.message,
      details: error.stack,
    });
  }
};

// Confirm and save previewed data
export const confirmMatchPdf = async (req, res) => {
  try {
    const { uploadToken, adjustments } = req.body;

    if (!uploadToken) {
      return res.status(400).json({ message: "Upload token is required" });
    }

    // Verify and decode the upload token
    const parsedData = verifyUploadToken(uploadToken);
    if (!parsedData) {
      return res
        .status(400)
        .json({ message: "Invalid or expired upload token" });
    }

    // Apply any adjustments from the admin
    if (adjustments) {
      applyAdjustments(parsedData, adjustments);
    }

    // Process the upload similar to uploadMatchPdf but use the adjusted data
    const result = await processMatchUpload(parsedData, req.user._id);

    res.status(201).json({
      message: "Match data saved successfully",
      uploadId: result.uploadId,
      matchId: result.matchId,
      playerManagement: result.playerManagement,
    });
  } catch (error) {
    console.error("PDF confirmation error:", error);
    res.status(500).json({
      message: "Failed to confirm PDF upload: " + error.message,
      details: error.stack,
    });
  }
};

// Helper function to validate player data
const validatePlayerData = async (players) => {
  const issues = {
    missingPlayers: [],
    numberMismatches: [],
    unusualStats: [],
  };
  const playerStatuses = {};

  for (const player of players) {
    let status = "valid";
    const existingPlayer = await Player.findOne({ name: player.name.trim() });

    // Check for missing or new players
    if (!existingPlayer) {
      issues.missingPlayers.push({
        name: player.name,
        number: player.number,
        action: "Will be created as new player",
      });
      status = "new_player";
    }
    // Check for number mismatches
    else if (existingPlayer.number !== player.number) {
      issues.numberMismatches.push({
        name: player.name,
        currentNumber: existingPlayer.number,
        newNumber: player.number,
        action: "Number will be updated",
      });
      status = "number_mismatch";
    }

    // Check for unusual statistics
    if (!player.didNotPlay) {
      if (player.points > 70) {
        issues.unusualStats.push({
          name: player.name,
          issue: "Unusually high points",
          value: player.points,
        });
        status = "unusual_stats";
      }
      // Add more statistical validations as needed
    }

    playerStatuses[player.name] = status;
  }

  return {
    issues,
    playerStatuses,
  };
};

// Helper function to validate team data
const validateTeamData = (parsedData) => {
  const issues = [];
  const etrosTeam = parsedData.metadata.isEtrosHome
    ? parsedData.homeTeam
    : parsedData.awayTeam;

  // Validate team score matches sum of player points
  const totalPlayerPoints = etrosTeam.players.reduce(
    (sum, player) => sum + (player.points || 0),
    0
  );
  if (totalPlayerPoints !== etrosTeam.score) {
    issues.push({
      type: "score_mismatch",
      message: `Team score (${etrosTeam.score}) doesn't match sum of player points (${totalPlayerPoints})`,
      severity: "warning",
    });
  }

  // Add more team-level validations as needed

  return issues;
};

// Helper function to generate upload token
const generateUploadToken = (parsedData) => {
  // In a real implementation, you would:
  // 1. Encrypt the data
  // 2. Add an expiration timestamp
  // 3. Sign it with a secret key
  return Buffer.from(JSON.stringify(parsedData)).toString("base64");
};

// Helper function to verify upload token
const verifyUploadToken = (token) => {
  try {
    // In a real implementation, you would:
    // 1. Verify the signature
    // 2. Check the expiration
    // 3. Decrypt the data
    return JSON.parse(Buffer.from(token, "base64").toString());
  } catch (error) {
    return null;
  }
};

// Helper function to apply admin adjustments
const applyAdjustments = (parsedData, adjustments) => {
  if (adjustments.playerStats) {
    for (const [playerName, stats] of Object.entries(adjustments.playerStats)) {
      const player = parsedData.metadata.isEtrosHome
        ? parsedData.homeTeam.players.find((p) => p.name === playerName)
        : parsedData.awayTeam.players.find((p) => p.name === playerName);

      if (player) {
        Object.assign(player, stats);
      }
    }
  }

  if (adjustments.teamStats) {
    Object.assign(parsedData.teamStats, adjustments.teamStats);
  }

  if (adjustments.matchDetails) {
    Object.assign(parsedData.metadata, adjustments.matchDetails);
  }
};

// Helper function to process the final upload
const processMatchUpload = async (parsedData, userId) => {
  const etrosTeam = parsedData.metadata.isEtrosHome
    ? parsedData.homeTeam
    : parsedData.awayTeam;
  const opponentTeam = parsedData.metadata.isEtrosHome
    ? parsedData.awayTeam
    : parsedData.homeTeam;

  // Create new upload record
  const upload = await MatchPdfUpload.create({
    fileName: "Confirmed Upload", // Since this is a confirmation, we don't have the original filename
    uploadedBy: userId,
    matchDate: parsedData.metadata.date,
    opponent: opponentTeam.name,
    processingStatus: "processing",
  });

  try {
    // Manage Etros players
    const playerResults = await manageEtrosPlayers(etrosTeam.players);

    // Create or update match record
    const existingMatch = await Match.findOne({
      date: parsedData.metadata.date,
      opponent: opponentTeam.name,
      status: "upcoming",
    });

    let match;
    if (existingMatch) {
      match = await Match.findByIdAndUpdate(
        existingMatch._id,
        {
          status: "finished",
          ourScore: etrosTeam.score,
          opponentScore: opponentTeam.score,
          result: etrosTeam.score > opponentTeam.score ? "Win" : "Loss",
          teamStats: parsedData.teamStats,
        },
        { new: true }
      );
    } else {
      match = await Match.create({
        date: parsedData.metadata.date,
        location: parsedData.metadata.venue,
        opponent: opponentTeam.name,
        status: "finished",
        ourScore: etrosTeam.score,
        opponentScore: opponentTeam.score,
        result: etrosTeam.score > opponentTeam.score ? "Win" : "Loss",
        teamStats: parsedData.teamStats,
      });
    }

    // Create player statistics records
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

        // Add stats to match and player
        if (!match.playerStats.includes(playerStats._id)) {
          match.playerStats.push(playerStats._id);
        }
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

    return {
      uploadId: upload._id,
      matchId: match._id,
      playerManagement: {
        created: playerResults.created,
        existing: playerResults.existing,
        errors: playerResults.errors,
      },
    };
  } catch (error) {
    // Update upload record with error status
    await MatchPdfUpload.findByIdAndUpdate(upload._id, {
      processingStatus: "failed",
      errorMessage: error.message,
    });
    throw error;
  }
};
