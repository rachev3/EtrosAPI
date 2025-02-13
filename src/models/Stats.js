import mongoose from "mongoose";

const statsSchema = new mongoose.Schema(
  {
    season: {
      type: String, // Example: "2023-2024"
      required: true,
    },
    totalMatches: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    totalLosses: {
      type: Number,
      default: 0,
    },
    winPercentage: {
      type: String, // Example: "75%"
      default: "0%",
    },
    topScorer: {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      name: String,
      pointsPerGame: Number,
    },
  },
  { timestamps: true }
);

const Stats = mongoose.model("Stats", statsSchema);

export default Stats;
