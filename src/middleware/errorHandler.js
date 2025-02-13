const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`); // Log error for debugging

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 if no status
  let message = err.message || "Server Error";

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Mongoose Cast Errors (Invalid ObjectId)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({ message });
};

export default errorHandler;
