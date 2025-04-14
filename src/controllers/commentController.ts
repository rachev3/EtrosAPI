import Comment from "../models/Comment.js";
import Article from "../models/Article.js";
import APIFeatures from "../utils/apiFeatures.js";
import { Request, Response } from "express";
import { AuthRequest, TypedRequest } from "../types/express/index.js";
import { AppError } from "../middleware/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { IComment, CommentDocument } from "../types/models/Comment.js";
import { ObjectId } from "../types/index.js";

// Interface for comment creation/update request body
interface CommentCreateRequestBody {
  content: string;
  articleId: string;
}

interface CommentUpdateRequestBody {
  content: string;
}

// **1️⃣ Get All Comments**
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  // Create a new APIFeatures instance with filtering and sorting
  const features = new APIFeatures(Comment.find(), req.query).filter().sort();

  // Apply pagination
  await features.paginate();

  // Apply population if requested
  features.populate();

  const comments = await features.query;

  res.status(200).json({
    success: true,
    count: comments.length,
    pagination: features.paginationData,
    data: comments,
  });
});

// **2️⃣ Get Comments for a Specific Article**
export const getArticleComments = asyncHandler(
  async (req: Request<{ articleId: string }>, res: Response) => {
    const { articleId } = req.params;

    // Validate article exists
    const article = await Article.findById(articleId);
    if (!article) {
      throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
    }

    // Create a new APIFeatures instance with filtering and sorting
    const features = new APIFeatures(
      Comment.find({ article: articleId }),
      req.query
    )
      .filter()
      .sort();

    // Apply pagination
    await features.paginate();

    // Apply population for author
    features.populate();

    const comments = await features.query;

    res.status(200).json({
      success: true,
      count: comments.length,
      pagination: features.paginationData,
      data: comments,
    });
  }
);

// **3️⃣ Get Comments by a Specific User**
export const getUserComments = asyncHandler(
  async (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;

    // Create a new APIFeatures instance with filtering and sorting
    const features = new APIFeatures(
      Comment.find({ author: userId }),
      req.query
    )
      .filter()
      .sort();

    // Apply pagination
    await features.paginate();

    // Apply population for article
    features.populate();

    const comments = await features.query;

    res.status(200).json({
      success: true,
      count: comments.length,
      pagination: features.paginationData,
      data: comments,
    });
  }
);

// **4️⃣ Create a New Comment (Requires Authentication)**
export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { content, articleId } = req.body as CommentCreateRequestBody;

    if (!req.user) {
      throw new AppError(
        "You must be logged in to comment",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    // Validate article exists
    const article = await Article.findById(articleId);
    if (!article) {
      throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
    }

    // Create the comment data
    const commentData: IComment = {
      content,
      author: req.user._id.toString(),
      article: articleId,
      isVisible: true,
    };

    // Create the comment
    const comment = await Comment.create(commentData);

    // Populate the author
    await comment.populate("author", "username");

    res.status(201).json({
      success: true,
      data: comment,
    });
  }
);

// **5️⃣ Update a Comment (Only by the Author)**
export const updateComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const { content } = req.body as CommentUpdateRequestBody;

    if (!req.user) {
      throw new AppError(
        "You must be logged in to update a comment",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    // Find the comment
    const comment = await Comment.findById(id);

    // Check if comment exists
    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      throw new AppError(
        "You can only update your own comments",
        403,
        "NOT_COMMENT_OWNER"
      );
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
    ).populate("author", "username");

    res.status(200).json({
      success: true,
      data: updatedComment,
    });
  }
);

// **6️⃣ Delete a Comment (Only by the Author)**
export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id;

    if (!req.user) {
      throw new AppError(
        "You must be logged in to delete a comment",
        401,
        "AUTHENTICATION_REQUIRED"
      );
    }

    // Find the comment
    const comment = await Comment.findById(id);

    // Check if comment exists
    if (!comment) {
      throw new AppError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      throw new AppError(
        "You can only delete your own comments",
        403,
        "NOT_COMMENT_OWNER"
      );
    }

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {
        message: "Comment deleted successfully",
      },
    });
  }
);
