import Match from "../models/Match.js";
import APIFeatures from "../utils/apiFeatures.js";

// **1️⃣ Get All Matches**
export const getMatches = async (req, res) => {
  try {
    // Create a new APIFeatures instance with filtering and sorting
    const features = new APIFeatures(Match.find(), req.query).filter().sort();

    // Apply pagination
    await features.paginate();

    // Apply population if requested
    features.populate();

    const matches = await features.query;

    res.status(200).json({
      success: true,
      count: matches.length,
      pagination: features.paginationData,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// **2️⃣ Get a Single Match**
export const getMatch = async (req, res) => {
  try {
    // Create a base query
    let query = Match.findById(req.params.id);

    // Apply population if requested
    if (req.query.populate) {
      const populateFields = req.query.populate.split(",");

      populateFields.forEach((field) => {
        // Check if there's a selection specified with field:selection
        if (field.includes(":")) {
          const [fieldName, selection] = field.split(":");
          // Convert selection to space-separated string for mongoose
          const select = selection.replace(/;/g, " ");
          query = query.populate({
            path: fieldName,
            select,
          });
        } else {
          // Simple population without selection
          query = query.populate(field);
        }
      });
    }

    const match = await query;

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// **3️⃣ Create a New Match (Admin Only)**
export const createMatch = async (req, res) => {
  try {
    const {
      opponent,
      date,
      location,
      ourScore,
      opponentScore,
      teamStats,
      playerStats,
    } = req.body;

    // Determine result based on provided scores
    let result = "Pending";
    if (ourScore !== null && opponentScore !== null) {
      result =
        ourScore > opponentScore
          ? "Win"
          : ourScore < opponentScore
          ? "Loss"
          : "Pending";
    }

    // Ensure `teamStats` is properly structured or use default values
    const defaultTeamStats = {
      fieldGoalsMade: 0,
      fieldgoalsAttempted: 0,
      twoPointsMade: 0,
      twoPointsAttempted: 0,
      threePointsMade: 0,
      threePointsAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      totalAssists: 0,
      totalSteals: 0,
      totalBlocks: 0,
      totalTurnovers: 0,
      totalFouls: 0,
      totalPoints: 0,
    };

    // Merge provided `teamStats` with defaults (if missing fields)
    const finalTeamStats = { ...defaultTeamStats, ...teamStats };

    // Create match
    const newMatch = await Match.create({
      opponent,
      date,
      location,
      result,
      ourScore: ourScore || null,
      opponentScore: opponentScore || null,
      teamStats: finalTeamStats,
      playerStats: playerStats || [],
    });

    res.status(201).json({
      success: true,
      data: newMatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// **Update Match Result (Admin Only)**
export const updateMatch = async (req, res) => {
  try {
    // When updating match result, ensure scores are set
    if (req.body.result && req.body.result !== "Pending") {
      if (
        req.body.ourScore === undefined ||
        req.body.opponentScore === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Score values are required when setting a match result",
        });
      }
    }

    // Allow manual updates for all fields including team statistics
    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedMatch) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Helper function to update team stats after a match
const updateStatsAfterMatch = async (match) => {
  try {
    // Populate playerStats to access all the individual player statistics
    const populatedMatch = await Match.findById(match._id).populate(
      "playerStats"
    );

    if (!populatedMatch || !populatedMatch.playerStats.length) {
      console.log("No player stats found for this match");
      return;
    }

    // Initialize team stats object with zeros
    const teamStats = {
      fieldGoalsMade: 0,
      fieldGoalsAttempted: 0,
      twoPointsMade: 0,
      twoPointsAttempted: 0,
      threePointsMade: 0,
      threePointsAttempted: 0,
      freeThrowsMade: 0,
      freeThrowsAttempted: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      totalRebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      plusMinus: 0,
      efficiency: 0,
      totalPoints: 0,
    };

    // Aggregate all player stats into team stats
    populatedMatch.playerStats.forEach((playerStat) => {
      teamStats.fieldGoalsMade += playerStat.fieldGoalsMade || 0;
      teamStats.fieldGoalsAttempted += playerStat.fieldGoalsAttempted || 0;
      teamStats.twoPointsMade += playerStat.twoPointsMade || 0;
      teamStats.twoPointsAttempted += playerStat.twoPointsAttempted || 0;
      teamStats.threePointsMade += playerStat.threePointsMade || 0;
      teamStats.threePointsAttempted += playerStat.threePointsAttempted || 0;
      teamStats.freeThrowsMade += playerStat.freeThrowsMade || 0;
      teamStats.freeThrowsAttempted += playerStat.freeThrowsAttempted || 0;
      teamStats.offensiveRebounds += playerStat.offensiveRebounds || 0;
      teamStats.defensiveRebounds += playerStat.defensiveRebounds || 0;
      teamStats.totalRebounds += playerStat.totalRebounds || 0;
      teamStats.assists += playerStat.assists || 0;
      teamStats.steals += playerStat.steals || 0;
      teamStats.blocks += playerStat.blocks || 0;
      teamStats.turnovers += playerStat.turnovers || 0;
      teamStats.fouls += playerStat.fouls || 0;
      teamStats.plusMinus += playerStat.plusMinus || 0;
      teamStats.efficiency += playerStat.efficiency || 0;
      teamStats.totalPoints += playerStat.totalPoints || 0;
    });

    // Update match with aggregated team stats
    await Match.findByIdAndUpdate(match._id, { teamStats });

    // Optional: Update player stats to reflect the final match result
    // For example, you could update player win/loss records here if needed

    console.log("Match stats updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating stats after match:", error);
    return false;
  }
};

// **5️⃣ Delete a Match (Admin Only)**
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
