const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      errors: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = validate;
