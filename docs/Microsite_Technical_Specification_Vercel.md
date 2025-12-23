# MICROSITE ARCHITECTURE

## Technical Specification for Agentic Development

**Vercel Platform | AI SDK | Next.js Framework**

---

| Field | Value |
|-------|-------|
| **Document Version** | 1.0.0 |
| **Classification** | Internal - Technical Architecture |
| **Target Audience** | Development Teams, AI Agents, Solution Architects |
| **Last Updated** | 2024-12-03 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Vercel Technology Stack](#3-vercel-technology-stack)
4. [Information Architecture Framework](#4-information-architecture-framework)
5. [UX/UI Design System](#5-uxui-design-system)
6. [Microsite Component Structure](#6-microsite-component-structure)
7. [Integration Patterns](#7-integration-patterns)
8. [Agentic Development Protocols](#8-agentic-development-protocols)
9. [Deployment Strategy](#9-deployment-strategy)
10. [Governance and Operations](#10-governance-and-operations)
11. [Appendix A: Quick Reference](#appendix-a-quick-reference)

---

## 1. Executive Summary

This technical specification defines a microsite architecture pattern optimized for agentic development workflows using Vercel's platform and AI SDK capabilities. The architecture enables autonomous AI agents to scaffold, develop, test, and deploy purpose-built frontend applications that align with microservices backend patterns.

### 1.1 Strategic Objectives

- Enable domain-aligned vertical slices connecting UI to backend microservices
- Establish consistent patterns for AI-assisted code generation and deployment
- Leverage Vercel AI SDK for intelligent UI composition and user experience optimization
- Maximize team autonomy through independently deployable frontend units
- Minimize cross-team coordination overhead while maintaining design system coherence

### 1.2 Scope Boundaries

This specification covers frontend microsite architecture, integration patterns with Vercel services, agentic development protocols, and operational governance. Backend microservices architecture is referenced but not defined within this document.

---

## 2. Architecture Overview

### 2.1 Microsite Definition

A microsite is defined as a self-contained, independently deployable frontend application that serves a specific bounded context or user journey. Each microsite maintains its own build pipeline, state management, and release lifecycle while sharing common design tokens and authentication mechanisms.

### 2.2 Core Architectural Principles

| Principle | Implementation Approach |
|-----------|------------------------|
| **Bounded Context Alignment** | Each microsite maps to a DDD bounded context, owning its domain vocabulary and user interactions |
| **Independent Deployability** | Zero-coordination releases via Vercel with preview deployments and instant rollbacks |
| **Technology Flexibility** | Next.js as primary framework with escape hatches for Astro, SvelteKit, or static generation |
| **Composition Over Coupling** | Multi-Zones for runtime integration; shared libraries via npm packages and Turborepo |
| **AI-First Development** | Vercel AI SDK-powered code generation, testing, and optimization integrated into CI/CD |

### 2.3 Topology Model

The microsite ecosystem operates within a hub-and-spoke topology using Vercel Multi-Zones. The App Shell (hub) provides authentication, navigation chrome, and composition orchestration. Individual microsites (spokes) are proxied through path-based routing, communicating via shared cookies and API routes.

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                     │
├─────────────────────────────────────────────────────────────┤
│                        APP SHELL                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Header    │  │  Navigation │  │    Auth     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           MULTI-ZONE ROUTING (rewrites)              │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │ /products │  │  /admin   │  │ /checkout │        │   │
│  │  │ Microsite │  │ Microsite │  │ Microsite │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SHARED STATE (Cookies/KV)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Vercel Technology Stack

### 3.1 Core Platform Services

| Layer | Service | Purpose |
|-------|---------|---------|
| **Compute** | Vercel Functions (Serverless + Edge) | API routes and server-side rendering with global distribution |
| **CDN** | Vercel Edge Network | Global edge caching with automatic invalidation |
| **Static Assets** | Vercel Blob Storage | Design system assets, user uploads, shared bundles |
| **Authentication** | NextAuth.js / Clerk / Auth.js | Unified SSO across all microsites |
| **Database** | Vercel Postgres / Vercel KV | Relational data and key-value caching |
| **AI/ML** | Vercel AI SDK | Code generation, streaming UI, multi-provider LLM access |
| **Queuing** | Vercel Cron + Background Functions | Scheduled tasks and async processing |
| **Observability** | Vercel Analytics + Speed Insights | Real user monitoring, Core Web Vitals, error tracking |
| **Feature Flags** | Vercel Edge Config + Flags SDK | Runtime configuration and experimentation |

### 3.2 Frontend Framework Stack

- **Next.js 15+** — Primary React framework with App Router, Server Components, and Server Actions
- **React 19** — UI library with concurrent features, use() hook, and optimistic updates
- **Turborepo** — High-performance monorepo build system for managing multiple microsites
- **shadcn/ui** — Accessible component primitives built on Radix UI
- **Zustand / Jotai** — Lightweight state management with React Server Component compatibility
- **Multi-Zones** — Runtime microsite composition via Next.js rewrites and middleware

### 3.3 Vercel AI SDK Integration Points

| Capability | Application |
|------------|-------------|
| **Code Generation** | Scaffold new microsites from natural language requirements; generate React components, API routes, and tests using Claude/GPT-4 |
| **Streaming UI** | Real-time AI-powered interfaces with `useChat`, `useCompletion`, and generative UI patterns |
| **Content Personalization** | Dynamic content adaptation using AI SDK Core with structured outputs |
| **Accessibility Audit** | Automated WCAG compliance checking with AI-powered remediation suggestions |
| **Documentation Generation** | Auto-generate component documentation, API references, and user guides |

### 3.4 AI Provider Configuration

```typescript
// lib/ai/providers.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model configuration per use case
export const models = {
  codeGeneration: anthropic('claude-sonnet-4-20250514'),
  contentGeneration: openai('gpt-4o'),
  embedding: openai('text-embedding-3-small'),
} as const;
```

---

## 4. Information Architecture Framework

### 4.1 Microsite Taxonomy

Microsites are categorized into four primary types based on their complexity, state requirements, and integration patterns. This taxonomy guides architectural decisions and technology selection.

| Type | Characteristics | Tech Approach | Examples |
|------|-----------------|---------------|----------|
| **Static** | Content-driven, minimal interactivity, SEO-critical | Next.js Static Export or Astro; ISR for freshness | Marketing landing pages, documentation portals |
| **Interactive** | Rich UI, client-side state, real-time updates | Next.js App Router with streaming; Server-Sent Events | Dashboards, configuration wizards, data explorers |
| **Transactional** | Multi-step workflows, form-heavy, validation-intensive | Server Actions with progressive enhancement; React Hook Form | Checkout flows, onboarding, application forms |
| **Hybrid** | Mixed content and application; SSR + CSR | Next.js PPR (Partial Prerendering); Suspense boundaries | E-commerce product pages, knowledge bases |

### 4.2 Navigation Architecture

Navigation operates at two levels: shell-level (cross-microsite) and microsite-level (internal routes).

#### 4.2.1 Shell-Level Navigation

- Primary navigation rendered by App Shell; consistent across all microsites
- Path-based microsite routing via Next.js rewrites in `next.config.js`
- Deep linking preserved through standardized URL patterns: `/{microsite-slug}/{route-path}`
- Cross-microsite navigation uses standard `<Link>` with prefetching

#### 4.2.2 Microsite-Level Routing

- Next.js App Router manages internal navigation with file-system based routing
- Middleware enforces authentication and authorization at microsite boundaries
- Breadcrumb generation via route segment metadata with shell integration

### 4.3 Content Model

Content within microsites follows a structured model that enables both static authoring and dynamic personalization via AI SDK.

| Content Type | Schema Definition |
|--------------|-------------------|
| **Page Content** | Title, meta, hero, body blocks (MDX/rich text), CTAs, media references |
| **Component Content** | Labels, tooltips, validation messages, microcopy with i18n keys |
| **Dynamic Content** | AI-generated personalized text, recommendations, contextual help via streaming |
| **Media Assets** | Vercel Blob references with `next/image` optimization and lazy-loading |

---

## 5. UX/UI Design System

### 5.1 Design Token Architecture

A centralized design token system ensures visual consistency across all microsites while allowing controlled theming variations. Tokens are distributed as CSS custom properties and Tailwind CSS configuration.

| Token Category | Token Examples | Distribution |
|----------------|----------------|--------------|
| **Color** | `--color-primary`, `--color-surface`, `--color-destructive` | CSS variables + Tailwind theme |
| **Typography** | `--font-sans`, `--font-mono`, `--text-lg` | Tailwind typography plugin |
| **Spacing** | `--space-1`, `--space-4`, `--space-section` | Tailwind spacing scale |
| **Radius** | `--radius-sm`, `--radius-md`, `--radius-full` | CSS variables + Tailwind |
| **Animation** | `--duration-fast`, `--ease-out` | Tailwind + Framer Motion |

### 5.2 Component Library Tiers

Components are organized into three tiers based on their scope of reuse and ownership model.

#### 5.2.1 Tier 1: Core Design System (Shared)

Platform-owned primitives distributed as a Turborepo internal package (`@org/ui`). Built on shadcn/ui and Radix primitives. Includes buttons, inputs, cards, dialogs, and layout containers. Fully accessible and theme-aware.

#### 5.2.2 Tier 2: Domain Components (Federated)

Domain-specific compound components owned by microsite teams but exposed for reuse. Examples include user profile cards, notification panels, and data visualization widgets. Distributed via Turborepo internal packages.

#### 5.2.3 Tier 3: Local Components (Private)

Microsite-internal components not intended for external consumption. Co-located within the microsite's `/components` directory. May evolve into Tier 2 if cross-microsite demand emerges.

### 5.3 Responsive Design Strategy

- **Mobile-first breakpoint system:** sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Container queries:** Component-level responsive behavior via `@container` queries
- **Adaptive loading:** Network-aware asset delivery via `next/image` with automatic format selection
- **Touch optimization:** 44px minimum touch targets, gesture support via `use-gesture`

### 5.4 Accessibility Requirements

All microsites must achieve WCAG 2.2 Level AA conformance. The following requirements are enforced through automated testing and manual audit.

- Semantic HTML structure with proper heading hierarchy
- ARIA landmarks and live regions for dynamic content (Radix handles most automatically)
- Keyboard navigation with visible focus indicators (`:focus-visible`)
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Screen reader compatibility verified with NVDA, VoiceOver, and JAWS
- Reduced motion support via `prefers-reduced-motion` media query and Framer Motion's `useReducedMotion`

---

## 6. Microsite Component Structure

### 6.1 Turborepo Monorepo Layout

All microsites are managed within a Turborepo monorepo for shared dependencies, consistent tooling, and optimized builds.

```
monorepo/
├── apps/
│   ├── shell/                      # App Shell (main entry point)
│   ├── microsite-products/         # Products microsite
│   ├── microsite-checkout/         # Checkout microsite
│   └── microsite-admin/            # Admin microsite
├── packages/
│   ├── ui/                         # Tier 1 design system components
│   ├── config-eslint/              # Shared ESLint configuration
│   ├── config-typescript/          # Shared TypeScript configuration
│   ├── config-tailwind/            # Shared Tailwind configuration
│   ├── database/                   # Prisma schema and client
│   ├── auth/                       # Shared authentication utilities
│   └── ai/                         # AI SDK configuration and utilities
├── turbo.json                      # Turborepo pipeline configuration
├── pnpm-workspace.yaml             # Workspace configuration
└── package.json                    # Root package.json
```

### 6.2 Standard Microsite Directory Layout

Each microsite follows a standardized directory structure aligned with Next.js App Router conventions.

```
apps/microsite-{name}/
├── app/                            # Next.js App Router
│   ├── (routes)/                   # Route groups
│   │   ├── [feature]/              # Dynamic feature routes
│   │   │   ├── page.tsx            # Page component
│   │   │   ├── loading.tsx         # Loading UI
│   │   │   ├── error.tsx           # Error boundary
│   │   │   └── layout.tsx          # Nested layout
│   │   └── page.tsx                # Root page
│   ├── api/                        # API routes
│   │   └── [feature]/
│   │       └── route.ts            # Route handler
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── providers.tsx               # Client providers wrapper
├── components/                     # Tier 3 local components
│   ├── feature-name/
│   │   ├── feature-component.tsx
│   │   └── index.ts
│   └── ui/                         # Local UI overrides
├── lib/                            # Utilities and helpers
│   ├── actions/                    # Server Actions
│   ├── hooks/                      # Custom React hooks
│   ├── stores/                     # Zustand stores
│   └── utils.ts                    # Utility functions
├── public/                         # Static assets
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration (extends shared)
├── tsconfig.json                   # TypeScript configuration (extends shared)
└── package.json                    # Dependencies
```

### 6.3 Feature Implementation Pattern

Features are implemented using Next.js App Router conventions with Server Components as the default.

```
app/(routes)/feature-name/
├── page.tsx                        # Server Component entry
├── _components/                    # Feature-specific components
│   ├── feature-list.tsx            # Server Component
│   ├── feature-card.tsx            # Server Component
│   └── feature-form.tsx            # Client Component ('use client')
├── _actions/                       # Server Actions
│   └── feature-actions.ts
├── loading.tsx                     # Streaming loading state
├── error.tsx                       # Error boundary
└── layout.tsx                      # Optional nested layout
```

### 6.4 State Management Contracts

Cross-microsite state sharing follows a cookie-based model with server-side validation.

- **Local State:** Managed via Zustand stores within each microsite; Server Components use direct database queries
- **Shared State:** Secure HTTP-only cookies for session data; Vercel KV for shared cache
- **Persistence:** Vercel Postgres for durable state; Vercel KV for ephemeral/cache
- **Hydration:** React Server Components eliminate most hydration needs; use `cache()` for request deduplication

---

## 7. Integration Patterns

### 7.1 Backend Microservice Integration

Microsites communicate with backend microservices through Next.js API routes and Server Actions, ensuring consistent authentication, rate limiting, and observability.

| Pattern | Implementation | Use Case |
|---------|----------------|----------|
| **REST API** | Next.js Route Handlers with typed fetch; `unstable_cache` for caching | CRUD operations, external service integration |
| **Server Actions** | Direct database mutations with `'use server'`; built-in CSRF protection | Form submissions, optimistic updates |
| **tRPC** | End-to-end type-safe APIs with tRPC + React Query | Complex data fetching, real-time subscriptions |
| **Server-Sent Events** | Route Handler with `ReadableStream` | Real-time updates, AI streaming |
| **WebSocket** | Third-party (Pusher, Ably) or Vercel-compatible providers | Collaborative features, live cursors |

### 7.2 Multi-Zone Configuration

```javascript
// apps/shell/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy /products/* to the products microsite
        {
          source: '/products/:path*',
          destination: `${process.env.PRODUCTS_MICROSITE_URL}/products/:path*`,
        },
        // Proxy /checkout/* to the checkout microsite
        {
          source: '/checkout/:path*',
          destination: `${process.env.CHECKOUT_MICROSITE_URL}/checkout/:path*`,
        },
        // Proxy /admin/* to the admin microsite
        {
          source: '/admin/:path*',
          destination: `${process.env.ADMIN_MICROSITE_URL}/admin/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
```

### 7.3 Cross-Microsite Communication

- **Shared Cookies:** HTTP-only cookies set with consistent domain; validated server-side
- **Vercel KV:** Shared key-value store for cross-microsite cache and state
- **Edge Config:** Runtime feature flags and configuration shared across all microsites
- **URL State:** Query parameters for cross-microsite data passing with type-safe serialization (nuqs)

### 7.4 Authentication Flow

Authentication is centralized in the App Shell using NextAuth.js (Auth.js). Microsites receive authenticated context through shared cookies and middleware validation.

1. User initiates login via shell-rendered authentication UI
2. NextAuth.js handles OAuth flow and issues session token
3. Session cookie set with shared domain (`.example.com`)
4. Microsite middleware validates session on each request
5. Server Components access session via `auth()` helper

```
┌──────────┐     ┌───────────┐     ┌─────────────┐     ┌─────────────┐
│   User   │────▶│ App Shell │────▶│  NextAuth   │────▶│  Session    │
│          │     │ Auth UI   │     │  Provider   │     │  Cookie     │
└──────────┘     └───────────┘     └─────────────┘     └─────────────┘
                       │                                      │
                       ▼                                      ▼
              ┌─────────────────┐                   ┌─────────────────┐
              │ Shared Domain   │                   │ Middleware      │
              │ Cookie          │──────────────────▶│ Validation      │
              └─────────────────┘                   └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ auth() Helper   │
                                                  │ Server Context  │
                                                  └─────────────────┘
```

### 7.5 Authentication Configuration

```typescript
// packages/auth/src/config.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@org/database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: '__Secure-authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: '.example.com', // Shared across microsites
      },
    },
  },
});
```

---

## 8. Agentic Development Protocols

### 8.1 AI Agent Capabilities

This specification is designed to be consumed by AI development agents (Claude Code, v0, Cursor, or similar) for autonomous code generation, testing, and deployment. The following capabilities are expected from compliant agents.

| Capability | Expected Agent Behavior |
|------------|------------------------|
| **Scaffolding** | Generate complete microsite structure from natural language requirements, including routes, components, and API handlers |
| **Component Generation** | Create React Server/Client Components with proper typing, accessibility, and design system integration |
| **Test Generation** | Produce unit tests (Vitest), component tests (Testing Library), and E2E tests (Playwright) |
| **API Integration** | Generate typed API clients from OpenAPI specs or tRPC routers with error handling |
| **Refactoring** | Apply architectural patterns, optimize performance, migrate to latest Next.js features |
| **Documentation** | Generate README, API docs, Storybook stories, and architectural decision records |

### 8.2 Prompt Engineering Patterns

When instructing AI agents, use the following structured prompt patterns for optimal results.

#### 8.2.1 Microsite Scaffolding Prompt

```
Create a new {microsite-type} microsite named '{name}' for the '{bounded-context}' domain.
Requirements: {natural-language-requirements}
Backend APIs: {api-spec-reference}
Design system: Import from @org/ui
Follow the microsite specification in {this-document-path}.
Use Next.js 15 App Router with Server Components by default.
```

#### 8.2.2 Feature Implementation Prompt

```
Add feature '{feature-name}' to microsite '{microsite-name}'.
User stories: {user-story-list}
Acceptance criteria: {criteria-list}
Generate: page.tsx, Server Actions, components, tests.
Use Server Components for data fetching, Client Components only when needed.
Implement loading.tsx and error.tsx for proper UX.
```

#### 8.2.3 Component Generation Prompt

```
Create a React component '{component-name}' in microsite '{microsite-name}'.
Purpose: {component-purpose}
Props: {props-with-types}
Events: {callback-props}
Design system: Use primitives from @org/ui (shadcn-based)
Include: unit tests, accessibility attributes, responsive behavior.
Default to Server Component unless interactivity requires 'use client'.
```

#### 8.2.4 API Route Generation Prompt

```
Generate a Next.js Route Handler '{route-path}' for microsite '{microsite-name}'.
HTTP Methods: {methods-list}
Request schema: {zod-schema}
Response schema: {zod-schema}
Include: input validation with Zod, error handling, rate limiting consideration.
Use Edge Runtime if no Node.js APIs required.
```

### 8.3 Code Quality Gates

All agent-generated code must pass the following automated quality gates before merge.

- **Linting:** ESLint with `@vercel/style-guide` rules, zero warnings policy
- **Formatting:** Prettier with organization config, enforced via pre-commit hook
- **Type Safety:** TypeScript strict mode, no implicit any, no unchecked indexed access
- **Test Coverage:** Minimum 80% line coverage, 70% branch coverage
- **Bundle Size:** Per-microsite budget enforced via `@next/bundle-analyzer` (initial JS < 100KB)
- **Accessibility:** axe-core automated checks with zero critical/serious violations
- **Security:** `pnpm audit` with no high/critical vulnerabilities

### 8.4 Agent Workflow Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENTIC DEVELOPMENT WORKFLOW                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ Natural  │───▶│ Claude / │───▶│ Code     │───▶│ Quality  │     │
│  │ Language │    │ v0 / AI  │    │ Generation│    │ Gates    │     │
│  │ Prompt   │    │ Agent    │    │           │    │          │     │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │
│                                                        │            │
│                                        ┌───────────────┴──────┐    │
│                                        ▼                      ▼    │
│                                  ┌──────────┐          ┌──────────┐│
│                                  │ Pass     │          │ Fail     ││
│                                  │          │          │          ││
│                                  └────┬─────┘          └────┬─────┘│
│                                       │                     │      │
│                                       ▼                     ▼      │
│                                  ┌──────────┐          ┌──────────┐│
│                                  │ Preview  │          │ Agent    ││
│                                  │ Deploy   │          │ Revision ││
│                                  └──────────┘          └──────────┘│
│                                       │                            │
│                                       ▼                            │
│                                  ┌──────────┐                      │
│                                  │ Review & │                      │
│                                  │ Merge    │                      │
│                                  └──────────┘                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Deployment Strategy

### 9.1 Vercel Deployment Pipeline

Each microsite maintains an independent deployment pipeline via Vercel's Git integration, enabling autonomous releases with automatic preview deployments.

| Stage | Activities |
|-------|------------|
| **Push** | Git push triggers Vercel build |
| **Install** | `pnpm install` with frozen lockfile |
| **Build** | Turborepo builds affected packages; `next build` for each microsite |
| **Test** | Unit tests, lint, type check (via GitHub Actions pre-merge) |
| **Preview** | Automatic preview deployment with unique URL for every PR |
| **Production** | Merge to main triggers production deployment with instant rollback capability |

### 9.2 Environment Strategy

- **Development:** `vercel dev` for local development with environment variable injection
- **Preview:** Automatic per-PR deployments with isolated databases (Vercel Postgres branches)
- **Staging:** Protected branch (`staging`) with production-equivalent configuration
- **Production:** `main` branch deployment with Vercel's global edge network; instant rollbacks

### 9.3 Versioning and Release Management

- Semantic versioning (MAJOR.MINOR.PATCH) for shared packages
- Git-based deployments; each commit to `main` is a production release
- Vercel Skew Protection for graceful client/server version handling
- Changesets for changelog generation and version management in monorepo

### 9.4 Turborepo Pipeline Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV", "VERCEL_URL"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 9.5 Vercel Project Configuration

```json
// vercel.json (per microsite)
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=microsite-{name}",
  "outputDirectory": "apps/microsite-{name}/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "cdg1"],
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## 10. Governance and Operations

### 10.1 Ownership Model

| Asset | Owner | Responsibilities |
|-------|-------|------------------|
| **App Shell** | Platform Team | Auth, navigation, Multi-Zone configuration, shared middleware |
| **Design System (@org/ui)** | UX/Platform Team | Tokens, Tier 1 components, accessibility |
| **Individual Microsites** | Domain Teams | Feature development, testing, deployment |
| **Shared Packages** | Platform Team | Database, auth, AI utilities, configurations |

### 10.2 Observability Standards

- **Analytics:** Vercel Analytics for page views, Core Web Vitals, and custom events
- **Speed Insights:** Real User Monitoring (RUM) for performance metrics
- **Logging:** Vercel Log Drains to Datadog/Axiom for centralized logging
- **Error Tracking:** Sentry integration with source maps and release tracking
- **Alerting:** Vercel Checks API for deployment validation; PagerDuty integration

### 10.3 Security Controls

- **Content Security Policy:** Strict CSP via `next.config.js` headers
- **CORS:** Configured per API route; default deny for cross-origin requests
- **Secrets Management:** Vercel Environment Variables with encryption at rest; no secrets in code
- **Vulnerability Management:** Dependabot for automated dependency updates; `pnpm audit` in CI
- **Authentication:** JWT session tokens with short expiry; refresh token rotation
- **Rate Limiting:** Vercel WAF for DDoS protection; application-level rate limiting via Upstash

### 10.4 Disaster Recovery

- **RPO:** Near-zero for application code (Git-based); 1 hour for database (Vercel Postgres PITR)
- **RTO:** < 1 minute via Vercel instant rollback to previous deployment
- **Backup:** Vercel Postgres point-in-time recovery; Vercel Blob versioning
- **Runbooks:** Documented incident response procedures per microsite

### 10.5 Performance Budgets

| Metric | Target | Enforcement |
|--------|--------|-------------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Vercel Speed Insights alert |
| **INP (Interaction to Next Paint)** | < 200ms | Vercel Speed Insights alert |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Vercel Speed Insights alert |
| **Initial JS Bundle** | < 100KB gzipped | `@next/bundle-analyzer` gate |
| **Time to First Byte** | < 200ms | Vercel Analytics |

---

## Appendix A: Quick Reference

### A.1 Key Commands

```bash
# Create new microsite in monorepo
pnpm turbo gen workspace --name microsite-{name} --type app

# Run development server for specific microsite
pnpm turbo dev --filter=microsite-{name}

# Build all affected packages
pnpm turbo build

# Run tests for specific microsite
pnpm turbo test --filter=microsite-{name}

# Type check entire monorepo
pnpm turbo typecheck

# Lint entire monorepo
pnpm turbo lint

# Add a new shadcn/ui component
pnpm dlx shadcn@latest add button -c packages/ui

# Deploy preview (automatic on PR, but manual option)
vercel

# Deploy to production
vercel --prod

# Link local project to Vercel
vercel link

# Pull environment variables
vercel env pull
```

### A.2 Essential Links

- Next.js Documentation: https://nextjs.org/docs
- Vercel Documentation: https://vercel.com/docs
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Turborepo Documentation: https://turbo.build/repo/docs
- shadcn/ui Components: https://ui.shadcn.com
- NextAuth.js: https://authjs.dev
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Vercel KV: https://vercel.com/docs/storage/vercel-kv

### A.3 Design Token Quick Reference

```css
/* tailwind.config.ts extends these tokens */

/* Colors (CSS Variables for theming) */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--border: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;
--radius: 0.5rem;

/* Typography (Tailwind classes) */
font-sans: 'Inter', system-ui, sans-serif;
font-mono: 'JetBrains Mono', monospace;
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */

/* Spacing (Tailwind scale) */
space-1: 0.25rem;    /* 4px */
space-2: 0.5rem;     /* 8px */
space-4: 1rem;       /* 16px */
space-6: 1.5rem;     /* 24px */
space-8: 2rem;       /* 32px */

/* Animation */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

### A.4 TypeScript Configuration

```json
// packages/config-typescript/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### A.5 Environment Variables Template

```bash
# .env.local (per microsite)

# Vercel System
VERCEL_URL=
VERCEL_ENV=

# Authentication
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Database
DATABASE_URL=
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Vercel Storage
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
BLOB_READ_WRITE_TOKEN=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Edge Config
EDGE_CONFIG=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Feature Flags
FLAGS_SECRET=
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **App Shell** | The host Next.js application that provides authentication, navigation, and Multi-Zone routing |
| **Bounded Context** | A DDD concept defining a semantic boundary within which a domain model applies |
| **Multi-Zones** | Next.js feature enabling multiple Next.js applications to be composed under a single domain via rewrites |
| **Microsite** | A self-contained, independently deployable frontend application serving a specific user journey |
| **Server Component** | React component that renders on the server, enabling direct database access and reduced client bundle |
| **Server Action** | Async function that runs on the server, called directly from components for mutations |
| **Design Token** | Atomic design values (colors, spacing, typography) distributed as CSS custom properties |
| **Turborepo** | High-performance build system for JavaScript/TypeScript monorepos |

---

## Appendix C: Migration Guide (GCP to Vercel)

For teams migrating from the Google Cloud Platform stack:

| GCP Service | Vercel Equivalent | Migration Notes |
|-------------|-------------------|-----------------|
| Cloud Run | Vercel Functions | Containerized apps become serverless functions; adjust cold start expectations |
| Cloud CDN | Vercel Edge Network | Automatic; no configuration needed |
| Cloud Storage | Vercel Blob | API differs; use `@vercel/blob` SDK |
| Firebase Auth | NextAuth.js | Migrate user records; update OAuth redirect URIs |
| Firestore | Vercel Postgres + KV | Relational model requires schema design; use KV for document-like patterns |
| Vertex AI | Vercel AI SDK | Provider-agnostic; supports same models via unified API |
| Cloud Build | Vercel CI/CD | Built-in; configure via `vercel.json` |
| Cloud Monitoring | Vercel Analytics | Simpler API; may need Datadog/Axiom for advanced use cases |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-12-03 | Architecture Team | Initial release |

---

*— End of Document —*
