import { Request, Response, NextFunction } from "express";
import { ErrorCode } from "../types/index.js";

// Custom error type for Mongoose errors
interface MongooseError extends Error {
  code?: number;
  errors?: Record<string, { message: string }>;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, any>;
  kind?: string;
  path?: string;
  value?: any;
}

// Custom error type for Multer errors
interface MulterError extends Error {
  code: string;
  field?: string;
}

// Custom error class for application-specific errors
export class AppError extends Error {
  name: string;
  statusCode: number;
  errorCode: ErrorCode;
  details: Record<string, any> | null;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    details: Record<string, any> | null = null
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (
  err: Error | MongooseError | MulterError | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging (consider a more robust logging solution in production)
  console.error(`Error: ${err.stack}`);

  // Default values
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";
  let errorDetails: Record<string, any> | null = null;
  let errorCode: ErrorCode = "INTERNAL_SERVER_ERROR";

  // Handle specific error types

  // Mongoose Validation Errors
  if (err.name === "ValidationError" && "errors" in err) {
    statusCode = 400;
    message = "Validation Failed";
    errorCode = "VALIDATION_ERROR";
    errorDetails = Object.keys(err.errors || {}).reduce(
      (acc: Record<string, string>, key) => {
        if (err.errors && err.errors[key]) {
          acc[key] = err.errors[key].message;
        }
        return acc;
      },
      {}
    );
  }

  // Mongoose Cast Errors (Invalid ObjectId)
  else if (err.name === "CastError" && "kind" in err) {
    if (err.kind === "ObjectId") {
      statusCode = 404;
      message = "Resource not found";
      errorCode = "NOT_FOUND";
      errorDetails = { param: err.path, value: err.value };
    }
  }

  // Mongoose Duplicate Key Error
  else if (
    "code" in err &&
    err.code === 11000 &&
    "keyPattern" in err &&
    "keyValue" in err
  ) {
    statusCode = 409;
    message = "Duplicate field value";
    errorCode = "BAD_REQUEST";
    errorDetails = {
      field: Object.keys(err.keyPattern || {})[0],
      value: err.keyValue,
    };
  }

  // JWT Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    errorCode = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    errorCode = "TOKEN_EXPIRED";
  }

  // Multer errors
  else if ("code" in err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File too large";
      errorCode = "BAD_REQUEST";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      statusCode = 400;
      message = "Unexpected file upload";
      errorCode = "BAD_REQUEST";
    }
  }

  // Custom application errors (can be extended)
  else if (err instanceof AppError) {
    statusCode = err.statusCode || 400;
    message = err.message;
    errorCode = err.errorCode || "BAD_REQUEST";
    errorDetails = err.details || null;
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    errorCode,
    ...(errorDetails && { details: errorDetails }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
