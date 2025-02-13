import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    opponent: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      enum: ["Home", "Away"], // Restricts values to "Home" or "Away"
      required: true,
    },
    result: {
      type: String,
      enum: ["Win", "Loss", "Pending"], // Match result
      default: "Pending",
    },
    score: {
      type: String, // Example: "89-76"
      required: false,
    },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

const Match = mongoose.model("Match", matchSchema);

export default Match;
