# @aah/service-user

User management microservice for Athletic Academics Hub.

## Overview

This microservice handles user-related operations including profile management, role assignments, and user data.

## Features

- User profile CRUD operations
- Role-based access control
- User authentication integration
- Health check endpoint

## API Endpoints

### GET /health
Health check endpoint.

### GET /users/:id
Get user profile by ID.

### POST /users
Create a new user.

### PUT /users/:id
Update user profile.

### DELETE /users/:id
Delete user account.

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
- **Auth**: Clerk (via @aah/auth)
