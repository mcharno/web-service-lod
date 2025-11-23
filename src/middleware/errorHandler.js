/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors,
      timestamp: new Date().toISOString()
    });
  }

  // Handle linked data errors (when toolkit is integrated)
  if (err.name === 'LinkedDataError') {
    return res.status(err.statusCode || 500).json({
      error: 'Linked Data Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
