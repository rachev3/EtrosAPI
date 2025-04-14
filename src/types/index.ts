import { Document, Types } from "mongoose";

export type ObjectId = Types.ObjectId;

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_REQUEST"
  | "MISSING_FIELDS"
  | "MISSING_REQUIRED_FIELDS"
  | "USER_EXISTS"
  | "PLAYER_EXISTS"
  | "ARTICLE_EXISTS"
  | "INVALID_CREDENTIALS"
  | "MISSING_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "PLAYER_NOT_FOUND"
  | "PLAYER_STATS_NOT_FOUND"
  | "MATCH_NOT_FOUND"
  | "ARTICLE_NOT_FOUND"
  | "COMMENT_NOT_FOUND"
  | "MISSING_SCORES"
  | "NOT_COMMENT_OWNER"
  | "INVALID_TOKEN"
  | "INVALID_TOKEN_FORMAT"
  | "TOKEN_EXPIRED"
  | "NO_TOKEN"
  | "NO_FILE_UPLOADED"
  | "UPLOAD_FAILED"
  | "FILE_NAME_REQUIRED"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHENTICATION_ERROR"
  | "ADMIN_REQUIRED"
  | "INVALID_EMAIL_FORMAT"
  | "INVALID_USERNAME_FORMAT"
  | "INVALID_PASSWORD_FORMAT"
  | "INVALID_EMAIL_LENGTH"
  | "INVALID_USERNAME_LENGTH"
  | "INVALID_PASSWORD_LENGTH"
  | `INVALID_${string}_FORMAT`
  | `INVALID_${string}_LENGTH`;

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: ErrorCode;
    details?: any;
  };
}
