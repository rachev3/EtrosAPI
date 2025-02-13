import Stats from "../models/Stats.js";
import Player from "../models/Player.js";

// **1️⃣ Get Team Stats from Database**
export const getTeamStats = async (req, res) => {
  try {
    const latestStats = await Stats.findOne().sort({ createdAt: -1 });

    if (!latestStats) {
      return res.status(404).json({ message: "No stats found" });
    }

    res.status(200).json(latestStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **2️⃣ Get Player Stats (Top Scorer, etc.)**
export const getPlayerStats = async (req, res) => {
  try {
    const players = await Player.find({}, "name stats");

    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **3️⃣ Update Team Stats After a Match**
export const updateStatsAfterMatch = async (match) => {
  try {
    const season = "2023-2024"; // Dynamic season handling can be added

    let stats = await Stats.findOne({ season });

    if (!stats) {
      stats = new Stats({ season });
    }

    stats.totalMatches += 1;
    if (match.result === "Win") stats.totalWins += 1;
    if (match.result === "Loss") stats.totalLosses += 1;

    // Calculate win percentage
    stats.winPercentage =
      ((stats.totalWins / stats.totalMatches) * 100).toFixed(2) + "%";

    await stats.save();
  } catch (error) {
    console.error("Error updating stats:", error.message);
  }
};
