import PlayerStats from "../models/PlayerStats.js";
import Match from "../models/Match.js";
import Player from "../models/Player.js";
import APIFeatures from "../utils/apiFeatures.js";

export const getAllPlayerStats = async (req, res) => {
  try {
    // Create a new APIFeatures instance with filtering and sorting
    const features = new APIFeatures(PlayerStats.find(), req.query)
      .filter()
      .sort();

    // Apply pagination
    await features.paginate();

    // Apply population if requested
    features.populate();

    const stats = await features.query;

    res.status(200).json({
      success: true,
      count: stats.length,
      pagination: features.paginationData,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getStatsByPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const stats = await PlayerStats.find({ player: playerId }).populate(
      "match"
    );

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: "No stats found for this player",
      });
    }

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getStatsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const stats = await PlayerStats.find({ match: matchId }).populate("player");

    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: "No stats found for this match",
      });
    }

    res.status(200).json({
      success: true,
      count: stats.length,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const addPlayerStats = async (req, res) => {
  try {
    const {
      matchId,
      playerId,
      fieldGoalsMade,
      fieldGoalsAttempted,
      twoPointsMade,
      twoPointsAttempted,
      threePointsMade,
      threePointsAttempted,
      freeThrowsMade,
      freeThrowsAttempted,
      offensiveRebounds,
      defensiveRebounds,
      totalRebounds,
      assists,
      steals,
      blocks,
      turnovers,
      fouls,
      plusMinus,
      efficiency,
      points,
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match)
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });

    const player = await Player.findById(playerId);
    if (!player)
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });

    const newStats = await PlayerStats.create({
      match: matchId,
      player: playerId,
      // Shooting stats
      fieldGoalsMade: fieldGoalsMade || 0,
      fieldGoalsAttempted: fieldGoalsAttempted || 0,
      twoPointsMade: twoPointsMade || 0,
      twoPointsAttempted: twoPointsAttempted || 0,
      threePointsMade: threePointsMade || 0,
      threePointsAttempted: threePointsAttempted || 0,
      freeThrowsMade: freeThrowsMade || 0,
      freeThrowsAttempted: freeThrowsAttempted || 0,
      offensiveRebounds: offensiveRebounds || 0,
      defensiveRebounds: defensiveRebounds || 0,
      totalRebounds: totalRebounds || 0,
      assists: assists || 0,
      steals: steals || 0,
      blocks: blocks || 0,
      turnovers: turnovers || 0,
      fouls: fouls || 0,
      plusMinus: plusMinus || 0,
      efficiency: efficiency || 0,
      points: points || 0,
    });

    // Add stats to player's history
    player.statsHistory.push(newStats._id);
    await player.save();

    // Add stats to match
    match.playerStats.push(newStats._id);
    await match.save();

    res.status(201).json({
      success: true,
      data: newStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updatePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStats = await PlayerStats.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStats) {
      return res.status(404).json({
        success: false,
        message: "Player stats not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deletePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStats = await PlayerStats.findByIdAndDelete(id);

    if (!deletedStats) {
      return res.status(404).json({
        success: false,
        message: "Player stats not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Player stats deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
