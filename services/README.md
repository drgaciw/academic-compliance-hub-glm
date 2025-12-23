# Services Directory

This directory contains all microservices for Athletic Academics Hub (AAH) monorepo.

## Services

### [@aah/service-user](./user/)
User management microservice.

### [@aah/service-advising](./advising/)
Course advising microservice.

### [@aah/service-compliance](./compliance/)
NCAA compliance microservice.

### [@aah/service-monitoring](./monitoring/)
Performance monitoring microservice.

### [@aah/service-support](./support/)
Tutoring and support microservice.

### [@aah/service-integration](./integration/)
External integrations microservice.

### [@aah/service-ai](./ai/)
AI and ML microservice.

## Architecture

All services are built with:
- **Hono** - Fast, lightweight web framework
- **TypeScript** - Type-safe development
- **Zod** - Runtime type validation
- **Prisma** - Database access (via @aah/database)

## Development

```bash
# Install all dependencies
pnpm install

# Run all services in development
pnpm -r dev

# Build all services
pnpm -r build

# Run type checking on all services
pnpm -r type-check

# Run linting on all services
pnpm -r lint
```

## Deployment

Each service can be deployed independently to Vercel, AWS Lambda, or other serverless platforms.

## Health Checks

All services expose a `/health` endpoint for monitoring and load balancer health checks.
