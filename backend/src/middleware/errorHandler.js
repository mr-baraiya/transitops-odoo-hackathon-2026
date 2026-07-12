const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message}\n${err.stack}`);

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry — a record with this value already exists',
      error: process.env.NODE_ENV === 'development' ? err.detail : undefined,
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist',
      error: process.env.NODE_ENV === 'development' ? err.detail : undefined,
    });
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Value violates a constraint',
      error: process.env.NODE_ENV === 'development' ? err.detail : undefined,
    });
  }

  // PostgreSQL RAISE EXCEPTION (from triggers)
  if (err.code === 'P0001') {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Joi / validation error
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details.map((d) => d.message),
    });
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
