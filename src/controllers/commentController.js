import Comment from "../models/Comment.js";
import Article from "../models/Article.js";
import APIFeatures from "../utils/apiFeatures.js";

// Get all comments (with filtering, sorting, pagination)
export const getComments = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get comments for a specific article
export const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;

    // Validate article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get comments by a specific user
export const getUserComments = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a new comment (requires authentication)
export const createComment = async (req, res) => {
  try {
    const { content, articleId } = req.body;

    // Validate article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Create the comment (userId from authenticated user)
    const comment = await Comment.create({
      content,
      author: req.user.id, // From auth middleware
      article: articleId,
    });

    // Populate the author
    await comment.populate("author", "username");

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a comment (only by the author)
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Find the comment
    let comment = await Comment.findById(id);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own comments",
      });
    }

    // Update the comment
    comment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
    ).populate("author", "username");

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a comment (only by the author)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the comment
    const comment = await Comment.findById(id);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
