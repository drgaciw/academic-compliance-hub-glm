# @aah/trpc

tRPC API layer with Next.js App Router integration.

## Features

- Type-safe API endpoints with tRPC v11
- Authentication middleware using @aah/auth
- Role-based access control
- Centralized error handling and logging
- Zod validation for all procedures
- Superjson for data serialization

## Installation

```bash
pnpm add @aah/trpc
```

## Usage

### Server Setup

```typescript
// app/api/trpc/[trpc]/route.ts
import { tRPCHandler } from "@aah/trpc";

export { GET, POST } from "@aah/trpc/handler";
```

### Client Setup

```typescript
// utils/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@aah/trpc";

export const trpc = createTRPCReact<AppRouter>();
```

## Procedures

### Advising

- `advising.getCourseRecommendations` - Get course recommendations for a student
- `advising.getAdvisor` - Get advisor information

### Compliance

- `compliance.evaluateCompliance` - Evaluate student compliance
- `compliance.getComplianceStatus` - Get compliance status for a student

## Middleware

The tRPC package includes several middleware:

- `isAuthed` - Require authentication
- `hasRole` - Require specific role
- `loggingMiddleware` - Log tRPC calls
- `errorHandlerMiddleware` - Centralized error handling
- `validationErrorHandler` - Handle validation errors

## Validation

All procedures use Zod for input validation. Common validation schemas are exported from `./validation`.

## Logging

Logging is handled by the `TRPCLogger` class. Configure logging via environment variables:

- `NODE_ENV` - Development enables debug logging
- Custom logger configuration can be passed to `TRPCLogger` constructor
