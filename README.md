# Athletic Academics Hub (AAH)

A SaaS platform for university athletic academic support with AI capabilities, focused on NCAA Division I compliance.

## Overview

Athletic Academics Hub (AAH) is a comprehensive platform designed to digitize and streamline university athletic academic support programs. It enables academic staff, coaches, faculty, and student-athletes to manage the balance between athletic commitments and educational requirements.

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Backend**: Serverless microservices with Hono and Nitro
- **Database**: PostgreSQL with Prisma ORM and pgvector for AI embeddings
- **Authentication**: Clerk for user management and RBAC
- **UI Components**: Shadcn/UI with Tailwind CSS
- **AI/ML**: Vercel AI SDK with OpenAI and Anthropic integrations
- **Deployment**: Vercel with Turborepo monorepo management

## Project Structure

```
athletic-academics-hub/
├── apps/                    # Frontend applications
│   ├── main/               # Main web application
│   ├── student/            # Student portal (future)
│   └── admin/              # Admin dashboard (future)
├── packages/                 # Shared packages
│   ├── auth/               # Authentication & authorization
│   ├── database/            # Prisma schema & client
│   ├── api-utils/          # API utilities & helpers
│   ├── ui/                 # Shared UI components
│   ├── ai/                 # AI utilities & agents
│   └── config/             # Shared configurations
├── services/                 # Microservices (future)
│   ├── user/               # User management
│   ├── advising/           # Course advising
│   ├── compliance/          # NCAA compliance
│   ├── monitoring/          # Performance monitoring
│   ├── support/             # Tutoring & support
│   ├── integration/          # External integrations
│   └── ai/                 # AI & ML service
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (or Vercel Postgres)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd athletic-academics-hub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. **Start development servers**
   ```bash
   # Start all services
   pnpm dev

   # Or start specific services
   pnpm dev:main        # Main web app
   ```

## Development

### Running Services

```bash
# Run all services in parallel
pnpm dev

# Run specific service
cd apps/main
pnpm dev

# Run with Turborepo filtering
turbo run dev --filter=main-app
```

### Building

```bash
# Build all packages and services
pnpm build

# Build specific app with dependencies
pnpm build:main

# Build with Turborepo filtering
turbo run build --filter=@aah/database
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/auth
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

### Database Operations

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

## Key Features

### Core Features
- **Academic Advising**: Course selection, scheduling, conflict detection
- **Tutoring & Learning Support**: Booking system, resource library, peer mentoring
- **Study Hall Management**: Check-in/check-out, attendance analytics
- **Academic Monitoring**: Real-time dashboards, progress reports, early intervention alerts
- **Learning Disability Support**: Secure document management, accommodation coordination
- **Life Skills & Career**: Workshop scheduling, career services integration
- **Faculty Liaison**: Travel letters, communication portal
- **NCAA Compliance**: Automated eligibility checks, progress tracking, audit logging

### AI-Powered Features
- **24/7 Conversational Assistant**: Natural language queries, instant responses
- **Intelligent Advising**: AI course recommendations, conflict detection
- **AI Compliance Copilot**: Natural language rule queries, automated report generation
- **Predictive Analytics**: Risk identification, intervention recommendations
- **AI Study Support**: Subject-specific assistance, practice problem generation
- **Agentic Workflows**: Autonomous compliance monitoring, report generation, onboarding

## Documentation

- [PRD](docs/prd.md) - Product Requirements Document
- [Technical Specification](docs/tech-spec.md) - Technical Architecture
- [Monorepo Setup](docs/architecture/MONOREPO_SETUP.md) - Development Workflow

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Your License Here]
