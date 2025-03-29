import Article from "../models/Article.js";
import APIFeatures from "../utils/apiFeatures.js";

// **1️⃣ Get All Articles**
export const getArticles = async (req, res) => {
  try {
    // Create a new APIFeatures instance with filtering and sorting
    const features = new APIFeatures(Article.find(), req.query).filter().sort();

    const articles = await features.query;

    res.status(200).json({
      success: true,
      count: articles.length,
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
    const { title, content, author } = req.body;

    // Check if article with same title exists
    const articleExists = await Article.findOne({ title });
    if (articleExists) {
      return res
        .status(400)
        .json({ message: "Article with this title already exists" });
    }

    const newArticle = await Article.create({
      title,
      content,
      author: author || "Admin",
    });

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// **4️⃣ Update an Article (Admin Only)**
export const updateArticle = async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
