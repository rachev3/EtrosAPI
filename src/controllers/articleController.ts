import Article from "../models/Article.js";
import APIFeatures from "../utils/apiFeatures.js";
import { Request, Response } from "express";
import {
  TypedRequest,
  ControllerHandler,
  IdParam,
  NextFunction,
} from "../types/express/index.js";
import { AppError } from "../middleware/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { IArticle, ArticleDocument } from "../types/models/Article.js";

// Interface for article creation/update request body
interface ArticleRequestBody {
  title: string;
  content: string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  images?: string[];
}

// **1️⃣ Get All Articles**
export const getArticles: ControllerHandler = asyncHandler(async (req, res) => {
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
});

// **2️⃣ Get a Single Article**
export const getArticle: ControllerHandler<any, IdParam> = asyncHandler(
  async (req, res) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
      throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  }
);

// **3️⃣ Create a New Article (Admin Only)**
export const createArticle: ControllerHandler<ArticleRequestBody> =
  asyncHandler(async (req, res) => {
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
      throw new AppError(
        "Article with this title already exists",
        400,
        "ARTICLE_EXISTS"
      );
    }

    // Prepare article data
    const articleData: IArticle = {
      title,
      content,
      author: author || "Admin",
      metaTitle,
      metaDescription,
      metaKeywords: metaKeywords || [],
      images: images || [],
    };

    // Create article with all available fields
    const newArticle = await Article.create(articleData);

    res.status(201).json({
      success: true,
      data: newArticle,
    });
  });

// **4️⃣ Update an Article (Admin Only)**
export const updateArticle: ControllerHandler<
  Partial<ArticleRequestBody>,
  IdParam
> = asyncHandler(async (req, res) => {
  const { title } = req.body;

  // If title is being updated, check for duplicates
  if (title) {
    const existingArticle = await Article.findOne({
      title,
      _id: { $ne: req.params.id },
    });

    if (existingArticle) {
      throw new AppError(
        "Article with this title already exists",
        400,
        "ARTICLE_EXISTS"
      );
    }
  }

  const updatedArticle = await Article.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedArticle) {
    throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: updatedArticle,
  });
});

// **5️⃣ Delete an Article (Admin Only)**
export const deleteArticle: ControllerHandler<any, IdParam> = asyncHandler(
  async (req, res) => {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Article deleted successfully",
      },
    });
  }
);
