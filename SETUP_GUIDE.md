# System Setup Guide

## Quick Start

1. **Clone repository and install dependencies**

   ```bash
   git clone <repository-url>
   cd academic-compliance-hub-glm
   pnpm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start PostgreSQL database**

   ```bash
   # Using Docker (recommended)
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=your_password postgres:16

   # Or local installation (Windows)
   # Start PostgreSQL service and update DATABASE_URL with actual connection string
   ```

4. **Run database migrations and seed**

   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start development servers** (in separate terminals)

   ```bash
   # Terminal 1: Admin app
   pnpm dev:admin

   # Terminal 2: Student app
   pnpm dev:student

   # Terminal 3: Mock SIS servers
   npm run test:mocks

   # Terminal 4: Main app (optional)
   pnpm dev:main
   ```

## Environment Variables Reference

### Required for Development

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `OPENAI_API_KEY` - OpenAI API key for embeddings

### Optional for Testing

- `NEXT_PUBLIC_CLERK_SSO_ENABLED` - Set to `false` for local dev
- Test mode - use mock data instead of real Clerk integration

## Service Architecture

### Microservices (Ports 3000-3010)

- `3001` - User Service
- `3002` - Advising Service
- `3003` - Compliance Service
- `3004` - Monitoring Service
- `3005` - Support Service
- `3006` - Integration Service
- `3007` - AI Service

### Backend Services (Ports 3100-3105)

- `3100` - Document Ingestion Service
- `3101` - Eligibility Engine Service
- `3102` - Course Mapping Service
- `3103` - Report Service
- `3104` - Integration Service (SIS)
- `3105` - Mock SIS Servers (5 servers: 3101-3105)

### Frontend Applications

- `:3000` - Admin App (Next.js)
- `:3000` - Student App (Next.js)
- `:3001` - Main App (Next.js, optional)

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running on port 5432
- Check DATABASE_URL format: `postgresql://user:password@host:port/database?schema=public`
- Ensure pgvector extension is installed: `CREATE EXTENSION IF NOT EXISTS vector;`

### Clerk Authentication

- Verify Clerk API keys are correct
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Verify redirect URLs are configured in Clerk dashboard

### Common Issues

- **pnpm install fails**: Clear cache: `rm -rf node_modules .turbo pnpm-lock.yaml && pnpm install`
- **TypeScript errors**: Run `pnpm type-check` to diagnose issues
- **Port conflicts**: Check if ports 3000-3010 are available

## Production Deployment Checklist

- [ ] Configure production environment variables
- [ ] Run all database migrations on production database
- [ ] Deploy to Vercel (configured for monorepo)
- [ ] Configure production Clerk application
- [ ] Set up production SIS integrations
- [ ] Configure production OpenAI API key
- [ ] Set up monitoring (Sentry, Vercel Analytics)
- [ ] Enable security headers (CSP, CORS)
- [ ] Configure backup strategy
- [ ] Run security audit
- [ ] Enable SOC 2 Type II compliance tracking

## Support

For issues or questions:

1. Check docs/ directory for detailed architecture documentation
2. Review transfer-credits-plan.md for implementation details
3. Review transfer-credits-task.md for task breakdown
4. Check IMPLEMENTATION_PROGRESS_REPORT.md for current status
