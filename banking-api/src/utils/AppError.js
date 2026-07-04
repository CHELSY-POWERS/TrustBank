/**
 * Custom error class used throughout the application for predictable,
 * operational errors (e.g. "insufficient funds", "account not found").
 * Distinguishes expected errors from unexpected programming errors.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
