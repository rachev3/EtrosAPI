import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    number: {
      type: String,
      required: true,
    },
    bornYear: {
      type: Number, // Example: 1990
      required: true,
    },
    position: {
      type: [String],
      required: false,
      enum: [
        "PointGuard",
        "ShootingGuard",
        "PowerForward",
        "SmallForward",
        "Center",
      ], // Example: ["PointGuard", "ShootingGuard"]
    },
    height: {
      type: String, // Example: "6'5" (6 feet 5 inches)
      required: false,
    },
    weight: {
      type: Number, // Example: 220 (220 lbs)
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },

    statsHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "PlayerStats" },
    ],
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

const Player = mongoose.model("Player", playerSchema);

export default Player;
