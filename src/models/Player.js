import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      enum: ["Guard", "Forward", "Center"], // Restricts to these values
    },
    height: {
      type: String, // Example: "6'5" (6 feet 5 inches)
      required: false,
    },
    weight: {
      type: Number, // Example: 220 (220 lbs)
      required: false,
    },
    stats: {
      points: { type: Number, default: 0 },
      rebounds: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
    },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
