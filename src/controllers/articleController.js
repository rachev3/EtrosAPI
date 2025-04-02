import Article from "../models/Article.js";
import APIFeatures from "../utils/apiFeatures.js";

// **1️⃣ Get All Articles**
export const getArticles = async (req, res) => {
  try {
    // Create a new APIFeatures instance with filtering and sorting
    const features = new APIFeatures(Article.find(), req.query).filter().sort();

    // Apply pagination
    await features.paginate();

    // Apply population if requested
    features.populate();

    const articles = await features.query;

    res.status(200).json({
      success: true,
      count: articles.length,
      pagination: features.paginationData,
      data: articles,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **2️⃣ Get a Single Article**
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **3️⃣ Create a New Article (Admin Only)**
export const createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      metaTitle,
      metaDescription,
      metaKeywords,
      images,
    } = req.body;

    // Check if article with same title exists
    const articleExists = await Article.findOne({ title });
    if (articleExists) {
      return res
        .status(400)
        .json({ message: "Article with this title already exists" });
    }

    // Create article with all available fields
    const newArticle = await Article.create({
      title,
      content,
      author: author || "Admin",
      ...(metaTitle && { metaTitle }),
      ...(metaDescription && { metaDescription }),
      ...(metaKeywords && { metaKeywords }),
      ...(images && { images }),
    });

    res.status(201).json({
      success: true,
      data: newArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// **4️⃣ Update an Article (Admin Only)**
export const updateArticle = async (req, res) => {
  try {
    const { title } = req.body;

    // If title is being updated, check for duplicates
    if (title) {
      const existingArticle = await Article.findOne({
        title,
        _id: { $ne: req.params.id },
      });

      if (existingArticle) {
        return res.status(400).json({
          success: false,
          message: "Article with this title already exists",
        });
      }
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// **5️⃣ Delete an Article (Admin Only)**
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
