# @aah/service-support

Tutoring and support microservice for Athletic Academics Hub.

## Overview

This microservice handles tutoring session management and support services.

## Features

- Tutoring session scheduling
- Tutor availability management
- Session history tracking
- Subject-based matching

## API Endpoints

### GET /health
Health check endpoint.

### GET /students/:id/sessions
Get student's tutoring sessions.

### POST /students/:id/sessions
Create a new tutoring session.

### GET /tutors
Get available tutors.

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
