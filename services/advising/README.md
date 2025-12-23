# @aah/service-advising

Course advising microservice for Athletic Academics Hub.

## Overview

This microservice handles academic advising operations including course recommendations, academic planning, and degree progress tracking.

## Features

- Academic plan management
- Course recommendations (AI-powered)
- Degree progress tracking
- NCAA credit requirement validation

## API Endpoints

### GET /health
Health check endpoint.

### GET /students/:id/academic-plan
Get student's academic plan.

### GET /students/:id/recommendations
Get AI-powered course recommendations.

### POST /students/:id/academic-plan
Create or update academic plan.

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
