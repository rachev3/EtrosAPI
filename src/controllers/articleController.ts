import Article from "../models/Article";
import APIFeatures from "../utils/apiFeatures";
import { ControllerHandler, IdParam } from "../types/express/index";
import { AppError } from "../middleware/errorHandler";
import asyncHandler from "../utils/asyncHandler";
import { IArticle } from "../types/models/Article";
import {
  validateRequiredFields,
  validateUnique,
  validateArray,
} from "../utils/validator";

interface ArticleRequestBody {
  title: string;
  content: string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  images?: string[];
}

export const getArticles: ControllerHandler = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Article.find(), req.query).filter().sort();

  await features.paginate();

  features.populate();

  const articles = await features.query;

  res.status(200).json({
    success: true,
    count: articles.length,
    pagination: features.paginationData,
    data: articles,
  });
});

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

export const createArticle: ControllerHandler<ArticleRequestBody> =
  asyncHandler(async (req, res) => {
    validateRequiredFields(req.body, ["title", "content"]);
    await validateUnique(Article, "title", req.body.title, "title");
    if (req.body.metaKeywords) {
      validateArray(req.body.metaKeywords, 0, 50, "metaKeywords");
    }
    if (req.body.images) {
      validateArray(req.body.images, 0, 20, "images");
    }

    const {
      title,
      content,
      author,
      metaTitle,
      metaDescription,
      metaKeywords,
      images,
    } = req.body;

    const articleExists = await Article.findOne({ title });
    if (articleExists) {
      throw new AppError(
        "Article with this title already exists",
        400,
        "ARTICLE_EXISTS"
      );
    }

    const articleData: IArticle = {
      title,
      content,
      author: author || "Admin",
      metaTitle,
      metaDescription,
      metaKeywords: metaKeywords || [],
      images: images || [],
    };

    const newArticle = await Article.create(articleData);

    res.status(201).json({
      success: true,
      data: newArticle,
    });
  });

export const updateArticle: ControllerHandler<
  Partial<ArticleRequestBody>,
  IdParam
> = asyncHandler(async (req, res) => {
  if (req.body.title) {
    await validateUnique(Article, "title", req.body.title, "title");
  }
  if (req.body.metaKeywords) {
    validateArray(req.body.metaKeywords, 0, 50, "metaKeywords");
  }
  if (req.body.images) {
    validateArray(req.body.images, 0, 20, "images");
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
