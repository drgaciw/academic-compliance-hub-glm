# ADR-003: Turborepo for Monorepo Management

**Status**: Accepted
**Date**: 2025-01-20
**Decision Makers**: Tech Lead, Senior Architect, DevOps Lead
**Technical Story**: https://github.com/your-org/athletic-academics-hub/issues/67

---

## Context

We need to manage a monorepo with:

- Multiple Next.js applications (main, student, admin)
- Shared packages (auth, database, ui, etc.)
- Efficient build system with caching
- Good developer experience
- Scalable CI/CD pipeline

Current constraints:

- Team size will grow
- Need fast builds
- Want to share code across apps
- Already using pnpm for package management
- Deployment to Vercel

## Decision

We selected **Turborepo** as our build system and monorepo manager.

Key features:

- Intelligent caching for faster builds
- Task orchestration and parallelization
- Remote caching for CI/CD
- Excellent TypeScript support
- Works with pnpm workspaces
- Vercel native integration

## Consequences

### Positive

- **Build Performance**: Up to 90% faster builds with caching
- **Developer Experience**: Simple CLI with intuitive commands
- **CI/CD**: Faster builds with remote caching
- **Type Safety**: Type-safe task execution
- **Scalability**: Handles growing project structure
- **Integrations**: Works with Vercel, GitHub Actions
- **Code Sharing**: Easy to share packages between apps

### Negative

- **Learning Curve**: Team needs to learn Turborepo concepts
- **Cache Management**: Occasionally need to clear cache
- **Configuration**: Additional `turbo.json` configuration
- **Binary**: Requires installing Turborepo CLI

### Risks and Mitigations

- **Risk**: Cache invalidation issues
  - **Mitigation**: Clear cache on dependency changes, document cache-clearing procedures

- **Risk**: Complex task dependencies
  - **Mitigation**: Keep task graph simple, document dependencies in comments

- **Risk**: Remote caching costs
  - **Mitigation**: Monitor cache hit rates, optimize cache keys

## Alternatives Considered

### Alternative 1: Nx

- **Description**: Use Nx as monorepo and build system
- **Pros**:
  - Excellent developer tools
  - Smart task scheduling
  - Graph-based dependency management
  - Good integration with many frameworks
- **Cons**:
  - More complex configuration
  - Heavier dependency
  - Steeper learning curve
  - Slower initial setup
- **Rejection Reason**: Overkill for our current needs, simpler solution available

### Alternative 2: Lerna

- **Description**: Use Lerna for package management
- **Pros**:
  - Mature and well-known
  - Simple CLI
  - Good with pnpm
- **Cons**:
  - Less sophisticated caching
  - No built-in task orchestration
  - Requires separate build tool (e.g., webpack)
- **Rejection Reason**: Lacks advanced features we need, Turborepo provides better solution

### Alternative 3: Manual pnpm Workspaces

- **Description**: Use pnpm workspaces without additional tooling
- **Pros**:
  - No additional tool to learn
  - Native pnpm integration
  - Simple setup
- **Cons**:
  - No build caching
  - No task orchestration
  - Slower builds
  - Manual dependency management
- **Rejection Reason**: No build optimization or task management, performance would suffer

## Implementation Details

### Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

### Workspace Configuration

```json
// pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Package Scripts

```json
// Root package.json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.7.2"
  }
}
```

### Task Filtering

```bash
# Build specific app
turbo run build --filter=main-app
turbo run build --filter=student-app

# Build package and dependents
turbo run build --filter=packages/ui

# Build affected packages
turbo run build --filter=[HEAD^1]

# Run tasks in specific packages
turbo run lint --filter=packages/ui --filter=packages/auth
```

### Remote Caching

```json
// Vercel configuration
{
  "build": {
    "env": {
      "TURBO_TOKEN": "@vercel-turbo-token"
    }
  }
}
```

```bash
# Local cache
# Automatically managed in .turbo/cache

# Remote cache (Vercel)
# Shared across team and CI/CD
# Stored in Vercel
```

### CI/CD Integration

```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8.15.0

      - name: Install dependencies
        run: pnpm install

      - name: Run Turborepo
        run: pnpm build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
```

## Best Practices

- Use task filtering to build only what's needed
- Clear cache when experiencing weird issues (`rm -rf .turbo`)
- Use remote caching for CI/CD to speed up builds
- Keep task dependencies simple and linear
- Document complex task dependencies in comments
- Monitor cache hit rates to optimize configuration

## Related Decisions

- [ADR-001: Next.js Framework](../ADR-001-nextjs-framework.md)
- [ADR-002: TypeScript Adoption](../ADR-002-typescript.md)

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Monorepo Best Practices](https://monorepo.tools)
- [Turborepo with Vercel](https://vercel.com/docs/concepts/projects/monorepos)

## Sign-off

- [x] John Doe, Tech Lead
- [x] Jane Smith, Senior Architect
- [x] Alice Johnson, DevOps Lead
