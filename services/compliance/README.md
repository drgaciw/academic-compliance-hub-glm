# @aah/service-compliance

NCAA compliance microservice for Athletic Academics Hub.

## Overview

This microservice handles NCAA Division I compliance tracking and eligibility checking.

## Features

- Student eligibility tracking
- Compliance record management
- AI-powered compliance analysis
- NCAA requirement validation

## API Endpoints

### GET /health
Health check endpoint.

### GET /students/:id/compliance
Get student's compliance status.

### GET /students/:id/eligibility
Check student's NCAA eligibility.

### POST /students/:id/compliance
Create or update compliance record.

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
- **AI**: Vercel AI SDK (via @aah/ai)
