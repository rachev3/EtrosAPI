import { BaseDocument } from "../index";
import { Model } from "mongoose";

export interface IArticle {
  title: string;
  content: string;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  images: string[];
}

export interface ArticleDocument extends BaseDocument, IArticle {}

export interface ArticleModel extends Model<ArticleDocument> {}
