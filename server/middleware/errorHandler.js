// ===========================================
// CUSTOM ERROR HANDLER MIDDLEWARE
// ===========================================
// WHY?
// Without this, when an error happens, Express sends ugly HTML error pages.
// This middleware sends clean JSON responses that our React frontend can understand.
// ===========================================

// Custom error class that includes a status code
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error class
    this.statusCode = statusCode;
    this.isOperational = true; // Helps us distinguish "expected" errors from bugs

    // This removes this constructor from the stack trace (cleaner error logs)
    Error.captureStackTrace(this, this.constructor);
  }
}

// The actual error-handling middleware
// WHY 4 parameters? Express recognizes a middleware with 4 params as an error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific MongoDB/Mongoose errors
  // ----------------------------------------

  // 1. Invalid MongoDB ObjectId (e.g., wrong product ID format in URL)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // 2. Duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists`;
    statusCode = 400;
  }

  // 3. Validation error (e.g., required field missing)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
    statusCode = 400;
  }

  // 4. JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your session has expired. Please log in again.';
    statusCode = 401;
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    // Only show error stack in development (helps debugging)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
