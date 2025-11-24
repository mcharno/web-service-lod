const request = require('supertest');
const app = require('../app');

describe('Linked Data Web Service', () => {
  describe('GET /', () => {
    it('should return service information', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/v1/docs', () => {
    it('should return API documentation', async () => {
      const res = await request(app).get('/api/v1/docs');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('endpoints');
      expect(res.body.endpoints).toHaveProperty('dbpedia');
      expect(res.body.endpoints).toHaveProperty('geonames');
      expect(res.body.endpoints).toHaveProperty('loc');
      expect(res.body.endpoints).toHaveProperty('os');
      expect(res.body.endpoints).toHaveProperty('heritage');
    });
  });

  describe('DBPedia Endpoints', () => {
    it('should handle lookup term request', async () => {
      const res = await request(app).get('/api/v1/dbpedia/lookup/test');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('term', 'test');
    });

    it('should handle organization lookup request', async () => {
      const res = await request(app).get('/api/v1/dbpedia/organization/nasa');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('organization', 'nasa');
    });

    it('should handle term with spaces', async () => {
      const res = await request(app).get('/api/v1/dbpedia/lookup/albert%20einstein');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('term', 'albert einstein');
    });
  });

  describe('Geonames Endpoints', () => {
    it('should handle search request with query', async () => {
      const res = await request(app).get('/api/v1/geonames/search?q=london');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('query', 'london');
    });

    it('should return 400 without query parameter', async () => {
      const res = await request(app).get('/api/v1/geonames/search');
      expect(res.statusCode).toBe(400);
    });

    it('should handle precise lookup', async () => {
      const res = await request(app).get('/api/v1/geonames/precise/london');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('location', 'london');
    });

    it('should handle fuzzy lookup', async () => {
      const res = await request(app).get('/api/v1/geonames/fuzzy/london');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('location', 'london');
    });
  });

  describe('Library of Congress Endpoints', () => {
    it('should handle search with default type', async () => {
      const res = await request(app).get('/api/v1/loc/search?q=history');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('query', 'history');
      expect(res.body).toHaveProperty('searchType', 'exact');
    });

    it('should handle search with custom type', async () => {
      const res = await request(app).get('/api/v1/loc/search?q=history&type=fuzzy');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('searchType', 'fuzzy');
    });

    it('should handle exact lookup', async () => {
      const res = await request(app).get('/api/v1/loc/exact/history');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('term', 'history');
    });
  });

  describe('Ordnance Survey Endpoints', () => {
    it('should handle precise lookup', async () => {
      const res = await request(app).get('/api/v1/os/precise/oxford');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('location', 'oxford');
    });

    it('should handle fuzzy lookup', async () => {
      const res = await request(app).get('/api/v1/os/fuzzy/oxford');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('location', 'oxford');
    });
  });

  describe('Heritage Endpoints', () => {
    it('should handle Nomisma query', async () => {
      const res = await request(app).get('/api/v1/heritage/nomisma/coin');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('term', 'coin');
    });

    it('should handle FISH query', async () => {
      const res = await request(app).get('/api/v1/heritage/fish/pottery');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('term', 'pottery');
    });

    it('should handle Getty AAT query', async () => {
      const res = await request(app).get('/api/v1/heritage/getty/sculpture');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('term', 'sculpture');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });
});
