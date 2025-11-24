const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const validate = require('../middleware/validator');
const geonamesController = require('../controllers/geonamesController');

/**
 * @route   GET /api/v1/geonames/search
 * @desc    Search for geographic locations
 * @query   q - search query (required)
 * @query   country - filter by country code (optional)
 * @query   continent - filter by continent code (optional)
 * @query   fuzzy - enable fuzzy matching (optional, default: false)
 * @access  Public
 */
router.get(
  '/search',
  [
    query('q').trim().notEmpty().withMessage('Search query (q) is required'),
    query('country').optional().trim(),
    query('continent').optional().trim(),
    query('fuzzy').optional().isBoolean().toBoolean()
  ],
  validate,
  geonamesController.search
);

/**
 * @route   GET /api/v1/geonames/precise/:location
 * @desc    Precise location lookup
 * @access  Public
 */
router.get(
  '/precise/:location',
  [
    param('location').trim().notEmpty().withMessage('Location parameter is required')
  ],
  validate,
  geonamesController.preciseLookup
);

/**
 * @route   GET /api/v1/geonames/fuzzy/:location
 * @desc    Fuzzy location lookup
 * @access  Public
 */
router.get(
  '/fuzzy/:location',
  [
    param('location').trim().notEmpty().withMessage('Location parameter is required')
  ],
  validate,
  geonamesController.fuzzyLookup
);

module.exports = router;
