import mongoose from "mongoose";

const matchPdfUploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  matchDate: {
    type: Date,
    required: true,
  },
  opponent: {
    type: String,
    required: true,
  },
  processingStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  errorMessage: {
    type: String,
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for duplicate checking
matchPdfUploadSchema.index({ matchDate: 1, opponent: 1 }, { unique: true });

const MatchPdfUpload = mongoose.model("MatchPdfUpload", matchPdfUploadSchema);

export default MatchPdfUpload;
