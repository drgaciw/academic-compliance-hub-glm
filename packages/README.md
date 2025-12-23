# Packages Directory

This directory contains all shared packages for the Athletic Academics Hub (AAH) monorepo.

## Packages

### [@aah/auth](./auth/)
Authentication and authorization package using Clerk.

### [@aah/database](./database/)
Prisma database schema and client.

### [@aah/api-utils](./api-utils/)
API utilities and helper functions.

### [@aah/ui](./ui/)
Shared UI components using Shadcn/UI.

### [@aah/ai](./ai/)
AI utilities and agents using Vercel AI SDK.

### [@aah/config](./config/)
Shared configurations for TypeScript, ESLint, and other tools.

## Usage

All packages are workspace dependencies and can be imported using:

```typescript
import { something } from '@aah/package-name';
```

## Development

```bash
# Install all dependencies
pnpm install

# Run type checking on all packages
pnpm -r type-check

# Run linting on all packages
pnpm -r lint
```
