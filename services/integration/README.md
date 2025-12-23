# @aah/service-integration

External integrations microservice for Athletic Academics Hub.

## Overview

This microservice handles external system integrations including SIS, LMS, and email services.

## Features

- Integration management
- Connection testing
- Data synchronization
- Webhook handling

## API Endpoints

### GET /health
Health check endpoint.

### GET /integrations
Get all configured integrations.

### POST /integrations/:id/test
Test integration connection.

### POST /integrations/:id/sync
Trigger data synchronization.

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
- **Validation**: Zod
- **Database**: Prisma (via @aah/database)
