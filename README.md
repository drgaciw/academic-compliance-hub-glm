# Athletic Academics Hub (AAH)

A SaaS platform for university athletic academic support with AI capabilities, focused on NCAA Division I compliance.

## Overview

Athletic Academics Hub (AAH) is a comprehensive platform designed to digitize and streamline university athletic academic support programs. It enables academic staff, coaches, faculty, and student-athletes to manage the balance between athletic commitments and educational requirements.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Backend** | Serverless microservices with Hono and Nitro |
| **Database** | PostgreSQL with Prisma ORM and pgvector for AI embeddings |
| **Auth** | Clerk (user management & RBAC) |
| **UI** | shadcn/ui with Tailwind CSS |
| **AI/ML** | Vercel AI SDK, OpenAI, Anthropic |
| **API Layer** | tRPC for type-safe client-server communication |
| **Testing** | Vitest (unit), Playwright (E2E), Axe (accessibility) |
| **CI/CD** | Vercel with Turborepo monorepo management |
| **Observability** | Sentry (error tracking), Vercel Analytics |
| **Docs** | Nextra-based documentation site |

## Project Structure

```
athletic-academics-hub/
├── apps/
│   ├── main/                # Public-facing web application
│   ├── admin/               # Admin dashboard (compliance, reports, user mgmt)
│   └── student/             # Student portal (advising, study tools)
├── packages/
│   ├── auth/                # Authentication & authorization
│   ├── database/            # Prisma schema & client
│   ├── api-utils/           # API utilities & helpers
│   ├── ui/                  # Shared UI component library
│   ├── ai/                  # AI utilities & agents
│   ├── compliance-engine/   # NCAA compliance rule engine
│   ├── course-mapping/      # Course equivalency mapping
│   ├── document-processing/ # OCR & document parsing
│   ├── integration-adapter/ # External system adapters
│   ├── logging/             # Structured logging
│   ├── report-generation/   # Report templates & generation
│   ├── schemas/             # Shared Zod schemas
│   ├── trpc/                # tRPC routers & procedures
│   ├── config/              # Shared configurations
│   └── tests/               # Shared test utilities
├── services/
│   ├── user/                # User management service
│   ├── advising/            # Course advising service
│   ├── compliance/          # NCAA compliance service
│   ├── course-mapping/      # Course equivalency service
│   ├── document-ingestion/  # Document upload, OCR pipeline
│   ├── eligibility-engine/  # Eligibility checks, GPA, waivers
│   ├── integration/         # External system integrations
│   ├── report-service/      # Report generation & scheduling
│   ├── monitoring/          # Performance monitoring & log ingestion
│   ├── support/             # Tutoring & support service
│   └── ai/                  # AI & ML service
├── agents/                  # Agentic development plugins & skills
├── docs/                    # Nextra documentation site
│   ├── architecture/        # Architecture decision records
│   ├── adrs/                # ADR documents
│   └── ci-cd/               # CI/CD documentation
└── scripts/                 # Build, validation & rollback scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (or Vercel Postgres)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd athletic-academics-hub

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client and push schema
pnpm db:generate
pnpm db:push

# Start all services in development mode
pnpm dev
```

### Running Individual Apps

```bash
pnpm dev:main       # Main web app
pnpm dev:admin      # Admin dashboard
pnpm dev:student    # Student portal
```

## Development

### Building

```bash
pnpm build              # Build all packages and apps
pnpm build:main         # Build main app with dependencies
pnpm build:admin        # Build admin app
pnpm build:student      # Build student app
```

### Testing

```bash
pnpm test               # Run all tests
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
pnpm test:e2e           # End-to-end tests (Playwright)
pnpm test:e2e:ui        # E2E tests with interactive UI
pnpm test:coverage      # Tests with coverage report
```

Specialized E2E test suites:

```bash
pnpm test:accessibility     # WCAG accessibility checks
pnpm test:keyboard          # Keyboard navigation
pnpm test:focus             # Focus management
pnpm test:transfer-request  # Transfer request flows
pnpm test:admin-user        # Admin user management
pnpm test:cross-zone        # Cross-zone navigation
```

### Linting & Formatting

```bash
pnpm lint           # Run linters
pnpm lint:fix       # Auto-fix lint issues
pnpm type-check     # TypeScript type checking
pnpm format         # Format with Prettier
```

### Database Operations

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio GUI
```

### Documentation

```bash
pnpm docs:dev       # Start docs dev server
pnpm docs:build     # Build documentation site
```

## Key Features

### Core Features

- **NCAA Compliance** — Automated eligibility checks, progress-toward-degree tracking, audit logging
- **Academic Advising** — Course selection, scheduling, conflict detection
- **Eligibility Engine** — GPA calculations, transfer credit evaluation, waiver management
- **Document Ingestion** — OCR pipeline, transcript parsing, virus scanning, file validation
- **Tutoring & Learning Support** — Booking system, resource library, peer mentoring
- **Study Hall Management** — Check-in/check-out, attendance analytics
- **Academic Monitoring** — Real-time dashboards, progress reports, early intervention alerts
- **Report Generation** — Scheduled reports, bulk exports, custom templates
- **Faculty Liaison** — Travel letters, communication portal
- **External Integrations** — Banner, PeopleSoft, Colleague SIS connectors with SFTP support

### AI-Powered Features

- **24/7 Conversational Assistant** — Natural language queries, instant responses
- **Intelligent Advising** — AI course recommendations, conflict detection
- **AI Compliance Copilot** — Natural language rule queries, automated report generation
- **Predictive Analytics** — Risk identification, intervention recommendations
- **AI Study Support** — Subject-specific assistance, practice problem generation
- **Agentic Workflows** — Autonomous compliance monitoring, report generation, onboarding

### Admin Dashboard

- Compliance rules management with rule testing sandbox
- User management with role assignment and impersonation
- Real-time analytics with risk monitoring and what-if analysis
- Audit trail with log search and export
- Scheduled report configuration

## Architecture

- **Monorepo** managed by Turborepo for parallel builds and dependency-aware task orchestration
- **Microservices** communicate via REST (Hono framework) with consistent response format
- **Type-safe API** layer using tRPC between frontend and backend
- **Event-driven** patterns for compliance monitoring and integration syncing

See [Architecture docs](docs/architecture/MONOREPO_SETUP.md) and [ADR-001](docs/adrs/ADR-001-nextjs-framework.md) for details.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting: `pnpm test && pnpm lint && pnpm type-check`
4. Submit a pull request using the [PR template](.github/pull_request_template.md)

## License

[Your License Here]
