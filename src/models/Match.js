import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    opponent: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["upcoming", "finished"],
      default: "upcoming",
    },
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
      totalRebounds: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      turnovers: { type: Number, default: 0 },
      fouls: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
    },

    // ✅ Link to player stats for this match
    playerStats: [{ type: mongoose.Schema.Types.ObjectId, ref: "PlayerStats" }],
  },
  { timestamps: true }
);

// Pre-save middleware to normalize date to only include year, month, day, hour, and minutes
matchSchema.pre("save", function (next) {
  if (this.date) {
    const d = new Date(this.date);
    // Set seconds and milliseconds to 0
    d.setSeconds(0, 0);
    this.date = d;
  }
  next();
});

const Match = mongoose.model("Match", matchSchema);
export default Match;
