const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics middleware (before routes)
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Prometheus metrics endpoint
app.get('/metrics', metricsHandler);

// API routes
const apiBasePath = process.env.API_BASE_PATH || '/api';
app.use(`${apiBasePath}/v1`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Linked Data Web Service',
    version: '1.0.0',
    description: 'RESTful API for querying linked data sources',
    endpoints: {
      health: '/health',
      api: `${apiBasePath}/v1`,
      documentation: '/api/v1/docs'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
