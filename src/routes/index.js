const express = require('express');
const router = express.Router();

const dbpediaRoutes = require('./dbpedia');
const geonamesRoutes = require('./geonames');
const locRoutes = require('./loc');
const osRoutes = require('./os');
const heritageRoutes = require('./heritage');

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    title: 'Linked Data Web Service API',
    version: '1.0.0',
    description: 'RESTful API for querying various linked data sources',
    endpoints: {
      dbpedia: {
        description: 'Query DBPedia for organizations and entities',
        routes: {
          'GET /dbpedia/lookup/:term': 'Look up entities by term',
          'GET /dbpedia/organization/:name': 'Look up organizations'
        }
      },
      geonames: {
        description: 'Query Geonames for geographic locations',
        routes: {
          'GET /geonames/search': 'Search locations (query params: q, country, continent, fuzzy)',
          'GET /geonames/precise/:location': 'Precise location lookup',
          'GET /geonames/fuzzy/:location': 'Fuzzy location lookup'
        }
      },
      loc: {
        description: 'Query Library of Congress subject headings',
        routes: {
          'GET /loc/search': 'Search subject headings (query params: q, type=exact|prefix|fuzzy)',
          'GET /loc/exact/:term': 'Exact subject heading lookup',
          'GET /loc/prefix/:term': 'Prefix-based lookup',
          'GET /loc/fuzzy/:term': 'Fuzzy lookup'
        }
      },
      os: {
        description: 'Query Ordnance Survey UK locations',
        routes: {
          'GET /os/precise/:location': 'Precise UK location lookup',
          'GET /os/fuzzy/:location': 'Fuzzy UK location lookup'
        }
      },
      heritage: {
        description: 'Query archaeological and heritage data sources',
        routes: {
          'GET /heritage/nomisma/:term': 'Nomisma numismatic data',
          'GET /heritage/fish/:term': 'Heritage Data UK FISH vocabularies',
          'GET /heritage/getty/:term': 'Getty AAT Art & Architecture Thesaurus',
          'GET /heritage/ads/:term': 'Archaeology Data Service',
          'GET /heritage/nfdi4objects/:term': 'NFDI4Objects archaeological data',
          'GET /heritage/periodo/:term': 'PeriodO period definitions'
        }
      }
    }
  });
});

// Mount route modules
router.use('/dbpedia', dbpediaRoutes);
router.use('/geonames', geonamesRoutes);
router.use('/loc', locRoutes);
router.use('/os', osRoutes);
router.use('/heritage', heritageRoutes);

module.exports = router;
