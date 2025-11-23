const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const validate = require('../middleware/validator');
const heritageController = require('../controllers/heritageController');

/**
 * @route   GET /api/v1/heritage/nomisma/:term
 * @desc    Query Nomisma numismatic database
 * @access  Public
 */
router.get(
  '/nomisma/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  heritageController.queryNomisma
);

/**
 * @route   GET /api/v1/heritage/fish/:term
 * @desc    Query Heritage Data UK FISH vocabularies
 * @access  Public
 */
router.get(
  '/fish/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  heritageController.queryFISH
);

/**
 * @route   GET /api/v1/heritage/getty/:term
 * @desc    Query Getty AAT (Art & Architecture Thesaurus)
 * @access  Public
 */
router.get(
  '/getty/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  heritageController.queryGettyAAT
);

/**
 * @route   GET /api/v1/heritage/ads/:term
 * @desc    Query Archaeology Data Service
 * @access  Public
 */
router.get(
  '/ads/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  heritageController.queryADS
);

/**
 * @route   GET /api/v1/heritage/nfdi4objects/:term
 * @desc    Query NFDI4Objects archaeological knowledge graph
 * @access  Public
 */
router.get(
  '/nfdi4objects/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  heritageController.queryNFDI4Objects
);

/**
 * @route   GET /api/v1/heritage/periodo/:term
 * @desc    Query PeriodO period definitions
 * @access  Public
 */
router.get(
  '/periodo/:term',
  [
    param('term').trim().notEmpty().withMessage('Term parameter is required')
  ],
  validate,
  heritageController.queryPeriodO
);

module.exports = router;
