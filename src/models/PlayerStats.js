import mongoose from "mongoose";

const playerStatsSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    }, // Match reference
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    }, // Player reference

    // ✅ Individual player performance in this match
    fieldGoalsMade: { type: Number, default: 0 },
    fieldgoalsAttempted: { type: Number, default: 0 },
    twoPointsMade: { type: Number, default: 0 },
    twoPointsAttempted: { type: Number, default: 0 },
    threePointsMade: { type: Number, default: 0 },
    threePointsAttempted: { type: Number, default: 0 },
    freeThrowsMade: { type: Number, default: 0 },
    freeThrowsAttempted: { type: Number, default: 0 },
    offensiveRebounds: { type: Number, default: 0 },
    defensiveRebounds: { type: Number, default: 0 },
    totalAssists: { type: Number, default: 0 },
    totalSteals: { type: Number, default: 0 },
    totalBlocks: { type: Number, default: 0 },
    totalTurnovers: { type: Number, default: 0 },
    totalFouls: { type: Number, default: 0 },
    plusMinus: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PlayerStats = mongoose.model("PlayerStats", playerStatsSchema);
export default PlayerStats;
