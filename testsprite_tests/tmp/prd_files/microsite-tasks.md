# Microsite Development Tasks
**Granular Task Breakdown with Dependencies & Acceptance Criteria**

---

## Task Legend

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (Track.Subtask.Item) |
| **Complexity** | S (1-2h), M (2-4h), L (4-8h), XL (8h+) |
| **Status** | `pending`, `in-progress`, `blocked`, `done` |
| **Blocks** | Tasks that cannot start until this completes |
| **Blocked-By** | Tasks that must complete before this can start |

---

## Track 0: Coordination & Risk Management

### T0.1 Setup Coordination Infrastructure
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T0.1.1 | Create GitHub project board with track columns | senior-architect | S | pending | - | T0.1.2 |
| T0.1.2 | Define label taxonomy (track, priority, type) | senior-architect | S | pending | T0.1.1 | - |
| T0.1.3 | Setup Slack/Discord channel for track leads | senior-architect | S | pending | - | - |
| T0.1.4 | Create daily standup template | senior-architect | S | pending | - | - |

### T0.2 Risk Monitoring
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T0.2.1 | Create risk register spreadsheet | senior-architect | S | pending | - | - |
| T0.2.2 | Define risk escalation procedures | senior-architect | M | pending | - | - |
| T0.2.3 | Setup weekly risk review meeting cadence | senior-architect | S | pending | T0.2.1 | - |

---

## Track 1: Core Infrastructure & Shared Packages

### T1.1 Turborepo Pipeline Configuration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.1.1 | Configure turbo.json with proper task dependencies | monorepo-architect | M | pending | - | T1.1.2 |
| T1.1.2 | Setup remote caching with Vercel | monorepo-architect | M | pending | T1.1.1 | T1.1.3 |
| T1.1.3 | Define workspace filters for selective builds | monorepo-architect | S | pending | T1.1.2 | - |
| T1.1.4 | Create build:affected script for CI | monorepo-architect | S | pending | T1.1.1 | T9.1.1 |

**Acceptance Criteria:**
- [ ] `pnpm build` uses cached outputs when unchanged
- [ ] Remote cache hit rate >80% in CI
- [ ] Build graph visualizable with `turbo run build --graph`

### T1.2 Shared TypeScript/ESLint/Prettier Configs
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.2.1 | Create packages/tsconfig with base, node, react configs | monorepo-architect | M | pending | - | T1.2.2 |
| T1.2.2 | Create packages/eslint-config with Next.js + a11y rules | monorepo-architect | M | pending | T1.2.1 | T1.2.3 |
| T1.2.3 | Create packages/prettier-config | monorepo-architect | S | pending | T1.2.2 | - |
| T1.2.4 | Add path aliases (@/components, @/lib, etc.) | monorepo-architect | S | pending | T1.2.1 | - |

**Acceptance Criteria:**
- [ ] All apps extend shared configs
- [ ] `pnpm lint` runs across entire monorepo
- [ ] Zero TypeScript errors with strict mode

### T1.3 Design Token System
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.3.1 | Define CSS custom properties for colors | ui-designer | M | pending | - | T1.3.2 |
| T1.3.2 | Define CSS custom properties for spacing/typography | ui-designer | M | pending | T1.3.1 | T1.3.3 |
| T1.3.3 | Create tailwind.config.ts extending tokens | ui-designer | M | pending | T1.3.2 | T3.1.1 |
| T1.3.4 | Create dark mode token variants | ui-designer | M | pending | T1.3.1 | - |
| T1.3.5 | Export tokens as TypeScript constants | ui-designer | S | pending | T1.3.3 | - |

**Acceptance Criteria:**
- [ ] Tokens match Figma design spec
- [ ] Dark mode toggle works without FOUC
- [ ] Tailwind classes map 1:1 to tokens

### T1.4 Database Schema & Prisma Package
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.4.1 | Create packages/database with Prisma client | backend-architect | M | pending | - | T1.4.2 |
| T1.4.2 | Define User, Student, Course models | backend-architect | L | pending | T1.4.1 | T1.4.3 |
| T1.4.3 | Define Compliance, TransferRequest models | backend-architect | L | pending | T1.4.2 | T1.4.4 |
| T1.4.4 | Create seed script with test data | backend-architect | M | pending | T1.4.3 | T5.1.1 |
| T1.4.5 | Setup Prisma migrations workflow | backend-architect | M | pending | T1.4.2 | - |
| T1.4.6 | Add database connection pooling (Prisma Accelerate) | backend-architect | M | pending | T1.4.1 | - |

**Acceptance Criteria:**
- [ ] `pnpm db:migrate` runs without errors
- [ ] All models have proper relations defined
- [ ] Seed creates realistic test data

### T1.5 Auth Package (NextAuth.js v5)
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.5.1 | Create packages/auth with NextAuth config | backend-architect | L | pending | T1.4.2 | T1.5.2 |
| T1.5.2 | Configure OAuth providers (Google, Microsoft) | backend-architect | M | pending | T1.5.1 | T1.5.3 |
| T1.5.3 | Define role-based permissions (student, advisor, admin) | backend-architect | M | pending | T1.5.2 | T2.3.1 |
| T1.5.4 | Create session management utilities | backend-architect | M | pending | T1.5.1 | T2.4.1 |
| T1.5.5 | Add JWT token refresh logic | backend-architect | M | pending | T1.5.4 | - |

**Acceptance Criteria:**
- [ ] OAuth login flow works end-to-end
- [ ] Session persists across page refreshes
- [ ] Role permissions enforced on protected routes

### T1.6 AI SDK Package
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.6.1 | Create packages/ai with Vercel AI SDK config | ai-engineer | M | pending | - | T1.6.2 |
| T1.6.2 | Define streaming text generation utilities | ai-engineer | M | pending | T1.6.1 | T4.3.1 |
| T1.6.3 | Create prompt templates for course recommendations | ai-engineer | L | pending | T1.6.2 | - |
| T1.6.4 | Add rate limiting for AI endpoints | ai-engineer | M | pending | T1.6.1 | - |

**Acceptance Criteria:**
- [ ] AI responses stream to client in real-time
- [ ] Rate limiting prevents abuse (10 req/min per user)
- [ ] Prompt templates are version-controlled

### T1.7 Shared Zod Schemas
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T1.7.1 | Create packages/schemas with base types | backend-architect | M | pending | - | T1.7.2 |
| T1.7.2 | Define User, Student, Course schemas | backend-architect | M | pending | T1.7.1 | T5.4.1 |
| T1.7.3 | Define API request/response schemas | backend-architect | M | pending | T1.7.2 | T7.1.1 |
| T1.7.4 | Add schema validation tests | backend-architect | S | pending | T1.7.3 | - |

**Acceptance Criteria:**
- [ ] All schemas export TypeScript types
- [ ] Schemas used by both frontend and backend
- [ ] 100% test coverage on validation logic

---

## Track 2: App Shell & Multi-Zone Setup

### T2.1 App Shell Layout
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T2.1.1 | Create responsive Header component | frontend-developer | M | pending | T3.1.1 | T2.1.2 |
| T2.1.2 | Create Navigation with active state | frontend-developer | M | pending | T2.1.1 | T2.1.3 |
| T2.1.3 | Create Footer component | frontend-developer | S | pending | T2.1.2 | - |
| T2.1.4 | Create mobile navigation drawer | frontend-developer | M | pending | T2.1.2 | - |
| T2.1.5 | Add skip-to-content accessibility link | frontend-developer | S | pending | T2.1.1 | - |

**Acceptance Criteria:**
- [ ] Header/Nav renders correctly on mobile/tablet/desktop
- [ ] Navigation highlights current route
- [ ] Keyboard navigation works (Tab, Enter, Escape)

### T2.2 Multi-Zone Routing
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T2.2.1 | Configure next.config.js rewrites for /student/* | frontend-developer | M | pending | T1.1.1 | T2.2.2 |
| T2.2.2 | Configure next.config.js rewrites for /admin/* | frontend-developer | M | pending | T2.2.1 | T2.2.3 |
| T2.2.3 | Create shared basePath configuration | frontend-developer | S | pending | T2.2.2 | T2.6.1 |
| T2.2.4 | Setup Vercel multi-project deployment | cloud-architect | L | pending | T2.2.3 | - |

**Acceptance Criteria:**
- [ ] /student/* routes to student microsite
- [ ] /admin/* routes to admin microsite
- [ ] Root routes stay on main microsite

### T2.3 Authentication Middleware
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T2.3.1 | Create middleware.ts with auth checks | frontend-developer | L | pending | T1.5.3 | T2.3.2 |
| T2.3.2 | Implement role-based route guards | frontend-developer | M | pending | T2.3.1 | T2.3.3 |
| T2.3.3 | Add redirect logic for unauthorized access | frontend-developer | S | pending | T2.3.2 | - |
| T2.3.4 | Create public route whitelist | frontend-developer | S | pending | T2.3.1 | - |

**Acceptance Criteria:**
- [ ] Unauthenticated users redirected to login
- [ ] Students cannot access /admin/*
- [ ] Middleware runs in <50ms

### T2.4 Shared Cookie Configuration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T2.4.1 | Configure session cookie with proper domain | backend-architect | M | pending | T1.5.4 | T2.4.2 |
| T2.4.2 | Set secure, httpOnly, sameSite attributes | backend-architect | S | pending | T2.4.1 | - |
| T2.4.3 | Test cookie persistence across zones | backend-architect | M | pending | T2.4.2, T2.2.3 | - |

**Acceptance Criteria:**
- [ ] Session cookie accessible from all microsites
- [ ] Cookie not accessible via JavaScript
- [ ] Cookie expires correctly

### T2.5 Vercel Project Configuration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T2.5.1 | Create vercel.json with rewrites and headers | cloud-architect | M | pending | T2.2.4 | T2.5.2 |
| T2.5.2 | Configure environment variables per environment | cloud-architect | M | pending | T2.5.1 | - |
| T2.5.3 | Setup preview deployment domains | cloud-architect | S | pending | T2.5.1 | T9.3.1 |

**Acceptance Criteria:**
- [ ] Preview deploys have unique URLs
- [ ] Environment variables correctly isolated
- [ ] Headers include security policies

### T2.6 Multi-Zone Integration Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T2.6.1 | Create Playwright test for zone navigation | error-detective | M | pending | T2.2.3 | T2.6.2 |
| T2.6.2 | Create test for auth state persistence | error-detective | M | pending | T2.6.1 | - |
| T2.6.3 | Create test for shared header consistency | error-detective | S | pending | T2.6.1 | - |

**Acceptance Criteria:**
- [ ] Tests run in CI on every PR
- [ ] Zone transitions complete in <100ms
- [ ] Auth state verified after navigation

---

## Track 3: Design System (Tier 1/2/3 Components)

### T3.1 Tier 1: Migrate Primitives to shadcn v2
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.1.1 | Migrate Button component to shadcn v2 | ui-designer | M | pending | T1.3.3 | T3.1.2 |
| T3.1.2 | Migrate Input component to shadcn v2 | ui-designer | M | pending | T3.1.1 | T3.1.3 |
| T3.1.3 | Migrate Card component to shadcn v2 | ui-designer | M | pending | T3.1.2 | T3.1.4 |
| T3.1.4 | Migrate Dialog component to shadcn v2 | ui-designer | M | pending | T3.1.3 | T3.1.5 |
| T3.1.5 | Migrate Label component to shadcn v2 | ui-designer | S | pending | T3.1.4 | T3.1.6 |
| T3.1.6 | Migrate Badge component to shadcn v2 | ui-designer | S | pending | T3.1.5 | T3.2.1 |
| T3.1.7 | Update unit tests for migrated components | error-detective | M | pending | T3.1.6 | - |

**Acceptance Criteria:**
- [ ] All Tier 1 components pass existing tests
- [ ] Visual diff shows expected changes only
- [ ] Components use new token system

### T3.2 Layout Containers
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.2.1 | Create Stack component with gap props | frontend-developer | M | pending | T3.1.6 | T3.2.2 |
| T3.2.2 | Create Grid component with responsive columns | frontend-developer | M | pending | T3.2.1 | T3.2.3 |
| T3.2.3 | Create Section component with max-width | frontend-developer | S | pending | T3.2.2 | - |
| T3.2.4 | Create Container component with padding | frontend-developer | S | pending | T3.2.2 | - |

**Acceptance Criteria:**
- [ ] Layout components support responsive breakpoints
- [ ] Gap/padding uses design token values
- [ ] Components compose without layout conflicts

### T3.3 Form Components
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.3.1 | Create Form wrapper with react-hook-form | frontend-developer | L | pending | T3.1.2 | T3.3.2 |
| T3.3.2 | Create FormField with error display | frontend-developer | M | pending | T3.3.1 | T3.3.3 |
| T3.3.3 | Create Select component with search | frontend-developer | M | pending | T3.3.2 | T3.3.4 |
| T3.3.4 | Create DatePicker component | frontend-developer | L | pending | T3.3.3 | T3.3.5 |
| T3.3.5 | Create FileUpload component with drag-drop | frontend-developer | L | pending | T3.3.4 | T5.5.1 |
| T3.3.6 | Create Checkbox and Radio components | frontend-developer | M | pending | T3.3.2 | - |

**Acceptance Criteria:**
- [ ] Forms integrate with Zod validation
- [ ] Error messages display inline
- [ ] Forms accessible via keyboard

### T3.4 DataTable Component
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.4.1 | Create base DataTable with TanStack Table | frontend-developer | L | pending | T3.1.3 | T3.4.2 |
| T3.4.2 | Add column sorting functionality | frontend-developer | M | pending | T3.4.1 | T3.4.3 |
| T3.4.3 | Add column filtering | frontend-developer | M | pending | T3.4.2 | T3.4.4 |
| T3.4.4 | Add pagination with page size selector | frontend-developer | M | pending | T3.4.3 | T3.4.5 |
| T3.4.5 | Add row selection with bulk actions | frontend-developer | M | pending | T3.4.4 | T6.5.1 |
| T3.4.6 | Add column visibility toggle | frontend-developer | S | pending | T3.4.1 | - |

**Acceptance Criteria:**
- [ ] Table handles 1000+ rows without lag
- [ ] Sorting persists in URL params
- [ ] Filter state shareable via URL

### T3.5 Accessibility Audit
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.5.1 | Run axe-core on all Tier 1 components | ux-designer | M | pending | T3.1.7 | T3.5.2 |
| T3.5.2 | Fix critical a11y violations | frontend-developer | L | pending | T3.5.1 | T3.5.3 |
| T3.5.3 | Fix serious a11y violations | frontend-developer | M | pending | T3.5.2 | T3.5.4 |
| T3.5.4 | Add screen reader announcements | frontend-developer | M | pending | T3.5.3 | - |
| T3.5.5 | Test with VoiceOver/NVDA | ux-designer | L | pending | T3.5.4 | - |

**Acceptance Criteria:**
- [ ] Zero critical/serious axe violations
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces state changes

### T3.6 Storybook Documentation
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.6.1 | Setup Storybook 8 with Vite | frontend-developer | M | pending | T3.1.1 | T3.6.2 |
| T3.6.2 | Create stories for all Tier 1 components | frontend-developer | L | pending | T3.6.1 | T3.6.3 |
| T3.6.3 | Create stories for Tier 2 components | frontend-developer | L | pending | T3.6.2 | T3.6.4 |
| T3.6.4 | Add interaction tests to stories | frontend-developer | M | pending | T3.6.3 | - |
| T3.6.5 | Deploy Storybook to Chromatic | frontend-developer | M | pending | T3.6.3 | T12.3.1 |

**Acceptance Criteria:**
- [ ] Every component has at least one story
- [ ] Stories show all variants/states
- [ ] Storybook deployed and accessible

### T3.7 Visual Regression Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T3.7.1 | Setup Chromatic for visual testing | frontend-developer | M | pending | T3.6.5 | T3.7.2 |
| T3.7.2 | Capture baseline snapshots | frontend-developer | M | pending | T3.7.1 | T3.7.3 |
| T3.7.3 | Configure approval workflow | frontend-developer | S | pending | T3.7.2 | - |

**Acceptance Criteria:**
- [ ] Visual changes require explicit approval
- [ ] Baseline updated on main branch merges
- [ ] CI blocks PRs with unapproved changes

---

## Track 4: Main Microsite (Enhancement)

### T4.1 Landing Page Redesign
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T4.1.1 | Create Hero section with CTA | frontend-developer | M | pending | T3.1.1 | T4.1.2 |
| T4.1.2 | Create Features grid section | frontend-developer | M | pending | T4.1.1 | T4.1.3 |
| T4.1.3 | Create Testimonials carousel | frontend-developer | M | pending | T4.1.2 | T4.1.4 |
| T4.1.4 | Create FAQ accordion section | frontend-developer | M | pending | T4.1.3 | T4.1.5 |
| T4.1.5 | Add animation with Framer Motion | frontend-developer | M | pending | T4.1.4 | - |

**Acceptance Criteria:**
- [ ] Hero renders above fold on all devices
- [ ] Animations respect reduced-motion preference
- [ ] Page achieves LCP <2.5s

### T4.2 Documentation Portal
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T4.2.1 | Setup MDX with content layer | frontend-developer | L | pending | T1.1.1 | T4.2.2 |
| T4.2.2 | Create documentation layout | frontend-developer | M | pending | T4.2.1 | T4.2.3 |
| T4.2.3 | Add table of contents sidebar | frontend-developer | M | pending | T4.2.2 | T4.2.4 |
| T4.2.4 | Implement search with pagefind | frontend-developer | L | pending | T4.2.3 | - |
| T4.2.5 | Configure ISR for content updates | frontend-developer | M | pending | T4.2.1 | - |

**Acceptance Criteria:**
- [ ] Documentation searchable offline
- [ ] Content updates without full rebuild
- [ ] TOC highlights current section

### T4.3 AI-Powered Search
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T4.3.1 | Create AI search API route | ai-engineer | L | pending | T1.6.2 | T4.3.2 |
| T4.3.2 | Build search UI with streaming response | ai-engineer | M | pending | T4.3.1 | T4.3.3 |
| T4.3.3 | Add source citations to responses | ai-engineer | M | pending | T4.3.2 | - |
| T4.3.4 | Implement search history | ai-engineer | M | pending | T4.3.2 | - |

**Acceptance Criteria:**
- [ ] Search responds in <500ms TTFB
- [ ] Streaming shows progressive results
- [ ] Citations link to source documents

### T4.4 Analytics Integration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T4.4.1 | Add Vercel Analytics script | frontend-developer | S | pending | - | T4.4.2 |
| T4.4.2 | Configure custom events | frontend-developer | M | pending | T4.4.1 | - |
| T4.4.3 | Setup Speed Insights | frontend-developer | S | pending | T4.4.1 | T10.3.1 |

**Acceptance Criteria:**
- [ ] Page views tracked automatically
- [ ] Custom events fire on key actions
- [ ] Web Vitals visible in dashboard

### T4.5 Core Web Vitals Optimization
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T4.5.1 | Optimize images with next/image | performance-engineer | M | pending | T4.1.5 | T4.5.2 |
| T4.5.2 | Add font optimization (next/font) | performance-engineer | M | pending | T4.5.1 | T4.5.3 |
| T4.5.3 | Implement code splitting | performance-engineer | L | pending | T4.5.2 | T4.5.4 |
| T4.5.4 | Add preload hints for critical resources | performance-engineer | M | pending | T4.5.3 | - |
| T4.5.5 | Optimize third-party scripts | performance-engineer | M | pending | T4.5.1 | - |

**Acceptance Criteria:**
- [ ] LCP <2.5s on 4G mobile
- [ ] CLS <0.1
- [ ] INP <200ms

### T4.6 SEO Optimization
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T4.6.1 | Add metadata to all pages | frontend-developer | M | pending | T4.1.1 | T4.6.2 |
| T4.6.2 | Create dynamic OG images | frontend-developer | M | pending | T4.6.1 | T4.6.3 |
| T4.6.3 | Generate sitemap.xml | frontend-developer | S | pending | T4.6.2 | T4.6.4 |
| T4.6.4 | Add structured data (JSON-LD) | frontend-developer | M | pending | T4.6.3 | - |
| T4.6.5 | Setup robots.txt | frontend-developer | S | pending | - | - |

**Acceptance Criteria:**
- [ ] All pages have unique title/description
- [ ] OG images render on social shares
- [ ] Sitemap submitted to search consoles

---

## Track 5: Student Microsite (Enhancement)

### T5.1 Dashboard Layout
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.1.1 | Create dashboard grid layout | full-stack-developer | M | pending | T1.4.4, T3.2.2 | T5.1.2 |
| T5.1.2 | Create widget wrapper component | full-stack-developer | M | pending | T5.1.1 | T5.2.1 |
| T5.1.3 | Add widget drag-drop reordering | full-stack-developer | L | pending | T5.1.2 | - |
| T5.1.4 | Create dashboard skeleton loading | full-stack-developer | S | pending | T5.1.1 | - |

**Acceptance Criteria:**
- [ ] Dashboard loads in <1.5s (P95)
- [ ] Widget layout persists in localStorage
- [ ] Skeleton matches final layout

### T5.2 GPA Progress Widget
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.2.1 | Create GPA display with trend indicator | full-stack-developer | M | pending | T5.1.2 | T5.2.2 |
| T5.2.2 | Add circular progress visualization | full-stack-developer | M | pending | T5.2.1 | T5.2.3 |
| T5.2.3 | Implement SSE for real-time updates | full-stack-developer | L | pending | T5.2.2 | - |
| T5.2.4 | Add GPA history chart | full-stack-developer | M | pending | T5.2.1 | - |

**Acceptance Criteria:**
- [ ] GPA updates appear within 2s
- [ ] Trend shows improvement/decline
- [ ] Widget handles missing data gracefully

### T5.3 Compliance Status Widget
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.3.1 | Create compliance checklist display | full-stack-developer | M | pending | T5.1.2 | T5.3.2 |
| T5.3.2 | Add expandable requirement details | full-stack-developer | M | pending | T5.3.1 | T5.3.3 |
| T5.3.3 | Create deadline warning indicators | full-stack-developer | M | pending | T5.3.2 | - |
| T5.3.4 | Add compliance history timeline | full-stack-developer | M | pending | T5.3.1 | - |

**Acceptance Criteria:**
- [ ] Compliance status color-coded (green/yellow/red)
- [ ] Deadlines show countdown
- [ ] Details expand inline without navigation

### T5.4 Transfer Credit Workflow
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.4.1 | Create multi-step form wizard | full-stack-developer | L | pending | T1.7.2, T3.3.1 | T5.4.2 |
| T5.4.2 | Add institution search autocomplete | full-stack-developer | M | pending | T5.4.1 | T5.4.3 |
| T5.4.3 | Create course equivalency preview | full-stack-developer | M | pending | T5.4.2 | T5.4.4 |
| T5.4.4 | Add document attachment step | full-stack-developer | M | pending | T5.4.3, T5.5.1 | T5.4.5 |
| T5.4.5 | Implement Server Action for submission | full-stack-developer | L | pending | T5.4.4 | - |
| T5.4.6 | Add draft saving functionality | full-stack-developer | M | pending | T5.4.1 | - |

**Acceptance Criteria:**
- [ ] Form progress persists across sessions
- [ ] Validation shows inline errors
- [ ] Submission creates trackable request

### T5.5 Document Upload
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.5.1 | Create file upload component | full-stack-developer | M | pending | T3.3.5 | T5.5.2 |
| T5.5.2 | Add file type/size validation | full-stack-developer | S | pending | T5.5.1 | T5.5.3 |
| T5.5.3 | Implement upload progress indicator | full-stack-developer | M | pending | T5.5.2 | T5.5.4 |
| T5.5.4 | Create upload to Vercel Blob | full-stack-developer | M | pending | T5.5.3 | - |
| T5.5.5 | Add document preview | full-stack-developer | M | pending | T5.5.4 | - |

**Acceptance Criteria:**
- [ ] Accepts PDF, JPEG, PNG only
- [ ] Max file size 10MB
- [ ] Upload cancellable

### T5.6 Notification Center
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.6.1 | Create notification bell icon with badge | full-stack-developer | S | pending | T3.1.1 | T5.6.2 |
| T5.6.2 | Create notification dropdown panel | full-stack-developer | M | pending | T5.6.1 | T5.6.3 |
| T5.6.3 | Add read/unread state management | full-stack-developer | M | pending | T5.6.2 | T5.6.4 |
| T5.6.4 | Implement mark all as read | full-stack-developer | S | pending | T5.6.3 | - |
| T5.6.5 | Add notification preferences page | full-stack-developer | M | pending | T5.6.3 | - |

**Acceptance Criteria:**
- [ ] Badge shows unread count
- [ ] Notifications grouped by type
- [ ] Read state persists to database

### T5.7 Report Service Integration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T5.7.1 | Create tRPC client for report-service | full-stack-developer | M | pending | T7.6.1 | T5.7.2 |
| T5.7.2 | Add report generation UI | full-stack-developer | M | pending | T5.7.1 | T5.7.3 |
| T5.7.3 | Implement report download | full-stack-developer | M | pending | T5.7.2 | - |
| T5.7.4 | Add report history list | full-stack-developer | M | pending | T5.7.2 | - |

**Acceptance Criteria:**
- [ ] Reports generate within 30s
- [ ] Download starts automatically
- [ ] History shows last 10 reports

---

## Track 6: Admin Microsite (Greenfield)

### T6.1 Admin Dashboard
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.1.1 | Create admin layout with sidebar navigation | full-stack-developer | M | pending | T2.2.2 | T6.1.2 |
| T6.1.2 | Create KPI summary cards | full-stack-developer | M | pending | T6.1.1 | T6.1.3 |
| T6.1.3 | Add student compliance overview chart | data-scientist | L | pending | T6.1.2 | T6.1.4 |
| T6.1.4 | Add pending requests counter | full-stack-developer | S | pending | T6.1.3 | - |
| T6.1.5 | Create date range selector | full-stack-developer | M | pending | T6.1.1 | - |

**Acceptance Criteria:**
- [ ] Dashboard shows real-time metrics
- [ ] Charts render <100 data points smoothly
- [ ] Date range filters all widgets

### T6.2 User Management
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.2.1 | Create users list with DataTable | full-stack-developer | M | pending | T3.4.5, T6.1.1 | T6.2.2 |
| T6.2.2 | Add user detail slide-over panel | full-stack-developer | M | pending | T6.2.1 | T6.2.3 |
| T6.2.3 | Create role assignment interface | full-stack-developer | M | pending | T6.2.2 | T6.2.4 |
| T6.2.4 | Add user creation form | full-stack-developer | M | pending | T6.2.3 | T6.2.5 |
| T6.2.5 | Implement user deactivation | full-stack-developer | M | pending | T6.2.4 | - |
| T6.2.6 | Add impersonation feature (admin only) | full-stack-developer | L | pending | T6.2.3 | - |

**Acceptance Criteria:**
- [ ] User list supports search/filter
- [ ] Role changes take effect immediately
- [ ] Impersonation logged to audit trail

### T6.3 Compliance Rule Configuration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.3.1 | Create compliance rules list | full-stack-developer | M | pending | T6.1.1 | T6.3.2 |
| T6.3.2 | Add rule detail editor | full-stack-developer | L | pending | T6.3.1 | T6.3.3 |
| T6.3.3 | Create condition builder UI | full-stack-developer | XL | pending | T6.3.2 | T6.3.4 |
| T6.3.4 | Add rule testing sandbox | full-stack-developer | L | pending | T6.3.3 | - |
| T6.3.5 | Implement rule versioning | backend-architect | L | pending | T6.3.2 | - |

**Acceptance Criteria:**
- [ ] Rules can be enabled/disabled
- [ ] Condition builder supports AND/OR logic
- [ ] Testing shows rule evaluation result

### T6.4 Report Builder
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.4.1 | Create report template selector | full-stack-developer | M | pending | T6.1.1 | T6.4.2 |
| T6.4.2 | Add filter configuration UI | full-stack-developer | L | pending | T6.4.1 | T6.4.3 |
| T6.4.3 | Create column selector | full-stack-developer | M | pending | T6.4.2 | T6.4.4 |
| T6.4.4 | Implement report preview | full-stack-developer | L | pending | T6.4.3 | T6.4.5 |
| T6.4.5 | Add export to PDF/CSV/Excel | full-stack-developer | L | pending | T6.4.4 | - |
| T6.4.6 | Create scheduled report configuration | full-stack-developer | M | pending | T6.4.4 | - |

**Acceptance Criteria:**
- [ ] Reports export in <10s for 1000 rows
- [ ] PDF matches preview exactly
- [ ] Scheduled reports send via email

### T6.5 Bulk Operations
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.5.1 | Add bulk selection to DataTable | full-stack-developer | M | pending | T3.4.5 | T6.5.2 |
| T6.5.2 | Create bulk action dropdown | full-stack-developer | M | pending | T6.5.1 | T6.5.3 |
| T6.5.3 | Implement batch status update | full-stack-developer | M | pending | T6.5.2 | T6.5.4 |
| T6.5.4 | Add bulk import from CSV | full-stack-developer | L | pending | T6.5.3 | T6.5.5 |
| T6.5.5 | Create bulk export functionality | full-stack-developer | M | pending | T6.5.4 | - |
| T6.5.6 | Add progress indicator for long operations | full-stack-developer | M | pending | T6.5.3 | - |

**Acceptance Criteria:**
- [ ] Bulk operations show progress percentage
- [ ] Failed items listed with errors
- [ ] Operations cancellable

### T6.6 Audit Log Viewer
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.6.1 | Create audit log table with pagination | full-stack-developer | M | pending | T6.1.1 | T6.6.2 |
| T6.6.2 | Add filter by action type | full-stack-developer | M | pending | T6.6.1 | T6.6.3 |
| T6.6.3 | Add filter by user | full-stack-developer | S | pending | T6.6.2 | T6.6.4 |
| T6.6.4 | Add filter by date range | full-stack-developer | S | pending | T6.6.3 | T6.6.5 |
| T6.6.5 | Create detail view for log entries | full-stack-developer | M | pending | T6.6.4 | - |
| T6.6.6 | Add audit log export | full-stack-developer | M | pending | T6.6.4 | - |

**Acceptance Criteria:**
- [ ] Logs load in <1s for last 30 days
- [ ] Filters combinable
- [ ] Detail shows before/after values

### T6.7 System Health Dashboard
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T6.7.1 | Create service status indicators | full-stack-developer | M | pending | T6.1.1, T10.1.1 | T6.7.2 |
| T6.7.2 | Add database connection status | full-stack-developer | S | pending | T6.7.1 | T6.7.3 |
| T6.7.3 | Create error rate chart | full-stack-developer | M | pending | T6.7.2 | T6.7.4 |
| T6.7.4 | Add latency percentile chart | full-stack-developer | M | pending | T6.7.3 | - |
| T6.7.5 | Implement status page embed | full-stack-developer | M | pending | T6.7.1 | - |

**Acceptance Criteria:**
- [ ] Status updates every 30s
- [ ] Alerts visible when services degraded
- [ ] Historical data available for 7 days

---

## Track 7: Backend Integration Services

### T7.1 tRPC Router Configuration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.1.1 | Setup tRPC with Next.js App Router | backend-architect | L | pending | T1.7.3 | T7.1.2 |
| T7.1.2 | Configure auth middleware for tRPC | backend-architect | M | pending | T7.1.1, T1.5.3 | T7.2.1 |
| T7.1.3 | Setup error handling and logging | backend-architect | M | pending | T7.1.1 | - |
| T7.1.4 | Add request/response validation | backend-architect | M | pending | T7.1.1 | - |

**Acceptance Criteria:**
- [ ] Type safety from client to server
- [ ] Auth context available in all procedures
- [ ] Errors logged with request context

### T7.2 Advising Service API
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.2.1 | Create getCourseRecommendations procedure | backend-architect | L | pending | T7.1.2 | T7.2.2 |
| T7.2.2 | Add getAdvisor procedure | backend-architect | M | pending | T7.2.1 | T7.2.3 |
| T7.2.3 | Create scheduleAppointment mutation | backend-architect | M | pending | T7.2.2 | - |
| T7.2.4 | Add getAppointmentSlots query | backend-architect | M | pending | T7.2.2 | - |

**Acceptance Criteria:**
- [ ] Recommendations based on student profile
- [ ] Appointments conflict-checked
- [ ] All procedures documented

### T7.3 Compliance Engine API
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.3.1 | Create evaluateCompliance procedure | backend-architect | L | pending | T7.1.2 | T7.3.2 |
| T7.3.2 | Add getComplianceStatus query | backend-architect | M | pending | T7.3.1 | T7.3.3 |
| T7.3.3 | Create getComplianceHistory query | backend-architect | M | pending | T7.3.2 | - |
| T7.3.4 | Add rule configuration mutations | backend-architect | M | pending | T7.3.1 | T6.3.2 |

**Acceptance Criteria:**
- [ ] Evaluation completes in <100ms
- [ ] Results explain which rules passed/failed
- [ ] History tracks all evaluations

### T7.4 Document Processing Service
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.4.1 | Create uploadDocument mutation | backend-architect | M | pending | T7.1.2 | T7.4.2 |
| T7.4.2 | Implement OCR integration | backend-architect | L | pending | T7.4.1 | T7.4.3 |
| T7.4.3 | Add transcript parsing logic | backend-architect | L | pending | T7.4.2 | T7.4.4 |
| T7.4.4 | Create getDocumentStatus query | backend-architect | S | pending | T7.4.3 | - |
| T7.4.5 | Add document validation rules | backend-architect | M | pending | T7.4.2 | - |

**Acceptance Criteria:**
- [ ] OCR extracts text with >95% accuracy
- [ ] Processing completes in <30s
- [ ] Invalid documents rejected with reason

### T7.5 Course Mapping Service
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.5.1 | Create getCourseEquivalency query | backend-architect | M | pending | T7.1.2 | T7.5.2 |
| T7.5.2 | Add searchCourses query | backend-architect | M | pending | T7.5.1 | T7.5.3 |
| T7.5.3 | Create requestEquivalencyReview mutation | backend-architect | M | pending | T7.5.2 | - |
| T7.5.4 | Add bulk import for course mappings | backend-architect | L | pending | T7.5.1 | - |

**Acceptance Criteria:**
- [ ] Equivalency lookup <50ms
- [ ] Search supports fuzzy matching
- [ ] Review creates trackable request

### T7.6 Report Service Integration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.6.1 | Create tRPC adapter for report-service | backend-architect | M | pending | T7.1.1 | T5.7.1 |
| T7.6.2 | Add generateReport mutation | backend-architect | M | pending | T7.6.1 | T7.6.3 |
| T7.6.3 | Create getReportStatus query | backend-architect | S | pending | T7.6.2 | T7.6.4 |
| T7.6.4 | Add downloadReport query | backend-architect | S | pending | T7.6.3 | - |

**Acceptance Criteria:**
- [ ] Reports queue properly
- [ ] Status polling efficient
- [ ] Download URLs expire

### T7.7 API Rate Limiting
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T7.7.1 | Implement rate limiting middleware | backend-architect | M | pending | T7.1.1 | T7.7.2 |
| T7.7.2 | Configure per-endpoint limits | backend-architect | M | pending | T7.7.1 | T7.7.3 |
| T7.7.3 | Add rate limit headers to responses | backend-architect | S | pending | T7.7.2 | - |
| T7.7.4 | Create rate limit override for admins | backend-architect | S | pending | T7.7.2 | - |

**Acceptance Criteria:**
- [ ] Default limit 100 req/min per user
- [ ] 429 response includes retry-after
- [ ] Rate limits logged for monitoring

---

## Track 8: Testing & Quality Assurance

### T8.1 Unit Test Setup
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.1.1 | Configure Vitest with workspace | error-detective | M | pending | T1.1.1 | T8.1.2 |
| T8.1.2 | Setup coverage thresholds (80%) | error-detective | S | pending | T8.1.1 | T8.1.3 |
| T8.1.3 | Add coverage reporting to CI | error-detective | S | pending | T8.1.2 | - |
| T8.1.4 | Create test utilities and mocks | error-detective | M | pending | T8.1.1 | - |

**Acceptance Criteria:**
- [ ] Tests run in <30s for full suite
- [ ] Coverage report generated
- [ ] CI fails if coverage drops

### T8.2 Component Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.2.1 | Setup Testing Library with Vitest | error-detective | M | pending | T8.1.1 | T8.2.2 |
| T8.2.2 | Write tests for all Tier 1 components | error-detective | L | pending | T8.2.1, T3.1.7 | T8.2.3 |
| T8.2.3 | Write tests for all Tier 2 components | error-detective | L | pending | T8.2.2 | - |
| T8.2.4 | Add accessibility assertions | error-detective | M | pending | T8.2.1 | - |

**Acceptance Criteria:**
- [ ] All components have at least one test
- [ ] Tests verify accessibility basics
- [ ] Tests mock external dependencies

### T8.3 E2E Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.3.1 | Setup Playwright with project config | error-detective | M | pending | T8.1.1 | T8.3.2 |
| T8.3.2 | Write login flow test | error-detective | M | pending | T8.3.1, T2.3.1 | T8.3.3 |
| T8.3.3 | Write transfer request submission test | error-detective | L | pending | T8.3.2, T5.4.5 | T8.3.4 |
| T8.3.4 | Write admin user management test | error-detective | L | pending | T8.3.3, T6.2.5 | - |
| T8.3.5 | Add cross-zone navigation tests | error-detective | M | pending | T8.3.2, T2.6.1 | - |

**Acceptance Criteria:**
- [ ] Tests run against preview deploys
- [ ] Critical paths covered
- [ ] Tests complete in <5 min

### T8.4 Accessibility Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.4.1 | Integrate axe-core with Playwright | error-detective | M | pending | T8.3.1 | T8.4.2 |
| T8.4.2 | Create a11y test for each page | error-detective | L | pending | T8.4.1 | T8.4.3 |
| T8.4.3 | Add keyboard navigation tests | error-detective | M | pending | T8.4.2 | - |
| T8.4.4 | Create focus management tests | error-detective | M | pending | T8.4.2 | - |

**Acceptance Criteria:**
- [ ] Zero critical/serious violations
- [ ] All pages tested
- [ ] Results exported as JSON

### T8.5 Performance Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.5.1 | Setup Lighthouse CI | performance-engineer | M | pending | T9.1.1 | T8.5.2 |
| T8.5.2 | Define performance budgets | performance-engineer | M | pending | T8.5.1 | T8.5.3 |
| T8.5.3 | Add bundle size checks | performance-engineer | M | pending | T8.5.2 | - |
| T8.5.4 | Create load testing script | performance-engineer | L | pending | T8.5.1 | - |

**Acceptance Criteria:**
- [ ] Lighthouse score >90 enforced
- [ ] Bundle size <200KB per microsite
- [ ] Load test validates 100 concurrent users

### T8.6 API Contract Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.6.1 | Create tRPC type assertion tests | error-detective | M | pending | T7.1.1 | T8.6.2 |
| T8.6.2 | Add schema validation tests | error-detective | M | pending | T8.6.1, T1.7.4 | - |
| T8.6.3 | Create integration tests for API routes | error-detective | L | pending | T8.6.1 | - |

**Acceptance Criteria:**
- [ ] Type mismatches caught at compile time
- [ ] Schema changes trigger test failures
- [ ] API tests run in isolation

### T8.7 Visual Regression Tests
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T8.7.1 | Integrate Percy/Chromatic | error-detective | M | pending | T3.7.1 | T8.7.2 |
| T8.7.2 | Capture baselines for all pages | error-detective | L | pending | T8.7.1 | T8.7.3 |
| T8.7.3 | Configure diff thresholds | error-detective | S | pending | T8.7.2 | - |

**Acceptance Criteria:**
- [ ] Visual diffs reviewed on PRs
- [ ] Baselines auto-updated on merge
- [ ] Flaky tests identified and fixed

---

## Track 9: CI/CD & Deployment

### T9.1 GitHub Actions Workflow
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.1.1 | Create lint workflow | deployment-engineer | M | pending | T1.1.4 | T9.1.2 |
| T9.1.2 | Create typecheck workflow | deployment-engineer | S | pending | T9.1.1 | T9.1.3 |
| T9.1.3 | Create test workflow | deployment-engineer | M | pending | T9.1.2, T8.1.1 | T9.1.4 |
| T9.1.4 | Create build workflow | deployment-engineer | M | pending | T9.1.3 | T9.3.1 |
| T9.1.5 | Add caching for node_modules | deployment-engineer | S | pending | T9.1.1 | - |

**Acceptance Criteria:**
- [ ] Workflows run on PR and push
- [ ] Caching reduces CI time by 50%
- [ ] Failure blocks PR merge

### T9.2 Pre-commit Hooks
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.2.1 | Setup Husky | deployment-engineer | S | pending | - | T9.2.2 |
| T9.2.2 | Configure lint-staged | deployment-engineer | S | pending | T9.2.1 | T9.2.3 |
| T9.2.3 | Add commit message validation | deployment-engineer | S | pending | T9.2.2 | - |
| T9.2.4 | Add type-check on commit | deployment-engineer | M | pending | T9.2.2 | - |

**Acceptance Criteria:**
- [ ] Hooks run in <10s
- [ ] Only staged files checked
- [ ] Bypass available for emergencies

### T9.3 Preview Deployments
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.3.1 | Configure Vercel for PR previews | deployment-engineer | M | pending | T9.1.4, T2.5.3 | T9.3.2 |
| T9.3.2 | Add comment with preview URL | deployment-engineer | S | pending | T9.3.1 | - |
| T9.3.3 | Setup preview environment variables | deployment-engineer | M | pending | T9.3.1 | - |

**Acceptance Criteria:**
- [ ] Preview deploys in <3 min
- [ ] Each PR gets unique URL
- [ ] Preview uses test database

### T9.4 Production Deployment
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.4.1 | Create production deployment workflow | deployment-engineer | M | pending | T9.1.4 | T9.4.2 |
| T9.4.2 | Add approval gates | deployment-engineer | M | pending | T9.4.1 | T9.4.3 |
| T9.4.3 | Configure canary deployments | deployment-engineer | L | pending | T9.4.2 | - |
| T9.4.4 | Add deployment notifications | deployment-engineer | S | pending | T9.4.1 | - |

**Acceptance Criteria:**
- [ ] Production deploys require approval
- [ ] Canary routes 10% traffic initially
- [ ] Slack notified on deploy

### T9.5 Rollback Procedures
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.5.1 | Create rollback script | deployment-engineer | M | pending | T9.4.1 | T9.5.2 |
| T9.5.2 | Document rollback procedure | deployment-engineer | M | pending | T9.5.1 | - |
| T9.5.3 | Create hotfix branch workflow | deployment-engineer | M | pending | T9.5.1 | - |

**Acceptance Criteria:**
- [ ] Rollback completes in <5 min
- [ ] Procedure tested monthly
- [ ] Hotfix bypasses normal queue

### T9.6 Environment Variables
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.6.1 | Create .env.example with all vars | deployment-engineer | M | pending | - | T9.6.2 |
| T9.6.2 | Configure Vercel env vars per environment | deployment-engineer | M | pending | T9.6.1 | - |
| T9.6.3 | Add env var validation script | deployment-engineer | M | pending | T9.6.1 | - |

**Acceptance Criteria:**
- [ ] All required vars documented
- [ ] Missing vars fail build
- [ ] Secrets never in logs

### T9.7 Turborepo Remote Caching
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T9.7.1 | Configure Vercel remote cache | deployment-engineer | M | pending | T1.1.2 | T9.7.2 |
| T9.7.2 | Add cache token to CI | deployment-engineer | S | pending | T9.7.1 | - |
| T9.7.3 | Monitor cache hit rates | deployment-engineer | S | pending | T9.7.2 | - |

**Acceptance Criteria:**
- [ ] Cache hit rate >80%
- [ ] Token rotated quarterly
- [ ] Cache size monitored

---

## Track 10: Observability & Monitoring

### T10.1 Error Tracking
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.1.1 | Configure Sentry for all microsites | performance-engineer | M | pending | T1.1.1 | T10.1.2 |
| T10.1.2 | Upload source maps on deploy | performance-engineer | M | pending | T10.1.1, T9.4.1 | T10.1.3 |
| T10.1.3 | Configure error grouping rules | performance-engineer | M | pending | T10.1.2 | - |
| T10.1.4 | Add user context to errors | performance-engineer | S | pending | T10.1.1 | - |

**Acceptance Criteria:**
- [ ] Errors appear in <30s
- [ ] Source maps resolve correctly
- [ ] User identified in error context

### T10.2 Log Aggregation
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.2.1 | Configure Vercel Log Drains | performance-engineer | M | pending | T2.5.1 | T10.2.2 |
| T10.2.2 | Setup log ingestion endpoint | performance-engineer | M | pending | T10.2.1 | T10.2.3 |
| T10.2.3 | Create log search interface | performance-engineer | L | pending | T10.2.2 | - |
| T10.2.4 | Add structured logging format | performance-engineer | M | pending | T10.2.1 | - |

**Acceptance Criteria:**
- [ ] Logs retained for 30 days
- [ ] Search by request ID possible
- [ ] Structured fields indexed

### T10.3 Speed Insights
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.3.1 | Enable Speed Insights on all microsites | performance-engineer | S | pending | T4.4.3 | T10.3.2 |
| T10.3.2 | Create custom dashboard views | performance-engineer | M | pending | T10.3.1 | T10.3.3 |
| T10.3.3 | Setup alerts for performance regression | performance-engineer | M | pending | T10.3.2 | - |

**Acceptance Criteria:**
- [ ] Real User Monitoring active
- [ ] Alerts fire on >20% regression
- [ ] Dashboard shows per-route metrics

### T10.4 Custom Metrics
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.4.1 | Define business KPI metrics | performance-engineer | M | pending | - | T10.4.2 |
| T10.4.2 | Implement metric collection | performance-engineer | M | pending | T10.4.1 | T10.4.3 |
| T10.4.3 | Create KPI dashboard | performance-engineer | L | pending | T10.4.2 | - |

**Acceptance Criteria:**
- [ ] Transfer requests tracked
- [ ] Compliance evaluations counted
- [ ] Metrics queryable by time range

### T10.5 Alert Configuration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.5.1 | Define alert thresholds | incident-responder | M | pending | T10.1.1, T10.3.1 | T10.5.2 |
| T10.5.2 | Configure Slack alert integration | incident-responder | M | pending | T10.5.1 | T10.5.3 |
| T10.5.3 | Setup PagerDuty for critical alerts | incident-responder | M | pending | T10.5.2 | - |
| T10.5.4 | Create alert runbooks | incident-responder | L | pending | T10.5.2 | T10.7.1 |

**Acceptance Criteria:**
- [ ] Alerts fire within 2 min
- [ ] On-call receives critical alerts
- [ ] Runbooks linked in alerts

### T10.6 Distributed Tracing
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.6.1 | Configure OpenTelemetry | performance-engineer | L | pending | T7.1.1 | T10.6.2 |
| T10.6.2 | Add trace context to API calls | performance-engineer | M | pending | T10.6.1 | T10.6.3 |
| T10.6.3 | Create trace visualization | performance-engineer | M | pending | T10.6.2 | - |

**Acceptance Criteria:**
- [ ] Traces span client → API → database
- [ ] Trace ID in error logs
- [ ] P95 latency visible per span

### T10.7 Runbook Documentation
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T10.7.1 | Create incident response runbook | incident-responder | M | pending | T10.5.4 | T10.7.2 |
| T10.7.2 | Document common issues and fixes | incident-responder | L | pending | T10.7.1 | - |
| T10.7.3 | Create escalation procedures | incident-responder | M | pending | T10.7.1 | - |

**Acceptance Criteria:**
- [ ] Runbooks cover top 10 incidents
- [ ] Escalation path documented
- [ ] Runbooks reviewed quarterly

---

## Track 11: Security & Compliance

### T11.1 CSP Headers
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.1.1 | Define CSP policy | backend-architect | M | pending | - | T11.1.2 |
| T11.1.2 | Configure headers in next.config.js | backend-architect | M | pending | T11.1.1 | T11.1.3 |
| T11.1.3 | Test CSP with report-uri | backend-architect | M | pending | T11.1.2 | - |
| T11.1.4 | Add nonce for inline scripts | backend-architect | M | pending | T11.1.2 | - |

**Acceptance Criteria:**
- [ ] CSP blocks inline scripts
- [ ] Third-party scripts whitelisted
- [ ] Violations reported

### T11.2 Rate Limiting
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.2.1 | Implement Upstash rate limiter | backend-architect | M | pending | - | T11.2.2 |
| T11.2.2 | Configure per-route limits | backend-architect | M | pending | T11.2.1 | T11.2.3 |
| T11.2.3 | Add rate limit bypass for internal services | backend-architect | S | pending | T11.2.2 | - |

**Acceptance Criteria:**
- [ ] Rate limits configurable per route
- [ ] 429 responses include retry-after
- [ ] Rate limit metrics logged

### T11.3 Input Validation
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.3.1 | Audit all API endpoints for validation | backend-architect | L | pending | T7.1.1 | T11.3.2 |
| T11.3.2 | Add Zod validation to unvalidated endpoints | backend-architect | L | pending | T11.3.1 | T11.3.3 |
| T11.3.3 | Create validation error response format | backend-architect | S | pending | T11.3.2 | - |

**Acceptance Criteria:**
- [ ] All endpoints validated
- [ ] Validation errors user-friendly
- [ ] Invalid input logged

### T11.4 Secret Management
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.4.1 | Audit codebase for hardcoded secrets | backend-architect | M | pending | - | T11.4.2 |
| T11.4.2 | Migrate secrets to Vercel env vars | backend-architect | M | pending | T11.4.1 | T11.4.3 |
| T11.4.3 | Add secret scanning to CI | backend-architect | M | pending | T11.4.2 | - |

**Acceptance Criteria:**
- [ ] Zero hardcoded secrets
- [ ] Secrets rotated quarterly
- [ ] CI blocks secret commits

### T11.5 SAST Integration
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.5.1 | Configure CodeQL for JavaScript/TypeScript | backend-architect | M | pending | T9.1.1 | T11.5.2 |
| T11.5.2 | Add Semgrep rules | backend-architect | M | pending | T11.5.1 | T11.5.3 |
| T11.5.3 | Review and triage findings | backend-architect | L | pending | T11.5.2 | - |

**Acceptance Criteria:**
- [ ] SAST runs on every PR
- [ ] Critical findings block merge
- [ ] False positives documented

### T11.6 Dependency Scanning
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.6.1 | Enable Dependabot | backend-architect | S | pending | - | T11.6.2 |
| T11.6.2 | Configure auto-merge for patch updates | backend-architect | S | pending | T11.6.1 | T11.6.3 |
| T11.6.3 | Create vulnerability response SLA | backend-architect | M | pending | T11.6.2 | - |

**Acceptance Criteria:**
- [ ] Critical vulns patched within 24h
- [ ] High vulns patched within 7 days
- [ ] Dependencies updated weekly

### T11.7 Security Audit
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T11.7.1 | Create security audit checklist | backend-architect | M | pending | T11.1.3, T11.3.3 | T11.7.2 |
| T11.7.2 | Perform pre-launch audit | backend-architect | L | pending | T11.7.1 | T11.7.3 |
| T11.7.3 | Document findings and remediation | backend-architect | M | pending | T11.7.2 | - |

**Acceptance Criteria:**
- [ ] Checklist covers OWASP Top 10
- [ ] All critical issues resolved
- [ ] Audit report archived

---

## Track 12: Documentation & Onboarding

### T12.1 Documentation Site
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.1.1 | Setup Nextra documentation site | full-stack-developer | M | pending | - | T12.1.2 |
| T12.1.2 | Create navigation structure | full-stack-developer | M | pending | T12.1.1 | T12.1.3 |
| T12.1.3 | Write architecture overview | full-stack-developer | L | pending | T12.1.2 | T12.1.4 |
| T12.1.4 | Deploy documentation site | full-stack-developer | S | pending | T12.1.3 | - |

**Acceptance Criteria:**
- [ ] Docs searchable
- [ ] Version-tagged releases
- [ ] Auto-deploy on main merge

### T12.2 API Documentation
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.2.1 | Generate OpenAPI from tRPC | full-stack-developer | M | pending | T7.1.4 | T12.2.2 |
| T12.2.2 | Create interactive API explorer | full-stack-developer | M | pending | T12.2.1 | T12.2.3 |
| T12.2.3 | Add code examples for each endpoint | full-stack-developer | L | pending | T12.2.2 | - |

**Acceptance Criteria:**
- [ ] All endpoints documented
- [ ] Examples copy-pasteable
- [ ] Try-it-now functionality

### T12.3 Component Documentation
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.3.1 | Deploy Storybook to public URL | full-stack-developer | S | pending | T3.6.5 | T12.3.2 |
| T12.3.2 | Add usage guidelines to stories | full-stack-developer | M | pending | T12.3.1 | T12.3.3 |
| T12.3.3 | Create component changelog | full-stack-developer | M | pending | T12.3.2 | - |

**Acceptance Criteria:**
- [ ] Storybook publicly accessible
- [ ] Guidelines explain when/how to use
- [ ] Breaking changes documented

### T12.4 Developer Onboarding
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.4.1 | Write local setup guide | full-stack-developer | M | pending | T9.6.1 | T12.4.2 |
| T12.4.2 | Create architecture walkthrough | full-stack-developer | L | pending | T12.4.1 | T12.4.3 |
| T12.4.3 | Write first-task tutorial | full-stack-developer | M | pending | T12.4.2 | - |
| T12.4.4 | Create troubleshooting FAQ | full-stack-developer | M | pending | T12.4.1 | - |

**Acceptance Criteria:**
- [ ] New dev productive in <30 min
- [ ] Common issues addressed
- [ ] Video walkthrough available

### T12.5 Architecture Decision Records
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.5.1 | Create ADR template | full-stack-developer | S | pending | - | T12.5.2 |
| T12.5.2 | Document major architecture decisions | full-stack-developer | L | pending | T12.5.1 | - |
| T12.5.3 | Setup ADR review process | full-stack-developer | S | pending | T12.5.1 | - |

**Acceptance Criteria:**
- [ ] ADRs for all major decisions
- [ ] Template includes context, decision, consequences
- [ ] ADRs searchable

### T12.6 Operations Runbook
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.6.1 | Document deploy procedures | full-stack-developer | M | pending | T9.4.4 | T12.6.2 |
| T12.6.2 | Document rollback procedures | full-stack-developer | M | pending | T12.6.1, T9.5.2 | T12.6.3 |
| T12.6.3 | Document debug procedures | full-stack-developer | M | pending | T12.6.2 | - |

**Acceptance Criteria:**
- [ ] Procedures step-by-step
- [ ] Commands copy-pasteable
- [ ] Last-tested date recorded

### T12.7 Contribution Guidelines
| ID | Task | Agent | Complexity | Status | Blocked-By | Blocks |
|----|------|-------|------------|--------|------------|--------|
| T12.7.1 | Create CONTRIBUTING.md | full-stack-developer | M | pending | - | T12.7.2 |
| T12.7.2 | Create PR template | full-stack-developer | S | pending | T12.7.1 | T12.7.3 |
| T12.7.3 | Create issue templates | full-stack-developer | S | pending | T12.7.2 | - |
| T12.7.4 | Document code review process | full-stack-developer | M | pending | T12.7.1 | - |

**Acceptance Criteria:**
- [ ] Templates pre-fill required info
- [ ] Review SLA documented
- [ ] Style guide linked

---

## Summary Statistics

| Track | Total Tasks | Complexity Distribution |
|-------|-------------|------------------------|
| Track 0 | 7 | 6S, 1M |
| Track 1 | 28 | 6S, 14M, 7L, 1XL |
| Track 2 | 18 | 4S, 10M, 4L |
| Track 3 | 28 | 5S, 15M, 7L, 1XL |
| Track 4 | 23 | 5S, 13M, 5L |
| Track 5 | 27 | 5S, 16M, 6L |
| Track 6 | 31 | 4S, 18M, 7L, 2XL |
| Track 7 | 25 | 5S, 15M, 5L |
| Track 8 | 22 | 4S, 12M, 6L |
| Track 9 | 21 | 8S, 11M, 2L |
| Track 10 | 21 | 3S, 12M, 6L |
| Track 11 | 20 | 5S, 11M, 4L |
| Track 12 | 22 | 6S, 12M, 4L |
| **Total** | **293** | **66S, 159M, 63L, 5XL** |

---

## Critical Path Summary

```
T1.1.1 → T1.1.2 → T1.5.1 → T2.3.1 → T2.6.1 → T5.4.5 → [Production Ready]
         ↓
       T1.3.3 → T3.1.1 → T3.4.1 → T6.2.1 → T6.5.1 → [Admin Features]
         ↓
       T1.4.2 → T7.1.1 → T7.3.1 → T5.3.1 → [Compliance Features]
```

**Estimated Critical Path Length:** 45-60 tasks depending on parallelization efficiency
