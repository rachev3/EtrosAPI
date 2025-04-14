import mongoose from "mongoose";
import {
  PlayerDocument,
  PlayerModel,
  PlayerPosition,
} from "../types/models/Player.js";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    bornYear: {
      type: Number,
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
      ] as PlayerPosition[],
    },
    height: {
      type: String,
      required: false,
    },
    weight: {
      type: Number,
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
  { timestamps: true }
);

const Player = mongoose.model<PlayerDocument, PlayerModel>(
  "Player",
  playerSchema
);

export default Player;
