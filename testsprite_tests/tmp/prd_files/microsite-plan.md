# Microsite Agentic Development Plan v2.0
**Parallel Development Strategy Using Agents, Skills & MCP Tools**

---

## Executive Summary

This plan outlines a parallel agentic development approach for implementing the Vercel-based microsite architecture. The plan leverages specialized agents, skills, and MCP server tools to build a complete microsite ecosystem efficiently through coordinated parallel workflows.

**Current State Assessment:**
- Existing apps: `apps/main`, `apps/student` (enhancement focus)
- New app: `apps/admin` (greenfield development)
- Active migration: shadcn/ui v2 (in progress on `feature/shadcn-v2-migration`)
- Backend service: `services/report-service` (integration required)

**Target Architecture:**
- Turborepo monorepo with App Shell and 3 microsites (main, student, admin)
- Next.js 15+ with App Router and Server Components
- Vercel AI SDK integration for intelligent code generation
- shadcn/ui v2 design system with Tier 1/2/3 component architecture
- Multi-Zones routing for runtime microsite composition
- Shared authentication, design tokens, and observability stack

**Technical Stack Decisions:**
| Concern | Technology | Rationale |
|---------|------------|-----------|
| State Management | Zustand | Lightweight, TypeScript-first, works with Server Components |
| Data Fetching | Server Components + TanStack Query | SSR optimization + client caching |
| Forms | react-hook-form + Zod | Type-safe validation, shadcn/ui integration |
| Real-time | Server-Sent Events (SSE) | Simpler than WebSockets, Vercel-friendly |
| Database Access | Prisma (unified) | Single ORM across all microsites |
| API Layer | tRPC v11 | End-to-end type safety, React Query integration |

---

## Track 0: Coordination & Risk Management
**Primary Agent:** senior-architect
**Support Agents:** devops-troubleshooter, incident-responder
**MCP Tools:** sequential-thinking, Context7

**Responsibilities:**
1. Cross-track dependency management
2. Integration milestone verification
3. Risk monitoring and mitigation
4. Go/no-go decisions between phases
5. Merge conflict resolution protocols

**Handoff Protocol:**
```
Track A completes task → Creates PR with integration tests
Track 0 validates → Runs cross-track integration suite
Validation passes → Merges to main, notifies dependent tracks
Validation fails → Blocks merge, creates issue for Track A
```

**Risk Register:**
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Multi-zone routing failures | Medium | High | Integration smoke tests after each milestone |
| Auth state sync issues | Medium | Critical | Shared cookie config, middleware tests |
| Bundle size bloat | High | Medium | Bundle analysis gates (<200KB per microsite) |
| shadcn v2 breaking changes | Low | High | Pin versions, test existing components first |
| Parallel merge conflicts | High | Medium | Trunk-based dev, atomic PRs, feature flags |

---

## Track 1: Core Infrastructure & Shared Packages
**Primary Agent:** monorepo-architect
**Support Agents:** backend-architect, deployment-engineer
**MCP Tools:** Context7 (Next.js, Vercel, Turborepo docs), resolve-library-id

**Parallel Subtasks:**
1. **T1.1** Turborepo pipeline configuration (caching, task dependencies)
2. **T1.2** Shared TypeScript/ESLint/Prettier configs
3. **T1.3** Design token system (CSS variables + Tailwind theme)
4. **T1.4** Database schema and Prisma client package
5. **T1.5** Auth package (NextAuth.js v5 configuration)
6. **T1.6** AI SDK configuration and utilities package
7. **T1.7** Shared Zod schemas for cross-app validation

**Acceptance Criteria:**
- `pnpm build` completes in <60s with remote caching
- All packages export ESM + CJS with proper types
- Zero TypeScript errors across all packages

---

## Track 2: App Shell & Multi-Zone Setup
**Primary Agent:** frontend-developer
**Support Agents:** cloud-architect
**MCP Tools:** Context7 (Vercel Multi-Zones), nextjs_runtime

**Parallel Subtasks:**
1. **T2.1** App shell layout with responsive Header/Navigation
2. **T2.2** Next.js rewrites configuration for microsite routing
3. **T2.3** Authentication middleware with role-based guards
4. **T2.4** Shared cookie configuration (secure, httpOnly, sameSite)
5. **T2.5** Vercel project configuration (vercel.json, env vars)
6. **T2.6** Multi-zone integration tests

**Acceptance Criteria:**
- Route transitions between microsites <100ms
- Auth state persists across zone boundaries
- LCP <2.5s for shell component

---

## Track 3: Design System (Tier 1/2/3 Components)
**Primary Agent:** ui-designer
**Support Agents:** frontend-developer, ux-designer
**MCP Tools:** 21st Magic (component builder), Context7 (Radix UI, shadcn docs)

**Component Tiers:**
- **Tier 1 (Primitives):** Button, Input, Card, Dialog, Label, Badge
- **Tier 2 (Composed):** DataTable, Form, Tabs, Accordion, Command
- **Tier 3 (Domain):** ComplianceCard, GPAWidget, TransferRequestForm

**Parallel Subtasks:**
1. **T3.1** Migrate existing Tier 1 components to shadcn v2
2. **T3.2** Layout containers (Stack, Grid, Section) with responsive props
3. **T3.3** Form components with react-hook-form integration
4. **T3.4** DataTable with sorting, filtering, pagination
5. **T3.5** Accessibility audit (axe-core, WCAG 2.2 AA compliance)
6. **T3.6** Storybook documentation for all components
7. **T3.7** Visual regression tests (Chromatic or Percy)

**Acceptance Criteria:**
- 100% WCAG 2.2 AA compliance (axe-core zero violations)
- All components have Storybook stories
- Design tokens match Figma spec exactly

---

## Track 4: Main Microsite (Enhancement)
**Primary Agent:** frontend-developer
**Support Agents:** ai-engineer
**MCP Tools:** Context7 (Next.js AI SDK), nextjs_runtime, browser_eval

**Parallel Subtasks:**
1. **T4.1** Landing page redesign with new design system
2. **T4.2** Documentation portal with ISR (Incremental Static Regeneration)
3. **T4.3** AI-powered content search (Vercel AI SDK)
4. **T4.4** Vercel Analytics integration
5. **T4.5** Core Web Vitals optimization (LCP <2.5s, CLS <0.1, INP <200ms)
6. **T4.6** SEO optimization (metadata, structured data, sitemap)

**Acceptance Criteria:**
- Lighthouse Performance score >90
- All pages achieve target Core Web Vitals
- AI search returns relevant results in <500ms

---

## Track 5: Student Microsite (Enhancement)
**Primary Agent:** full-stack-developer
**Support Agents:** backend-architect
**MCP Tools:** Context7 (Vercel Postgres, tRPC), nextjs_runtime

**Parallel Subtasks:**
1. **T5.1** Student dashboard layout with widget system
2. **T5.2** GPA progress widget with real-time updates (SSE)
3. **T5.3** Compliance status widget with drill-down
4. **T5.4** Transfer credit request workflow (multi-step form)
5. **T5.5** Document upload with client-side validation
6. **T5.6** Notification center with read/unread state
7. **T5.7** Integration with report-service API

**Acceptance Criteria:**
- Dashboard loads in <1.5s (P95)
- Real-time updates appear within 2s
- Form validation provides inline feedback

---

## Track 6: Admin Microsite (Greenfield)
**Primary Agent:** full-stack-developer
**Support Agents:** data-scientist
**MCP Tools:** Context7 (tRPC, Recharts), browser_eval

**Parallel Subtasks:**
1. **T6.1** Admin dashboard with KPI visualization (Recharts)
2. **T6.2** User management CRUD with role assignment
3. **T6.3** Compliance rule configuration interface
4. **T6.4** Report builder with export (PDF, CSV, Excel)
5. **T6.5** Bulk operations (import/export, batch updates)
6. **T6.6** Audit log viewer with filtering
7. **T6.7** System health monitoring dashboard

**Acceptance Criteria:**
- Charts render <100 data points without lag
- Bulk operations show progress feedback
- All admin actions logged to audit trail

---

## Track 7: Backend Integration Services
**Primary Agent:** backend-architect
**Support Agents:** python-pro
**MCP Tools:** Context7 (FastAPI, tRPC)

**Parallel Subtasks:**
1. **T7.1** tRPC router configuration with middleware
2. **T7.2** Advising service API (course recommendations)
3. **T7.3** Compliance engine API (rule evaluation)
4. **T7.4** Document processing service (OCR, parsing)
5. **T7.5** Course mapping service (equivalency lookup)
6. **T7.6** report-service integration adapter
7. **T7.7** API rate limiting and caching layer

**Acceptance Criteria:**
- All endpoints have OpenAPI documentation
- P99 latency <200ms for sync endpoints
- Rate limiting prevents abuse (100 req/min default)

---

## Track 8: Testing & Quality Assurance
**Primary Agent:** error-detective
**Support Agents:** performance-engineer
**MCP Tools:** Playwright (browser_eval), nextjs_runtime

**Parallel Subtasks:**
1. **T8.1** Unit test setup (Vitest) with coverage targets (>80%)
2. **T8.2** Component tests (Testing Library) for all Tier 1-2
3. **T8.3** E2E tests (Playwright) for critical user journeys
4. **T8.4** Accessibility tests (axe-core integration)
5. **T8.5** Performance tests (Lighthouse CI)
6. **T8.6** API contract tests (tRPC type assertions)
7. **T8.7** Visual regression tests for design system

**Acceptance Criteria:**
- >80% code coverage on business logic
- Zero critical/serious axe violations
- All E2E tests pass in CI within 5 minutes

---

## Track 9: CI/CD & Deployment
**Primary Agent:** deployment-engineer
**Support Agents:** devops-troubleshooter
**MCP Tools:** Context7 (GitHub Actions, Vercel)

**Parallel Subtasks:**
1. **T9.1** GitHub Actions workflow (lint, typecheck, test)
2. **T9.2** Pre-commit hooks (Husky, lint-staged)
3. **T9.3** Preview deployments (per-PR with Vercel)
4. **T9.4** Production deployment pipeline with approval gates
5. **T9.5** Rollback procedures and hotfix workflow
6. **T9.6** Environment variable management (dev/staging/prod)
7. **T9.7** Turborepo remote caching configuration

**Acceptance Criteria:**
- CI completes in <10 minutes
- Preview deploys ready within 3 minutes of push
- Rollback can be executed in <5 minutes

---

## Track 10: Observability & Monitoring
**Primary Agent:** performance-engineer
**Support Agents:** incident-responder
**MCP Tools:** Context7 (Vercel Analytics, Sentry), browser_eval

**Parallel Subtasks:**
1. **T10.1** Sentry error tracking with source maps
2. **T10.2** Vercel Log Drains to observability platform
3. **T10.3** Speed Insights dashboard configuration
4. **T10.4** Custom metrics for business KPIs
5. **T10.5** Alert rules (error rate, latency, availability)
6. **T10.6** Distributed tracing for API calls
7. **T10.7** Runbook documentation for common incidents

**Acceptance Criteria:**
- Errors appear in Sentry within 30s
- Alerts fire within 2 minutes of threshold breach
- All critical paths have tracing spans

---

## Track 11: Security & Compliance
**Primary Agent:** backend-architect
**Support Agents:** error-detective
**MCP Tools:** ast-grep (security patterns)

**Parallel Subtasks:**
1. **T11.1** CSP headers configuration (strict)
2. **T11.2** Rate limiting middleware
3. **T11.3** Input validation with Zod (all API endpoints)
4. **T11.4** Secret management (Vercel Env Vars, no hardcoded)
5. **T11.5** SAST integration (CodeQL, Semgrep)
6. **T11.6** Dependency vulnerability scanning (Dependabot)
7. **T11.7** Security audit checklist and sign-off

**Acceptance Criteria:**
- Zero high/critical vulnerabilities
- CSP blocks all inline scripts
- No secrets in git history

---

## Track 12: Documentation & Onboarding
**Primary Agent:** full-stack-developer
**Support Agents:** ai-engineer
**MCP Tools:** Context7 (documentation frameworks)

**Parallel Subtasks:**
1. **T12.1** Technical documentation site (Nextra or similar)
2. **T12.2** API documentation (auto-generated from tRPC)
3. **T12.3** Component documentation (Storybook deploy)
4. **T12.4** Developer onboarding guide (local setup, architecture)
5. **T12.5** Architecture decision records (ADRs)
6. **T12.6** Runbook for operations (deploy, rollback, debug)
7. **T12.7** Contribution guidelines and PR template

**Acceptance Criteria:**
- New developer can run locally in <30 minutes
- All public APIs documented with examples
- ADRs exist for all major decisions

---

## Parallel Execution Workflow

### Optimized Dependency Graph

```
Day 1 (All Can Start):
├── Track 0: Coordination (continuous)
├── Track 1: Infrastructure (critical path)
├── Track 3: Design System (parallel - no infra dependency)
├── Track 7: Backend APIs (parallel - define contracts early)
├── Track 8: Testing (setup test frameworks)
├── Track 9: CI/CD (setup pipelines)
├── Track 11: Security (define policies)
└── Track 12: Documentation (architecture docs)

Day 2-3 (After T1 core packages ready):
├── Track 2: App Shell (needs auth package)
├── Track 4: Main Microsite (needs design tokens)
├── Track 5: Student Microsite (needs UI components)
└── Track 10: Observability (setup infrastructure)

Day 4+ (After T2 multi-zone ready):
└── Track 6: Admin Microsite (needs full stack)
```

### Phase Gates (Go/No-Go Criteria)

**Phase 1 → Phase 2 (Foundation → Integration):**
- [ ] All Track 1 packages published to internal registry
- [ ] Track 3 Tier 1 components passing visual tests
- [ ] Track 7 API contracts defined (OpenAPI/tRPC types)
- [ ] CI pipeline running for all microsites

**Phase 2 → Phase 3 (Integration → QA):**
- [ ] Multi-zone routing working (manual verification)
- [ ] Auth flow complete across all microsites
- [ ] All critical user journeys have E2E tests
- [ ] Performance budgets met (bundle size, LCP)

**Phase 3 → Phase 4 (QA → Deployment):**
- [ ] Zero critical bugs in backlog
- [ ] Accessibility audit passed
- [ ] Security scan passed
- [ ] Stakeholder sign-off on staging

---

## Agent Assignment Summary

| Track | Primary Agent | Complexity | Dependencies |
|-------|---------------|------------|--------------|
| 0 | senior-architect | Ongoing | None |
| 1 | monorepo-architect | XL | None |
| 2 | frontend-developer | L | T1.5 (auth) |
| 3 | ui-designer | XL | None |
| 4 | frontend-developer | M | T1.3 (tokens), T3.1 (components) |
| 5 | full-stack-developer | L | T1.4 (db), T3.* (components) |
| 6 | full-stack-developer | XL | T2.* (multi-zone) |
| 7 | backend-architect | L | T1.4 (db) |
| 8 | error-detective | M | Parallel with all |
| 9 | deployment-engineer | M | None |
| 10 | performance-engineer | M | T9.3 (deploys) |
| 11 | backend-architect | M | None |
| 12 | full-stack-developer | S | None |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Core Web Vitals | LCP <2.5s, CLS <0.1, INP <200ms | Vercel Speed Insights |
| Accessibility | WCAG 2.2 AA | axe-core automated + manual audit |
| Test Coverage | >80% business logic | Vitest coverage report |
| Build Time | <60s with caching | Turborepo metrics |
| Deploy Time | <5 min to production | GitHub Actions logs |
| Error Rate | <0.1% of requests | Sentry dashboard |
| Availability | 99.9% uptime | Vercel Status Page |
