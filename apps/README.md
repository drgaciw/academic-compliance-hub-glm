# Apps Directory

This directory contains all frontend applications for the Athletic Academics Hub (AAH).

## Applications

### [@aah/main](./main/)
Main web application serving as the primary interface for all user types.

### [@aah/student](./student/)
Student portal for athlete-specific features and academic tracking.

### [@aah/admin](./admin/)
Admin dashboard for system administration and configuration.

## Development

All applications are built with Next.js 14 and share common packages from the `packages/` directory.

```bash
# Run all apps in development
pnpm dev

# Run specific app
pnpm dev:main
pnpm dev:student
pnpm dev:admin

# Build all apps
pnpm build

# Build specific app
pnpm build:main
pnpm build:student
pnpm build:admin
```

## Architecture

- Each app is a standalone Next.js application
- Shared UI components via `@aah/ui`
- Shared authentication via `@aah/auth`
- Shared database client via `@aah/database`
- Shared utilities via `@aah/api-utils`
