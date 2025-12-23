# @aah/service-monitoring

Performance monitoring microservice for Athletic Academics Hub.

## Overview

This microservice handles system performance monitoring, metrics collection, and logging.

## Features

- System metrics collection (CPU, memory, uptime)
- Performance logging
- Health check endpoints
- Real-time monitoring

## API Endpoints

### GET /health
Health check endpoint.

### GET /metrics
Get system performance metrics.

### GET /logs
Get performance logs.

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Tech Stack

- **Framework**: Hono
- **Database**: Prisma (via @aah/database)
- **Monitoring**: System metrics collection
