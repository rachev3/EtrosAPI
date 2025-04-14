import { BaseDocument, ObjectId } from "../index.js";
import { Model } from "mongoose";

export interface IComment {
  content: string;
  author: ObjectId | string;
  article: ObjectId | string;
  isVisible: boolean;
}

export interface CommentDocument extends BaseDocument, IComment {}

export interface CommentModel extends Model<CommentDocument> {}
