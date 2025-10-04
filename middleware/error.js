// middleware/errorHandler.js
const createError = require("http-errors");

function errorHandler(err, req, res, next) {
  console.error(err); // log for debugging

  // If it's a known http-error
  if (createError.isHttpError(err)) {
    return res.status(err.status || 500).json({
      status: err.status,
      message: err.message
    });
  }

  // Handle validation errors (like Mongoose)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 400,
      message: "Validation Error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle Mongo duplicate key (unique email, etc.)
  if (err.code && err.code === 11000) {
    return res.status(409).json({
      status: 409,
      message: "Duplicate key error",
      keyValue: err.keyValue
    });
  }

  // JWT / auth errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: 401,
      message: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 401,
      message: "Token expired"
    });
  }

  // Default (unknown error)
  res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    error: err.message || "Something went wrong"
  });
}

module.exports = errorHandler;
