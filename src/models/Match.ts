import mongoose from "mongoose";
import {
  MatchStatus,
  MatchResult,
  MatchDocument,
  MatchModel,
} from "../types/models/Match";

const matchSchema = new mongoose.Schema(
  {
    opponent: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["upcoming", "finished"] as MatchStatus[],
      default: "upcoming",
    },
    result: {
      type: String,
      enum: ["Win", "Loss", "Pending"] as MatchResult[],
      default: "Pending",
    },
    ourScore: { type: Number, default: null },
    opponentScore: { type: Number, default: null },

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
      totalRebounds: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      turnovers: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },

    playerStats: [{ type: mongoose.Schema.Types.ObjectId, ref: "PlayerStats" }],
  },
  { timestamps: true }
);

matchSchema.pre("save", function (next) {
  if (this.date) {
    const d = new Date(this.date);
    d.setSeconds(0, 0);
    this.date = d;
  }
  next();
});

const Match = mongoose.model<MatchDocument, MatchModel>("Match", matchSchema);
export default Match;
