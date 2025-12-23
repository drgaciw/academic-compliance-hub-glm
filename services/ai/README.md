# @aah/service-ai

AI and ML microservice for Athletic Academics Hub.

## Overview

This microservice handles AI-powered features including compliance analysis and course recommendations.

## Features

- NCAA compliance analysis
- Academic course recommendations
- Performance insights generation
- AI model management

## API Endpoints

### GET /health
Health check endpoint.

### POST /analyze/compliance
Analyze student's NCAA compliance status.

### POST /recommend/courses
Generate AI-powered course recommendations.

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
- **AI**: Vercel AI SDK
- **Database**: Prisma (via @aah/database)
