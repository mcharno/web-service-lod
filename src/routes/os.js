const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const validate = require('../middleware/validator');
const osController = require('../controllers/osController');

/**
 * @route   GET /api/v1/os/precise/:location
 * @desc    Precise UK location lookup (Ordnance Survey)
 * @access  Public
 */
router.get(
  '/precise/:location',
  [
    param('location').trim().notEmpty().withMessage('Location parameter is required')
  ],
  validate,
  osController.preciseLookup
);

/**
 * @route   GET /api/v1/os/fuzzy/:location
 * @desc    Fuzzy UK location lookup (Ordnance Survey)
 * @access  Public
 */
router.get(
  '/fuzzy/:location',
  [
    param('location').trim().notEmpty().withMessage('Location parameter is required')
  ],
  validate,
  osController.fuzzyLookup
);

module.exports = router;
