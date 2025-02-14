import PlayerStats from "../models/PlayerStats.js";
import Match from "../models/Match.js";
import Player from "../models/Player.js";

export const getAllPlayerStats = async (req, res) => {
  try {
    const stats = await PlayerStats.find().populate("player match");
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStatsByPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const stats = await PlayerStats.find({ player: playerId }).populate(
      "match"
    );

    if (!stats.length) {
      return res
        .status(404)
        .json({ message: "No stats found for this player" });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStatsByMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const stats = await PlayerStats.find({ match: matchId }).populate("player");

    if (!stats.length) {
      return res.status(404).json({ message: "No stats found for this match" });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addPlayerStats = async (req, res) => {
  try {
    const {
      matchId,
      playerId,
      points,
      rebounds,
      assists,
      steals,
      blocks,
      minutesPlayed,
    } = req.body;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });

    const player = await Player.findById(playerId);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const newStats = await PlayerStats.create({
      match: matchId,
      player: playerId,
      points,
      rebounds,
      assists,
      steals,
      blocks,
      minutesPlayed,
    });

    player.statsHistory.push(newStats._id);
    await player.save();

    match.playerStats.push(newStats._id);
    await match.save();

    res.status(201).json(newStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStats = await PlayerStats.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStats) {
      return res.status(404).json({ message: "Player stats not found" });
    }

    res.status(200).json(updatedStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deletePlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStats = await PlayerStats.findByIdAndDelete(id);

    if (!deletedStats) {
      return res.status(404).json({ message: "Player stats not found" });
    }

    res.status(200).json({ message: "Player stats deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
