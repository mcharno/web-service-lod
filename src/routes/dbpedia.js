const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const validate = require('../middleware/validator');
const dbpediaController = require('../controllers/dbpediaController');

/**
 * @route   GET /api/v1/dbpedia/lookup/:term
 * @desc    Look up DBPedia entities by term
 * @access  Public
 */
router.get(
  '/lookup/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  dbpediaController.lookupTerm
);

/**
 * @route   GET /api/v1/dbpedia/organization/:name
 * @desc    Look up organizations in DBPedia
 * @access  Public
 */
router.get(
  '/organization/:name',
  [
    param('name').trim().notEmpty().withMessage('Organization name is required')
  ],
  validate,
  dbpediaController.lookupOrganization
);

module.exports = router;
