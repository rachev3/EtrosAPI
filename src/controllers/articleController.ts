import Article from "../models/Article";
import APIFeatures from "../utils/apiFeatures";
import { ControllerHandler, IdParam } from "../types/express/index";
import asyncHandler from "../utils/asyncHandler";
import { IArticle } from "../types/models/Article";
import {
  validateRequiredFields,
  validateUnique,
  validateArray,
} from "../utils/validator";
import {
  createArticle as articleServiceCreate,
  updateArticle as articleServiceUpdate,
  deleteArticle as articleServiceDelete,
  getArticle as articleServiceGet,
} from "../services/articleService";

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
    const article = await articleServiceGet(req.params.id);
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
    const articleData: IArticle = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author || "Admin",
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      metaKeywords: req.body.metaKeywords || [],
      images: req.body.images || [],
    };
    const newArticle = await articleServiceCreate(articleData);
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
  const updatedArticle = await articleServiceUpdate(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: updatedArticle,
  });
});

export const deleteArticle: ControllerHandler<any, IdParam> = asyncHandler(
  async (req, res) => {
    await articleServiceDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        message: "Article deleted successfully",
      },
    });
  }
);
