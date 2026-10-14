const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'lod_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ============================================================================
// HTTP Metrics
// ============================================================================

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'lod_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
  registers: [register],
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: 'lod_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active requests gauge
const httpRequestsInProgress = new client.Gauge({
  name: 'lod_http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method'],
  registers: [register],
});

// Response size histogram
const httpResponseSize = new client.Histogram({
  name: 'lod_http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register],
});

// ============================================================================
// Application Metrics
// ============================================================================

// Linked data source queries
const linkedDataQueries = new client.Counter({
  name: 'lod_queries_total',
  help: 'Total number of linked data queries',
  labelNames: ['source', 'endpoint'],
  registers: [register],
});

// External API request duration (DBpedia, Geonames, etc.)
const externalApiDuration = new client.Histogram({
  name: 'lod_external_api_duration_seconds',
  help: 'Duration of external API requests in seconds',
  labelNames: ['source', 'endpoint'],
  buckets: [0.1, 0.25, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// External API errors
const externalApiErrors = new client.Counter({
  name: 'lod_external_api_errors_total',
  help: 'Total number of external API errors',
  labelNames: ['source', 'error_type'],
  registers: [register],
});

// ============================================================================
// Error Metrics
// ============================================================================

// Error counter
const errorsTotal = new client.Counter({
  name: 'lod_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route', 'status_code'],
  registers: [register],
});

// ============================================================================
// Helper Functions
// ============================================================================

// Label by the matched Express route (e.g. "/api/v1/dbpedia/lookup/:term"),
// never by the raw request path. Raw paths are attacker-controlled: scanner
// probes such as /.env.bak created one label value (x histogram buckets x
// status codes) per probed URL and grew Prometheus's series count without bound.
// Requests that match no route (404s) share a single constant label.
function getRoute(req) {
  if (req.route && typeof req.route.path === 'string') {
    return (req.baseUrl || '') + req.route.path;
  }
  return 'unmatched';
}

// ============================================================================
// Metrics Middleware
// ============================================================================

function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  const method = req.method;

  // Increment in-progress requests
  httpRequestsInProgress.inc({ method });

  // Override res.end to capture metrics after response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Restore original end function
    res.end = originalEnd;
    res.end(chunk, encoding);

    // Calculate request duration
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();
    const route = getRoute(req);

    // Decrement in-progress requests
    httpRequestsInProgress.dec({ method });

    // Record metrics
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestTotal.inc({ method, route, status_code: statusCode });

    // Track response size if available
    const contentLength = res.get('Content-Length');
    if (contentLength) {
      httpResponseSize.observe(
        { method, route, status_code: statusCode },
        parseInt(contentLength, 10)
      );
    }

    // Track errors
    if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
      errorsTotal.inc({
        type: statusCode.startsWith('4') ? 'client' : 'server',
        route,
        status_code: statusCode
      });
    }
  };

  next();
}

// ============================================================================
// Metrics Endpoint Handler
// ============================================================================

async function metricsHandler(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
}

// ============================================================================
// Tracking Functions
// ============================================================================

function trackLinkedDataQuery(source, endpoint) {
  linkedDataQueries.inc({ source, endpoint });
}

function trackExternalApiRequest(source, endpoint, duration) {
  externalApiDuration.observe({ source, endpoint }, duration);
}

function trackExternalApiError(source, errorType) {
  externalApiErrors.inc({ source, error_type: errorType });
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  getRoute,
  metricsMiddleware,
  metricsHandler,
  trackLinkedDataQuery,
  trackExternalApiRequest,
  trackExternalApiError,
  register,
};
