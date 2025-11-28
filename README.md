# Linked Data Web Service

A modern RESTful web service built with Node.js and Express that provides access to multiple linked data sources including DBPedia, Geonames, Library of Congress, Ordnance Survey, and various archaeological/heritage databases.

## Features

- **RESTful API** - Clean, intuitive endpoints for all linked data sources
- **Multiple Data Sources** - Query DBPedia, Geonames, Library of Congress, Ordnance Survey, and heritage databases
- **Input Validation** - Robust request validation using express-validator
- **Error Handling** - Comprehensive error handling middleware
- **Security** - Built-in security headers with Helmet.js
- **CORS Enabled** - Cross-origin resource sharing support
- **Logging** - HTTP request logging with Morgan
- **Docker Ready** - Containerization support included
- **Modern Stack** - Node.js 18+, Express 4.x

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 3.0.0
- Geonames username (required for Geonames API - register at https://www.geonames.org/login)
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-service-lod
```

2. Install dependencies:
```bash
yarn install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` and configure your settings:
```env
PORT=3000
NODE_ENV=development
GEONAMES_USERNAME=your_username_here
```

## Usage

### Local Development (Direct)

Run the service directly on your machine:

```bash
# Development mode with auto-reload
yarn dev

# Production mode
yarn start

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix
```

The service will start on `http://localhost:3000` (or the PORT specified in your .env file).

### Local Development (Docker)

Run the service in a Docker container with live reload:

```bash
# Start the development container
docker-compose -f docker-compose.dev.yml up

# Stop the development container
docker-compose -f docker-compose.dev.yml down

# Rebuild and start (after dependency changes)
docker-compose -f docker-compose.dev.yml up --build
```

The containerized service will be available at `http://localhost:3000`.

**Benefits of Docker development:**
- Consistent environment across team members
- No need to install Node.js/Yarn locally
- Isolated from your system dependencies
- Easy cleanup (`docker-compose down`)

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Documentation Endpoint
```
GET /api/v1/docs
```
Returns complete API documentation with all available endpoints.

### DBPedia Endpoints

#### Lookup Entity
```
GET /api/v1/dbpedia/lookup/:term
```
Look up DBPedia entities by search term.

**Example:**
```bash
curl http://localhost:3000/api/v1/dbpedia/lookup/einstein
```

#### Lookup Organization
```
GET /api/v1/dbpedia/organization/:name
```
Look up organizations in DBPedia.

**Example:**
```bash
curl http://localhost:3000/api/v1/dbpedia/organization/nasa
```

### Geonames Endpoints

#### Search Locations
```
GET /api/v1/geonames/search?q=<query>&country=<code>&continent=<code>&fuzzy=<boolean>
```

**Query Parameters:**
- `q` (required) - Search query
- `country` (optional) - ISO country code filter
- `continent` (optional) - Continent code filter
- `fuzzy` (optional) - Enable fuzzy matching (default: false)

**Example:**
```bash
curl "http://localhost:3000/api/v1/geonames/search?q=london&country=GB"
```

#### Precise Lookup
```
GET /api/v1/geonames/precise/:location
```

#### Fuzzy Lookup
```
GET /api/v1/geonames/fuzzy/:location
```

### Library of Congress Endpoints

#### Search Subject Headings
```
GET /api/v1/loc/search?q=<term>&type=<exact|prefix|fuzzy>
```

**Query Parameters:**
- `q` (required) - Search term
- `type` (optional) - Search type: exact, prefix, or fuzzy (default: exact)

#### Exact Lookup
```
GET /api/v1/loc/exact/:term
```

#### Prefix Lookup
```
GET /api/v1/loc/prefix/:term
```

#### Fuzzy Lookup
```
GET /api/v1/loc/fuzzy/:term
```

### Ordnance Survey Endpoints

#### Precise UK Location Lookup
```
GET /api/v1/os/precise/:location
```

#### Fuzzy UK Location Lookup
```
GET /api/v1/os/fuzzy/:location
```

### Heritage & Archaeological Data Endpoints

#### Nomisma (Numismatic Data)
```
GET /api/v1/heritage/nomisma/:term
```

#### Heritage Data UK (FISH Vocabularies)
```
GET /api/v1/heritage/fish/:term
```

#### Getty AAT (Art & Architecture Thesaurus)
```
GET /api/v1/heritage/getty/:term
```

#### Archaeology Data Service
```
GET /api/v1/heritage/ads/:term
```

#### NFDI4Objects (Archaeological Knowledge Graph)
```
GET /api/v1/heritage/nfdi4objects/:term
```

#### PeriodO (Period Definitions)
```
GET /api/v1/heritage/periodo/:term
```

## Health Check

```
GET /health
```

Returns service health status, timestamp, and uptime.

## Docker Support

### Production Deployment

Build and run the production container:

```bash
# Build the production image
docker build -t linked-data-service .

# Run the production container
docker run -p 3000:3000 --env-file .env linked-data-service

# Or use Docker Compose for production
docker-compose up

# Run in detached mode
docker-compose up -d

# Stop the production container
docker-compose down
```

### Development vs Production Containers

- **Development** (`docker-compose.dev.yml`):
  - Uses `Dockerfile.dev`
  - Includes all dev dependencies
  - Enables hot reload with nodemon
  - Mounts source code for live updates
  - Debug logging enabled

- **Production** (`docker-compose.yml`):
  - Uses production `Dockerfile`
  - Production dependencies only
  - Optimized image size
  - No volume mounts
  - Info-level logging

## Project Structure

```
.
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/          # Route definitions
│   ├── middleware/      # Custom middleware
│   ├── app.js          # Express application setup
│   └── server.js       # Server entry point
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── package.json       # Project dependencies
└── README.md         # This file
```

## Integration with linked-data-toolkit

This service is designed to work with the [linked-data-toolkit](https://github.com/mcharno/linked-data-toolkit) library. Once the toolkit is available as a package, you can integrate it by:

1. Installing the package:
```bash
yarn add linked-data-toolkit
```

2. Update the controllers to use the actual clients instead of placeholder responses. Each controller has TODO comments indicating where to add the integration code.

Example integration in `src/controllers/dbpediaController.js`:
```javascript
const { DBPediaClient } = require('linked-data-toolkit');
const dbpediaClient = new DBPediaClient();

exports.lookupTerm = async (req, res, next) => {
  try {
    const { term } = req.params;
    const results = await dbpediaClient.lookup(term);
    res.json(results);
  } catch (error) {
    next(error);
  }
};
```

## Future Enhancements

### Database Integration Options

While not currently implemented, the following database integrations could be added:

1. **PostgreSQL with Sequelize/TypeORM**
   - Cache frequently accessed linked data queries
   - Store user preferences and search history
   - Implement query result caching with TTL

2. **Redis**
   - Cache SPARQL query results for improved performance
   - Implement rate limiting per user/API key
   - Session storage for authenticated users

3. **MongoDB**
   - Store flexible JSON responses from linked data sources
   - Log API usage and analytics
   - Store bookmarked/favorite queries

### Authentication & Security

Future versions could include:
- JWT-based authentication
- API key management
- Rate limiting per user
- OAuth2 integration
- Role-based access control (RBAC)

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2025-11-23T12:00:00.000Z"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on the GitHub repository.
