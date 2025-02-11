# Points Tracking Service

A RESTful service built with NestJS that manages user points transactions and balances with specific spending rules.

## System Requirements

The service maintains user point balances with the following rules:

- Points are tracked per payer
- When spending points:
  1. Oldest points (by transaction date) are spent first
  2. No payer's points can go negative
- Each transaction includes payer (string), points (integer), and timestamp (date)

## Features

- Add transaction records for specific payers and dates
- Spend points following the specified rules
- Get point balances for all payers
- In-memory data storage
- Test coverage
- API documentation
- Docker support

## Prerequisites

Before running this service, ensure you have:

1. **Node.js** (version 16 or higher)

   - Download from: https://nodejs.org/
   - Verify with: `node --version`

2. **pnpm** (Package Manager)

   - Install: `npm install -g pnpm`
   - Verify with: `pnpm --version`

3. **Docker** (Optional, for containerized deployment)
   - Download from: https://www.docker.com/products/docker-desktop
   - Verify with: `docker --version`

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd points-tracking-service
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the service**

   ```bash
   # Development mode
   pnpm run start:dev

   # Production mode
   pnpm run start:prod
   ```

4. **Access the API documentation**
   - Open `http://localhost:3000/api-docs` in your browser

## API Endpoints

### 1. Add bulk transactions

```http
POST /api/v1/points/transactions

Request:
[{
    "payer": "SHOPIFY",
    "points": 1000,
    "timestamp": "2024-07-02T14:00:00Z"
}]

Response:
[{
    "id": "uuid",
    "payer": "SHOPIFY",
    "points": 1000,
    "timestamp": "2024-07-02T14:00:00Z"
}]
```

### 2. Spend Points

```http
POST /api/v1/points/spend

Request:
{
    "points": 5000
}

Response:
[
    { "payer": "SHOPIFY", "points": -100 },
    { "payer": "EBAY", "points": -200 },
    { "payer": "AMAZON", "points": -4700 }
]
```

### 3. Get Balances

```http
GET /api/v1/points/balances

Response:
{
    "SHOPIFY": 1000,
    "EBAY": 0,
    "AMAZON": 5300
}
```

## Example Usage

1. **Add bulk transactions:**

   ```bash
   curl -X POST http://localhost:3000/api/v1/points/transactions \
   -H "Content-Type: application/json" \
   -d '[{
       "payer": "SHOPIFY",
       "points": 1000,
       "timestamp": "2024-07-02T14:00:00Z"
   }]'
   ```

2. **Spend points:**

   ```bash
   curl -X POST http://localhost:3000/api/v1/points/spend \
   -H "Content-Type: application/json" \
   -d '{
       "points": 5000
   }'
   ```

3. **Check balances:**
   ```bash
   curl http://localhost:3000/api/v1/points/balances
   ```

## Project Structure

```
src/
│   app.module.ts
│   main.ts
│
├───common
│   ├───constants
│   │       api-tags.ts
│   │       env-enum.ts
│   │       error-messages.ts
│   │       index.ts
│   │
│   ├───filters
│   │       http.exception.filter.ts
│   │       index.ts
│   │
│   ├───interceptor
│   │       index.ts
│   │
│   ├───interfaces
│   │       base-entity.interface.ts
│   │       generic-repository.interface.ts
│   │       index.ts
│   │
│   ├───logger
│   │       index.ts
│   │       winston.config.ts
│   │
│   └───middleware
│       │   index.ts
│       │   route-logger.middleware.ts
│       │
│       └───types
│               index.ts
│
├───config
│       app-config.type.ts
│       app.config.ts
│       config.interface.ts
│       index.ts
│
├───libs
│   └───utils
│           browser-info-parser.util.ts
│           index.ts
│           logger-formatter.util.ts
│           sort-by-timestamp.util.ts
│           validate-config.util.ts
│
└───modules
    ├───points
    │   │   points.controller.ts
    │   │   points.module.ts
    │   │   points.service.spec.ts
    │   │   points.service.ts
    │   │
    │   ├───constants
    │   │       index.ts
    │   │
    │   ├───dto
    │   │   │   index.ts
    │   │   │
    │   │   ├───request
    │   │   │       add-transaction.dto.ts
    │   │   │       index.ts
    │   │   │       spend-points.dto.ts
    │   │   │
    │   │   └───response
    │   │           index.ts
    │   │           spend-points-response.dto.ts
    │   │
    │   ├───interfaces
    │   │       index.ts
    │   │       points-repository.interface.ts
    │   │       transaction-entity.interface.ts
    │   │
    │   ├───repositories
    │   │       index.ts
    │   │       points.repository.ts
    │   │
    │   └───types
    │           balance.type.ts
    │           index.ts
    │
    └───user
            user.module.ts
            user.service.spec.ts
            user.service.ts
```

## Available Scripts

```bash
# Installation
pnpm install

# Development
pnpm run start        # Start the application
pnpm run start:dev    # Start with auto-reload
pnpm run start:debug  # Start with debugging

# Testing
pnpm run test         # Run unit tests
pnpm run test:e2e     # Run end-to-end tests
pnpm run test:cov     # Generate test coverage

# Production
pnpm run start:prod   # Start in production mode

# Docker
pnpm run docker:dev   # Run with Docker in development mode
pnpm run docker:prod  # Run with Docker in production mode
```

## Running with Docker

1. **Build and run for development:**

   ```bash
   pnpm run docker:dev:build
   ```

2. **Build and run for production:**
   ```bash
   pnpm run docker:prod:build
   ```

## Testing

1. **Run unit tests:**

   ```bash
   pnpm run test
   ```

2. **Run e2e tests:**

   ```bash
   pnpm run test:e2e
   ```

3. **Generate coverage report:**
   ```bash
   pnpm run test:cov
   ```

## Error Handling

The service returns standardized error responses:

```json
{
  "statusCode": <status code>,
  "timestamp": <timestamp - ISO format>,
  "path": <url path>,
  "message": <server error message>,
}
```

Common status codes:

- 400: Bad Request
- 500: Internal Server Error

## License

[MIT License](LICENSE)
