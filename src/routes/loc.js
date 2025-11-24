const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const validate = require('../middleware/validator');
const locController = require('../controllers/locController');

/**
 * @route   GET /api/v1/loc/search
 * @desc    Search Library of Congress subject headings
 * @query   q - search term (required)
 * @query   type - search type: exact, prefix, or fuzzy (optional, default: exact)
 * @access  Public
 */
router.get(
  '/search',
  [
    query('q').trim().notEmpty().withMessage('Search query (q) is required'),
    query('type').optional().isIn(['exact', 'prefix', 'fuzzy']).withMessage('Type must be exact, prefix, or fuzzy')
  ],
  validate,
  locController.search
);

/**
 * @route   GET /api/v1/loc/exact/:term
 * @desc    Exact subject heading lookup
 * @access  Public
 */
router.get(
  '/exact/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  locController.exactLookup
);

/**
 * @route   GET /api/v1/loc/prefix/:term
 * @desc    Prefix-based subject heading lookup
 * @access  Public
 */
router.get(
  '/prefix/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  locController.prefixLookup
);

/**
 * @route   GET /api/v1/loc/fuzzy/:term
 * @desc    Fuzzy subject heading lookup
 * @access  Public
 */
router.get(
  '/fuzzy/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  locController.fuzzyLookup
);

module.exports = router;
