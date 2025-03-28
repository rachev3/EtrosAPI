const errorHandler = (err, req, res, next) => {
  // Log error for debugging (consider a more robust logging solution in production)
  console.error(`Error: ${err.stack}`);

  // Default values
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";
  let errorDetails = null;
  let errorCode = "UNKNOWN_ERROR";

  // Handle specific error types

  // Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Failed";
    errorCode = "VALIDATION_ERROR";
    errorDetails = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Mongoose Cast Errors (Invalid ObjectId)
  else if (err.name === "CastError") {
    if (err.kind === "ObjectId") {
      statusCode = 404;
      message = "Resource not found";
      errorCode = "RESOURCE_NOT_FOUND";
      errorDetails = { param: err.path, value: err.value };
    }
  }

  // Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value";
    errorCode = "DUPLICATE_VALUE";
    errorDetails = {
      field: Object.keys(err.keyPattern)[0],
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
  else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File too large";
    errorCode = "FILE_TOO_LARGE";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file upload";
    errorCode = "UNEXPECTED_FILE";
  }

  // Custom application errors (can be extended)
  else if (err.name === "AppError") {
    statusCode = err.statusCode || 400;
    message = err.message;
    errorCode = err.errorCode || "APPLICATION_ERROR";
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

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default errorHandler;
