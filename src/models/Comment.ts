import mongoose from "mongoose";
import { CommentDocument, CommentModel } from "../types/models/Comment.js";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model<CommentDocument, CommentModel>(
  "Comment",
  commentSchema
);
export default Comment;
