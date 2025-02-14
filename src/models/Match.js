import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    opponent: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    result: {
      type: String,
      enum: ["Win", "Loss", "Pending"],
      default: "Pending",
    },
    ourScore: { type: Number, default: null },
    opponentScore: { type: Number, default: null },

    // ✅ Store aggregated team stats
    teamStats: {
      fieldGoalsMade: { type: Number, default: 0 },
      fieldGoalsAttempted: { type: Number, default: 0 },
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
      totalPoints: { type: Number, default: 0 },
    },

    // ✅ Link to player stats for this match
    playerStats: [{ type: mongoose.Schema.Types.ObjectId, ref: "PlayerStats" }],
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
