# Test Architecture and Strategy
## Academic Compliance Hub - Frontend Codebase

**Version:** 1.0  
**Date:** 2025-12-24  
**Status:** Design Document

---

## Executive Summary

This document outlines a comprehensive test architecture and strategy for the Academic Compliance Hub (AAH) frontend codebase. The architecture is designed to ensure high-quality, maintainable, and compliant testing practices across the monorepo structure, supporting three frontend applications (admin, main, student) built with Next.js 16.1.0, React 19.2.0, TypeScript 5.9.2, and shadcn/ui components.

### Key Objectives

- **Quality Assurance:** Ensure 90%+ code coverage across all frontend applications
- **Compliance Testing:** Validate FERPA compliance and WCAG 2.1 Level AA accessibility
- **Performance Testing:** Monitor Core Web Vitals and ensure responsive design
- **Developer Experience:** Fast feedback loops with efficient test execution
- **CI/CD Integration:** Automated testing in all deployment pipelines

---

## 1. Testing Framework Selection

### 1.1 Unit Testing Framework: Vitest

**Selected Framework:** Vitest v4.0.7

**Justification:**

| Criterion | Vitest | Jest | Winner |
|-----------|--------|------|--------|
| **Performance** | Native Vite integration, 10x faster than Jest | Slower due to JSDOM | ✅ Vitest |
| **TypeScript Support** | First-class, no configuration needed | Requires ts-jest transformer | ✅ Vitest |
| **ESM Support** | Native support | Limited support, requires configuration | ✅ Vitest |
| **Next.js Compatibility** | Works with next-vitest plugin | Requires custom configuration | ✅ Vitest |
| **Watch Mode** | Instant HMR, smart file watching | Slower, full re-runs | ✅ Vitest |
| **Mocking** | Built-in vi.mock() | Built-in jest.mock() | 🤝 Tie |
| **Snapshot Testing** | Built-in support | Built-in support | 🤝 Tie |
| **Community** | Growing rapidly | Mature, extensive | Jest |
| **Code Coverage** | Built-in c8 (Istanbul) | Built-in Istanbul | 🤝 Tie |

**Key Advantages for AAH:**

1. **Vite Integration:** The project uses Turborepo with Vite-based tooling, making Vitest a natural fit
2. **Performance:** Faster test execution enables better developer experience in CI/CD
3. **TypeScript:** Native TypeScript support eliminates configuration overhead
4. **Next.js Support:** The `@vitest/next` plugin provides seamless integration with Next.js App Router
5. **Modern Stack:** Aligns with React 19 and Next.js 16 modern features

**Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import next from '@vitest/next'

export default defineConfig({
  plugins: [react(), next()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/dist/**',
        '**/build/**',
      ],
    },
  },
})
```

### 1.2 Component Testing: React Testing Library

**Selected Framework:** React Testing Library v14.0.0

**Justification:**

- **User-Centric:** Tests focus on user behavior rather than implementation details
- **Accessibility First:** Encourages accessible testing practices (aligns with WCAG 2.1 AA)
- **React 19 Support:** Full compatibility with React 19 features
- **Industry Standard:** Widely adopted with extensive community support
- **Integration:** Works seamlessly with Vitest and Next.js

**Key Utilities:**

- `render()` - Render components in test environment
- `screen` - Query DOM elements using accessible queries
- `fireEvent` / `userEvent` - Simulate user interactions
- `waitFor` / `waitForElementToBeRemoved` - Handle async operations
- `within()` - Scope queries to specific containers

### 1.3 E2E Testing Framework: Playwright

**Selected Framework:** Playwright v1.51.0

**Justification:**

| Criterion | Playwright | Cypress | Winner |
|-----------|-----------|---------|--------|
| **Multi-Browser** | Chromium, Firefox, WebKit | Chromium-based only | ✅ Playwright |
| **Speed** | Parallel execution by default | Slower, sequential by default | ✅ Playwright |
| **Network Interception** | Built-in, powerful | Built-in | 🤝 Tie |
| **Mobile Testing** | Native device emulation | Limited | ✅ Playwright |
| **Accessibility Testing** | Built-in axe-core integration | Requires plugins | ✅ Playwright |
| **Video/Trace** | Built-in tracing and video | Built-in | 🤝 Tie |
| **TypeScript** | First-class support | Good support | ✅ Playwright |
| **Existing Investment** | Already in use in admin app | None | ✅ Playwright |

**Key Advantages for AAH:**

1. **Existing Infrastructure:** Admin app already has Playwright configured
2. **Cross-Browser Testing:** Ensures compatibility across Chrome, Firefox, Safari
3. **Accessibility Testing:** Built-in axe-core integration for WCAG 2.1 AA validation
4. **FERPA Compliance:** Network interception allows testing secure data flows
5. **Performance:** Parallel execution reduces CI/CD time

### 1.4 Visual Regression Testing: Playwright + Percy

**Selected Framework:** Playwright with Percy integration

**Justification:**

- **Integration:** Works with existing Playwright setup
- **Responsive Testing:** Capture screenshots at multiple breakpoints
- **Diff Detection:** Automated visual change detection
- **FERPA Compliance:** Can mask sensitive data in screenshots

### 1.5 Accessibility Testing: axe-core + Playwright

**Selected Framework:** axe-core with Playwright integration

**Justification:**

- **WCAG 2.1 AA Compliance:** Validates against accessibility standards
- **Automated:** Integrates into existing E2E test suite
- **Comprehensive:** Covers 50+ accessibility rules
- **FERPA Alignment:** Ensures screen reader compatibility for compliance

### 1.6 Performance Testing: Lighthouse CI + Web Vitals

**Selected Framework:** Lighthouse CI + Web Vitals library

**Justification:**

- **Core Web Vitals:** Measures LCP, FID, CLS metrics
- **CI Integration:** Automated performance regression detection
- **Budgets:** Set performance budgets for critical pages
- **Next.js Integration:** Native support for Web Vitals

### 1.7 API Mocking: MSW (Mock Service Worker)

**Selected Framework:** MSW v2.0.0

**Justification:**

- **Network-Level Mocking:** Intercepts requests at network level
- **Type Safety:** Full TypeScript support
- **Shared Mocks:** Same mocks work for unit, integration, and E2E tests
- **Development Mode:** Can use in development without test runner
- **Next.js Compatibility:** Works with API routes and server actions

---

## 2. Test Directory Structure

### 2.1 Monorepo Structure Overview

```
academic-compliance-hub-glm/
├── apps/
│   ├── admin/
│   │   ├── app/                    # Next.js App Router
│   │   ├── src/
│   │   │   ├── components/         # App-specific components
│   │   │   └── lib/                # App-specific utilities
│   │   ├── tests/
│   │   │   ├── unit/               # Unit tests
│   │   │   ├── integration/        # Integration tests
│   │   │   ├── e2e/                # E2E tests (Playwright)
│   │   │   ├── fixtures/           # Test data
│   │   │   ├── mocks/              # API mocks (MSW)
│   │   │   ├── setup.ts            # Test setup
│   │   │   └── vitest.config.ts    # Vitest configuration
│   │   └── playwright.config.ts    # Playwright configuration
│   ├── main/
│   │   └── (same structure as admin)
│   └── student/
│       └── (same structure as admin)
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   │   └── components/         # Shared UI components
│   │   ├── tests/
│   │   │   ├── unit/               # Component unit tests
│   │   │   ├── visual/             # Visual regression tests
│   │   │   ├── accessibility/      # Accessibility tests
│   │   │   ├── fixtures/           # Test fixtures
│   │   │   ├── setup.ts
│   │   │   └── vitest.config.ts
│   ├── api-utils/
│   │   ├── src/
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   └── (other packages)
├── tests/
│   ├── shared/                     # Shared test utilities
│   │   ├── fixtures/               # Common test data
│   │   ├── mocks/                  # Common API mocks
│   │   ├── helpers/                # Test helper functions
│   │   └── setup.ts                # Global test setup
│   ├── performance/                # Performance tests
│   │   ├── lighthouse/
│   │   └── web-vitals/
│   └── accessibility/              # Accessibility tests
│       └── axe/
└── docs/
    └── test-architecture.md        # This document
```

### 2.2 Detailed Test Directory Structure

#### 2.2.1 App-Level Tests (apps/admin/tests/)

```
tests/
├── unit/
│   ├── components/
│   │   ├── button.test.tsx
│   │   ├── card.test.tsx
│   │   ├── dialog.test.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── upload.test.tsx
│   │   ├── eligibility-review.test.tsx
│   │   ├── dashboard.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── use-transcript-upload.test.ts
│   │   ├── use-eligibility.test.ts
│   │   └── ...
│   ├── utils/
│   │   ├── file-validator.test.ts
│   │   ├── formatters.test.ts
│   │   └── ...
│   └── services/
│       ├── api-client.test.ts
│       └── auth-service.test.ts
├── integration/
│   ├── flows/
│   │   ├── transcript-upload-flow.test.tsx
│   │   ├── eligibility-review-flow.test.tsx
│   │   ├── course-mapping-flow.test.tsx
│   │   └── ...
│   ├── api/
│   │   ├── transcript-api.test.ts
│   │   ├── eligibility-api.test.ts
│   │   └── ...
│   └── auth/
│       └── authentication-flow.test.tsx
├── e2e/
│   ├── flows/
│   │   ├── transcript-upload.spec.ts
│   │   ├── eligibility-review.spec.ts
│   │   ├── compliance-dashboard.spec.ts
│   │   ├── course-mapping.spec.ts
│   │   ├── audit-trail.spec.ts
│   │   └── batch-upload.spec.ts
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── session-management.spec.ts
│   ├── security/
│   │   ├── ferpa-compliance.spec.ts
│   │   ├── data-encryption.spec.ts
│   │   └── access-control.spec.ts
│   ├── accessibility/
│   │   ├── wcag-compliance.spec.ts
│   │   ├── keyboard-navigation.spec.ts
│   │   └── screen-reader.spec.ts
│   ├── performance/
│   │   ├── core-web-vitals.spec.ts
│   │   └── page-load.spec.ts
│   └── responsive/
│       ├── mobile.spec.ts
│       ├── tablet.spec.ts
│       └── desktop.spec.ts
├── fixtures/
│   ├── transcripts/
│   │   ├── valid-transcript.pdf
│   │   ├── invalid-transcript.pdf
│   │   └── large-transcript.pdf
│   ├── users/
│   │   ├── admin-user.json
│   │   ├── student-user.json
│   │   └── compliance-officer.json
│   ├── courses/
│   │   └── course-catalog.json
│   └── eligibility/
│       └── eligibility-rules.json
├── mocks/
│   ├── handlers/
│   │   ├── transcript.handlers.ts
│   │   ├── eligibility.handlers.ts
│   │   ├── auth.handlers.ts
│   │   └── ...
│   ├── server.ts                  # MSW server setup
│   └── index.ts                   # Export all handlers
├── helpers/
│   ├── render-with-providers.tsx  # Custom render wrapper
│   ├── test-utils.ts              # Common test utilities
│   └── accessibility-helpers.ts   # Accessibility test helpers
├── setup.ts                       # Vitest setup file
├── vitest.config.ts               # Vitest configuration
└── playwright.config.ts           # Playwright configuration
```

#### 2.2.2 Shared UI Package Tests (packages/ui/tests/)

```
tests/
├── unit/
│   ├── button.test.tsx
│   ├── card.test.tsx
│   ├── dialog.test.tsx
│   ├── input.test.tsx
│   ├── label.test.tsx
│   ├── select.test.tsx
│   ├── tabs.test.tsx
│   └── dropdown-menu.test.tsx
├── visual/
│   ├── button.visual.test.tsx
│   ├── card.visual.test.tsx
│   └── ...
├── accessibility/
│   ├── button.a11y.test.tsx
│   ├── dialog.a11y.test.tsx
│   └── ...
├── fixtures/
│   └── component-props.ts
├── setup.ts
└── vitest.config.ts
```

#### 2.2.3 Shared Test Utilities (tests/shared/)

```
shared/
├── fixtures/
│   ├── transcripts/
│   ├── users/
│   ├── courses/
│   └── mock-data.ts
├── mocks/
│   ├── handlers/
│   │   ├── common.handlers.ts
│   │   └── ...
│   ├── server.ts
│   └── index.ts
├── helpers/
│   ├── render-with-providers.tsx
│   ├── create-mock-store.ts
│   ├── mock-auth.ts
│   └── test-utils.ts
├── setup.ts
└── types.ts
```

---

## 3. Unit Testing Strategy

### 3.1 Philosophy

Unit tests focus on testing individual components, hooks, utilities, and services in isolation. They should:

- **Be Fast:** Execute in milliseconds
- **Be Deterministic:** No external dependencies
- **Be Focused:** Test one thing at a time
- **Be Maintainable:** Clear intent, easy to update

### 3.2 Component Testing

#### 3.2.1 Testing Approach

For UI components, use React Testing Library with the following principles:

1. **Test User Behavior:** Test what users see and do, not implementation details
2. **Use Accessible Queries:** Prioritize `getByRole`, `getByLabelText`, `getByText`
3. **Avoid Testing Internal State:** Don't test state directly, test the rendered output
4. **Mock Dependencies:** Mock child components and external services

#### 3.2.2 Component Test Template

```typescript
// tests/unit/components/button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default variant', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render with different variants', () => {
      const { rerender } = render(<Button variant="destructive">Delete</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-destructive')
      
      rerender(<Button variant="outline">Cancel</Button>)
      expect(screen.getByRole('button')).toHaveClass('border-input')
    })

    it('should render with different sizes', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-8')
    })
  })

  describe('Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      await user.click(screen.getByRole('button'))
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Submit</Button>)
      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should have proper ARIA attributes when loading', () => {
      render(<Button loading>Loading...</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })
  })
})
```

#### 3.2.3 Component Test Coverage Requirements

| Component Type | Coverage Target | Key Test Scenarios |
|----------------|-----------------|-------------------|
| **Basic UI** (Button, Input, Label) | 95%+ | Rendering, variants, sizes, interactions, accessibility |
| **Complex UI** (Dialog, Select, Dropdown) | 90%+ | Open/close, keyboard navigation, focus management, ARIA |
| **Form Components** | 90%+ | Validation, error states, submission, accessibility |
| **Data Display** (Card, Table) | 85%+ | Empty states, loading states, data rendering, pagination |

### 3.3 Hook Testing

#### 3.3.1 Testing Approach

Custom hooks should be tested using `@testing-library/react-hooks`:

1. **Test Hook Behavior:** Test state changes and return values
2. **Test Side Effects:** Test async operations and cleanup
3. **Test Error Handling:** Test error states and recovery
4. **Test Dependencies:** Test behavior with different dependency values

#### 3.3.2 Hook Test Template

```typescript
// tests/unit/hooks/use-transcript-upload.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTranscriptUpload } from '@/hooks/use-transcript-upload'
import * as api from '@/lib/api-client'

vi.mock('@/lib/api-client')

describe('useTranscriptUpload Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTranscriptUpload())
      
      expect(result.current.uploading).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Upload Functionality', () => {
    it('should upload transcript successfully', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      vi.mocked(api.uploadTranscript).mockResolvedValue({ id: '123', status: 'uploaded' })
      
      const { result } = renderHook(() => useTranscriptUpload())
      
      await act(async () => {
        await result.current.upload(mockFile)
      })
      
      expect(result.current.uploading).toBe(false)
      expect(result.current.progress).toBe(100)
      expect(result.current.error).toBeNull()
      expect(api.uploadTranscript).toHaveBeenCalledWith(mockFile)
    })

    it('should handle upload errors', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      vi.mocked(api.uploadTranscript).mockRejectedValue(new Error('Upload failed'))
      
      const { result } = renderHook(() => useTranscriptUpload())
      
      await act(async () => {
        await result.current.upload(mockFile)
      })
      
      expect(result.current.uploading).toBe(false)
      expect(result.current.error).toBeInstanceOf(Error)
    })

    it('should update progress during upload', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      let progressCallback: ((progress: number) => void) | null = null
      
      vi.mocked(api.uploadTranscript).mockImplementation((file, onProgress) => {
        progressCallback = onProgress
        return Promise.resolve({ id: '123', status: 'uploaded' })
      })
      
      const { result } = renderHook(() => useTranscriptUpload())
      
      act(() => {
        result.current.upload(mockFile)
      })
      
      await act(async () => {
        if (progressCallback) {
          progressCallback(50)
          await waitFor(() => expect(result.current.progress).toBe(50))
          
          progressCallback(100)
          await waitFor(() => expect(result.current.progress).toBe(100))
        }
      })
    })
  })

  describe('Cleanup', () => {
    it('should cancel upload on unmount', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      const mockCancel = vi.fn()
      vi.mocked(api.uploadTranscript).mockReturnValue({
        cancel: mockCancel,
        promise: Promise.resolve({ id: '123', status: 'uploaded' })
      } as any)
      
      const { result, unmount } = renderHook(() => useTranscriptUpload())
      
      act(() => {
        result.current.upload(mockFile)
      })
      
      unmount()
      
      expect(mockCancel).toHaveBeenCalled()
    })
  })
})
```

### 3.4 Utility Testing

#### 3.4.1 Testing Approach

Pure utility functions should be tested with comprehensive input/output scenarios:

1. **Happy Path:** Test with valid inputs
2. **Edge Cases:** Test boundary conditions
3. **Error Cases:** Test invalid inputs
4. **Type Safety:** Ensure TypeScript types are correct

#### 3.4.2 Utility Test Template

```typescript
// tests/unit/utils/file-validator.test.ts
import { describe, it, expect } from 'vitest'
import { validateTranscriptFile } from '@/lib/file-validator'

describe('validateTranscriptFile', () => {
  describe('File Type Validation', () => {
    it('should accept valid PDF files', () => {
      const file = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-PDF files', () => {
      const file = new File(['content'], 'document.txt', { type: 'text/plain' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid file type. Only PDF files are allowed.')
    })

    it('should reject files without extension', () => {
      const file = new File(['content'], 'transcript', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(false)
    })
  })

  describe('File Size Validation', () => {
    it('should accept files under size limit', () => {
      const content = 'x'.repeat(5 * 1024 * 1024) // 5MB
      const file = new File([content], 'transcript.pdf', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(true)
    })

    it('should reject files over size limit', () => {
      const content = 'x'.repeat(11 * 1024 * 1024) // 11MB
      const file = new File([content], 'transcript.pdf', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('File size exceeds maximum limit of 10MB.')
    })

    it('should accept files exactly at size limit', () => {
      const content = 'x'.repeat(10 * 1024 * 1024) // 10MB
      const file = new File([content], 'transcript.pdf', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('File Name Validation', () => {
    it('should accept valid file names', () => {
      const file = new File(['content'], 'student-transcript-2024.pdf', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(true)
    })

    it('should reject files with special characters', () => {
      const file = new File(['content'], 'transcript@#$%.pdf', { type: 'application/pdf' })
      const result = validateTranscriptFile(file)
      
      expect(result.valid).toBe(false)
    })
  })
})
```

### 3.5 Service Testing

#### 3.5.1 Testing Approach

Service layer tests should mock HTTP requests using MSW:

1. **Test API Calls:** Verify correct endpoints are called
2. **Test Request/Response:** Validate request payloads and response handling
3. **Test Error Handling:** Test error states and retry logic
4. **Test Authentication:** Verify auth headers are included

#### 3.5.2 Service Test Template

```typescript
// tests/unit/services/api-client.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { uploadTranscript, getEligibilityStatus } from '@/lib/api-client'
import { server } from '@/tests/mocks/server'
import { rest } from 'msw'

describe('API Client', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('uploadTranscript', () => {
    it('should upload transcript successfully', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      
      server.use(
        rest.post('/api/transcripts/upload', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ id: '123', status: 'uploaded' })
          )
        })
      )

      const result = await uploadTranscript(mockFile)
      
      expect(result).toEqual({ id: '123', status: 'uploaded' })
    })

    it('should handle upload errors', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      
      server.use(
        rest.post('/api/transcripts/upload', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Invalid file' })
          )
        })
      )

      await expect(uploadTranscript(mockFile)).rejects.toThrow('Invalid file')
    })

    it('should include auth headers', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      let authHeader: string | null = null
      
      server.use(
        rest.post('/api/transcripts/upload', (req, res, ctx) => {
          authHeader = req.headers.get('authorization')
          return res(ctx.status(200), ctx.json({ id: '123' }))
        })
      )

      await uploadTranscript(mockFile)
      
      expect(authHeader).toBeTruthy()
    })
  })
})
```

### 3.6 Unit Test Coverage Targets

| Layer | Coverage Target | Rationale |
|-------|-----------------|-----------|
| **Components** | 90%+ | Critical for UI reliability |
| **Hooks** | 95%+ | Complex logic, high impact |
| **Utilities** | 100% | Pure functions, easy to test |
| **Services** | 85%+ | External dependencies, harder to test |
| **Overall** | 90%+ | Industry standard for critical applications |

---

## 4. Integration Testing Strategy

### 4.1 Philosophy

Integration tests verify that multiple components work together correctly. They should:

- **Test Real Interactions:** Use real component interactions
- **Mock External Services:** Use MSW for API calls
- **Test User Flows:** Focus on complete user journeys
- **Be Fast Enough:** Execute in seconds, not minutes

### 4.2 Flow Testing

#### 4.2.1 Testing Approach

Integration tests for user flows should:

1. **Test Complete Flows:** From start to finish
2. **Use Real Components:** Render actual components, not mocks
3. **Mock APIs:** Use MSW for backend calls
4. **Test State Management:** Verify state changes across components

#### 4.2.2 Flow Test Template

```typescript
// tests/integration/flows/transcript-upload-flow.test.tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranscriptUploadPage } from '@/app/compliance/upload/page'
import { server } from '@/tests/mocks/server'
import { rest } from 'msw'

describe('Transcript Upload Flow - Integration', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('Complete Upload Flow', () => {
    it('should complete full upload flow successfully', async () => {
      const user = userEvent.setup()
      
      // Mock API responses
      server.use(
        rest.post('/api/transcripts/upload', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ id: '123', status: 'uploaded' })
          )
        }),
        rest.get('/api/transcripts/123', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              id: '123',
              status: 'processing',
              progress: 100
            })
          )
        })
      )

      render(<TranscriptUploadPage />)

      // Step 1: Navigate to upload page
      expect(screen.getByRole('heading', { name: /upload transcript/i })).toBeInTheDocument()

      // Step 2: Select file
      const fileInput = screen.getByLabelText(/select transcript/i)
      const file = new File(['%PDF-1.4'], 'transcript.pdf', { type: 'application/pdf' })
      await user.upload(fileInput, file)

      // Step 3: Verify file is selected
      await waitFor(() => {
        expect(screen.getByText(/transcript\.pdf/i)).toBeInTheDocument()
      })

      // Step 4: Click upload button
      const uploadButton = screen.getByRole('button', { name: /upload/i })
      await user.click(uploadButton)

      // Step 5: Verify upload progress
      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument()
      })

      // Step 6: Verify success state
      await waitFor(() => {
        expect(screen.getByText(/upload successful/i)).toBeInTheDocument()
      })

      // Step 7: Verify transcript preview
      await waitFor(() => {
        expect(screen.getByTestId('transcript-preview')).toBeInTheDocument()
      })
    })

    it('should handle upload errors gracefully', async () => {
      const user = userEvent.setup()
      
      server.use(
        rest.post('/api/transcripts/upload', (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({ error: 'Invalid file format' })
          )
        })
      )

      render(<TranscriptUploadPage />)

      const fileInput = screen.getByLabelText(/select transcript/i)
      const file = new File(['content'], 'invalid.pdf', { type: 'application/pdf' })
      await user.upload(fileInput, file)

      const uploadButton = screen.getByRole('button', { name: /upload/i })
      await user.click(uploadButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid file format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Multi-Step Flow', () => {
    it('should handle batch upload flow', async () => {
      const user = userEvent.setup()
      
      server.use(
        rest.post('/api/transcripts/batch-upload', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              batchId: 'batch-123',
              files: [
                { id: '1', status: 'uploaded' },
                { id: '2', status: 'uploaded' }
              ]
            })
          )
        })
      )

      render(<BatchUploadPage />)

      // Upload multiple files
      const fileInput = screen.getByLabelText(/select transcripts/i)
      const files = [
        new File(['%PDF-1.4'], 'transcript1.pdf', { type: 'application/pdf' }),
        new File(['%PDF-1.4'], 'transcript2.pdf', { type: 'application/pdf' })
      ]
      await user.upload(fileInput, files)

      // Verify files are listed
      await waitFor(() => {
        expect(screen.getByText(/2 files selected/i)).toBeInTheDocument()
      })

      // Start batch upload
      const uploadButton = screen.getByRole('button', { name: /upload all/i })
      await user.click(uploadButton)

      // Verify batch progress
      await waitFor(() => {
        expect(screen.getByText(/processing 2 files/i)).toBeInTheDocument()
      })

      // Verify completion
      await waitFor(() => {
        expect(screen.getByText(/batch upload complete/i)).toBeInTheDocument()
      })
    })
  })
})
```

### 4.3 API Integration Testing

#### 4.3.1 Testing Approach

API integration tests verify that the frontend correctly interacts with backend APIs:

1. **Test Request Format:** Verify correct request structure
2. **Test Response Handling:** Verify correct response parsing
3. **Test Error Handling:** Verify error states are handled
4. **Test Authentication:** Verify auth tokens are included

#### 4.3.2 API Integration Test Template

```typescript
// tests/integration/api/transcript-api.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { server } from '@/tests/mocks/server'
import { rest } from 'msw'
import { uploadTranscript, getTranscript, deleteTranscript } from '@/lib/api-client'

describe('Transcript API Integration', () => {
  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('Upload API', () => {
    it('should upload transcript with correct format', async () => {
      const mockFile = new File(['%PDF-1.4'], 'transcript.pdf', { type: 'application/pdf' })
      let receivedFile: File | null = null
      
      server.use(
        rest.post('/api/transcripts/upload', async (req, res, ctx) => {
          receivedFile = await req.formData().then(data => data.get('file') as File)
          return res(
            ctx.status(200),
            ctx.json({ id: '123', status: 'uploaded' })
          )
        })
      )

      const result = await uploadTranscript(mockFile)
      
      expect(receivedFile).toBeTruthy()
      expect(receivedFile?.name).toBe('transcript.pdf')
      expect(result).toEqual({ id: '123', status: 'uploaded' })
    })

    it('should handle network errors', async () => {
      const mockFile = new File(['content'], 'transcript.pdf', { type: 'application/pdf' })
      
      server.use(
        rest.post('/api/transcripts/upload', (req, res, ctx) => {
          return res.networkError('Failed to connect')
        })
      )

      await expect(uploadTranscript(mockFile)).rejects.toThrow()
    })
  })

  describe('Get Transcript API', () => {
    it('should fetch transcript details', async () => {
      server.use(
        rest.get('/api/transcripts/:id', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              id: '123',
              studentName: 'John Doe',
              status: 'processed',
              courses: []
            })
          )
        })
      )

      const result = await getTranscript('123')
      
      expect(result.studentName).toBe('John Doe')
      expect(result.status).toBe('processed')
    })

    it('should handle 404 errors', async () => {
      server.use(
        rest.get('/api/transcripts/:id', (req, res, ctx) => {
          return res(ctx.status(404))
        })
      )

      await expect(getTranscript('999')).rejects.toThrow('Not found')
    })
  })
})
```

### 4.4 Integration Test Coverage Targets

| Flow Type | Coverage Target | Key Scenarios |
|-----------|-----------------|---------------|
| **Critical Flows** (Upload, Review) | 100% | All paths, error states, edge cases |
| **Important Flows** (Dashboard, Mapping) | 90%+ | Main paths, common errors |
| **Secondary Flows** (Settings, Profile) | 75%+ | Basic functionality |
| **API Integration** | 85%+ | All endpoints, error handling |

---

## 5. E2E Testing Strategy

### 5.1 Philosophy

E2E tests verify the application works as expected from the user's perspective. They should:

- **Test Real Browsers:** Use actual browser rendering
- **Test Real Interactions:** Simulate real user behavior
- **Test Critical Paths:** Focus on high-impact user journeys
- **Be Reliable:** Minimize flakiness with proper waits and assertions

### 5.2 Critical User Flows

#### 5.2.1 Transcript Upload Flow

```typescript
// tests/e2e/flows/transcript-upload.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Transcript Upload E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('H2-001-001: Should complete full transcript upload flow', async ({ page }) => {
    // Navigate to upload page
    await page.click('a:has-text("Transcripts")')
    await page.click('a:has-text("Upload")')
    await expect(page).toHaveURL(/\/transcripts\/upload/)

    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'transcript.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 fake pdf content')
    })

    // Verify upload started
    await expect(page.locator('text=Uploading')).toBeVisible()

    // Wait for completion
    await page.waitForSelector('text=Upload successful', { timeout: 10000 })

    // Verify preview
    await expect(page.locator('[data-testid="transcript-preview"]')).toBeVisible()

    // Verify transcript appears in list
    await page.click('a:has-text("View Transcripts")')
    await expect(page.locator('text=transcript.pdf')).toBeVisible()
  })

  test('H2-001-002: Should handle file validation errors', async ({ page }) => {
    await page.goto('/transcripts/upload')

    // Try to upload invalid file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('text content')
    })

    // Verify error message
    await expect(page.locator('text=Invalid file type')).toBeVisible()
  })

  test('H2-001-003: Should handle large file uploads', async ({ page }) => {
    await page.goto('/transcripts/upload')

    // Create large file (5MB)
    const largeBuffer = Buffer.alloc(5 * 1024 * 1024)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'large-transcript.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    })

    // Verify progress indicator
    await expect(page.locator('[role="progressbar"]')).toBeVisible()

    // Wait for completion
    await page.waitForSelector('text=Upload successful', { timeout: 30000 })
  })

  test('H2-001-004: Should support drag and drop upload', async ({ page }) => {
    await page.goto('/transcripts/upload')

    // Create data transfer
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer()
      const file = new File(['%PDF-1.4'], 'dragged.pdf', { type: 'application/pdf' })
      dt.items.add(file)
      return dt
    })

    // Drop file
    const dropZone = page.locator('[data-testid="upload-area"]')
    await dropZone.dispatchEvent('drop', { dataTransfer })

    // Verify file was added
    await expect(page.locator('text=dragged.pdf')).toBeVisible()
  })
})
```

#### 5.2.2 Eligibility Review Flow

```typescript
// tests/e2e/flows/eligibility-review.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Eligibility Review E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('H2-002-001: Should review student eligibility', async ({ page }) => {
    // Navigate to eligibility review
    await page.click('a:has-text("Eligibility")')
    await page.click('a:has-text("Review")')
    await expect(page).toHaveURL(/\/eligibility\/review/)

    // Select student
    await page.click('text=John Doe')

    // View eligibility details
    await expect(page.locator('text=GPA: 3.5')).toBeVisible()
    await expect(page.locator('text=Credits: 90')).toBeVisible()
    await expect(page.locator('text=Status: Eligible')).toBeVisible()

    // View course requirements
    await page.click('button:has-text("View Requirements")')
    await expect(page.locator('text=English 101')).toBeVisible()
    await expect(page.locator('text=Math 201')).toBeVisible()

    // Approve eligibility
    await page.click('button:has-text("Approve")')
    await expect(page.locator('text=Eligibility approved')).toBeVisible()
  })

  test('H2-002-002: Should handle ineligible students', async ({ page }) => {
    await page.goto('/eligibility/review')

    // Select ineligible student
    await page.click('text=Jane Smith')

    // View ineligibility reasons
    await expect(page.locator('text=Status: Ineligible')).toBeVisible()
    await expect(page.locator('text=Reason: GPA below threshold')).toBeVisible()

    // View what-if scenarios
    await page.click('button:has-text("What If")')
    await page.fill('input[placeholder="Projected GPA"]', '3.0')
    await page.click('button:has-text("Calculate")')

    // Verify updated status
    await expect(page.locator('text=Would be eligible')).toBeVisible()
  })

  test('H2-002-003: Should add override notes', async ({ page }) => {
    await page.goto('/eligibility/review/123')

    // Add override
    await page.click('button:has-text("Add Override")')
    await page.fill('textarea[placeholder="Override reason"]', 'Student has extenuating circumstances')
    await page.click('button:has-text("Save Override")')

    // Verify override was added
    await expect(page.locator('text=Override added')).toBeVisible()
    await expect(page.locator('text=Extenuating circumstances')).toBeVisible()
  })
})
```

#### 5.2.3 Compliance Dashboard Flow

```typescript
// tests/e2e/flows/compliance-dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Compliance Dashboard E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('H2-003-001: Should display compliance overview', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Verify dashboard loads
    await expect(page.locator('h1:has-text("Compliance Dashboard")')).toBeVisible()

    // Verify statistics
    await expect(page.locator('text=Total Students:')).toBeVisible()
    await expect(page.locator('text=Eligible:')).toBeVisible()
    await expect(page.locator('text=Ineligible:')).toBeVisible()
    await expect(page.locator('text=Pending Review:')).toBeVisible()

    // Verify charts
    await expect(page.locator('[data-testid="eligibility-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible()
  })

  test('H2-003-002: Should filter compliance data', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Filter by sport
    await page.click('button:has-text("Filter")')
    await page.click('text=Football')
    await page.click('button:has-text("Apply")')

    // Verify filtered results
    await expect(page.locator('text=Football Players')).toBeVisible()

    // Filter by date range
    await page.click('button:has-text("Filter")')
    await page.fill('input[placeholder="Start date"]', '2024-01-01')
    await page.fill('input[placeholder="End date"]', '2024-12-31')
    await page.click('button:has-text("Apply")')

    // Verify date filter applied
    await expect(page.locator('text=Jan 1, 2024 - Dec 31, 2024')).toBeVisible()
  })

  test('H2-003-003: Should export compliance report', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Export report
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export Report")')
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toMatch(/compliance-report.*\.pdf/)
  })
})
```

#### 5.2.4 Course Mapping Flow

```typescript
// tests/e2e/flows/course-mapping.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Course Mapping E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('H2-004-001: Should map transfer courses', async ({ page }) => {
    await page.goto('/compliance/course-mapping')

    // Select student
    await page.click('text=John Doe')

    // View transfer courses
    await expect(page.locator('text=Transfer Courses')).toBeVisible()
    await expect(page.locator('text=ENGL 101 - Introduction to English')).toBeVisible()

    // Map course
    await page.click('button:has-text("Map Course")')
    await page.click('text=English Composition I')
    await page.click('button:has-text("Save Mapping")')

    // Verify mapping saved
    await expect(page.locator('text=Mapping saved')).toBeVisible()
    await expect(page.locator('text=English Composition I')).toBeVisible()
  })

  test('H2-004-002: Should handle unmappable courses', async ({ page }) => {
    await page.goto('/compliance/course-mapping/123')

    // Select unmappable course
    await page.click('text=MATH 999 - Advanced Calculus')

    // Request manual review
    await page.click('button:has-text("Request Review")')
    await page.fill('textarea[placeholder="Reason"]', 'Course not in catalog')
    await page.click('button:has-text("Submit")')

    // Verify review requested
    await expect(page.locator('text=Review requested')).toBeVisible()
  })

  test('H2-004-003: Should bulk map courses', async ({ page }) => {
    await page.goto('/compliance/course-mapping')

    // Select multiple courses
    await page.check('input[value="course-1"]')
    await page.check('input[value="course-2"]')
    await page.check('input[value="course-3"]')

    // Bulk map
    await page.click('button:has-text("Bulk Map")')
    await page.click('text=Auto-map selected')
    await page.click('button:has-text("Confirm")')

    // Verify all mapped
    await expect(page.locator('text=3 courses mapped')).toBeVisible()
  })
})
```

#### 5.2.5 Audit Trail Review Flow

```typescript
// tests/e2e/flows/audit-trail.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Audit Trail Review E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('H2-005-001: Should view audit trail', async ({ page }) => {
    await page.goto('/compliance/audit-trail')

    // Verify audit trail loads
    await expect(page.locator('h1:has-text("Audit Trail")')).toBeVisible()

    // View audit entries
    await expect(page.locator('text=Transcript uploaded')).toBeVisible()
    await expect(page.locator('text=Eligibility approved')).toBeVisible()
    await expect(page.locator('text=Course mapped')).toBeVisible()

    // View entry details
    await page.click('text=Transcript uploaded')
    await expect(page.locator('text=User: admin@example.com')).toBeVisible()
    await expect(page.locator('text=Timestamp:')).toBeVisible()
    await expect(page.locator('text=IP Address:')).toBeVisible()
  })

  test('H2-005-002: Should filter audit trail', async ({ page }) => {
    await page.goto('/compliance/audit-trail')

    // Filter by action type
    await page.click('button:has-text("Filter")')
    await page.click('text=Upload Actions')
    await page.click('button:has-text("Apply")')

    // Verify filtered results
    await expect(page.locator('text=Transcript uploaded')).toBeVisible()
    await expect(page.locator('text=Eligibility approved')).not.toBeVisible()

    // Filter by date range
    await page.click('button:has-text("Filter")')
    await page.fill('input[placeholder="Start date"]', '2024-12-01')
    await page.click('button:has-text("Apply")')

    // Verify date filter
    await expect(page.locator('text=Dec 1, 2024')).toBeVisible()
  })

  test('H2-005-003: Should export audit log', async ({ page }) => {
    await page.goto('/compliance/audit-trail')

    // Export log
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export Log")')
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toMatch(/audit-log.*\.csv/)
  })
})
```

#### 5.2.6 Batch Upload Flow

```typescript
// tests/e2e/flows/batch-upload.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Batch Upload E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('H2-006-001: Should upload batch of transcripts', async ({ page }) => {
    await page.goto('/transcripts/upload/batch')

    // Upload multiple files
    const fileInput = page.locator('input[type="file"][multiple]')
    await fileInput.setInputFiles([
      {
        name: 'transcript1.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 transcript 1')
      },
      {
        name: 'transcript2.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 transcript 2')
      },
      {
        name: 'transcript3.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 transcript 3')
      }
    ])

    // Verify files listed
    await expect(page.locator('text=3 files selected')).toBeVisible()

    // Start batch upload
    await page.click('button:has-text("Upload All")')

    // Verify progress
    await expect(page.locator('text=Processing 3 files')).toBeVisible()

    // Wait for completion
    await page.waitForSelector('text=Batch upload complete', { timeout: 60000 })

    // Verify results
    await expect(page.locator('text=3 files uploaded successfully')).toBeVisible()
  })

  test('H2-006-002: Should handle batch upload errors', async ({ page }) => {
    await page.goto('/transcripts/upload/batch')

    // Upload mix of valid and invalid files
    const fileInput = page.locator('input[type="file"][multiple]')
    await fileInput.setInputFiles([
      {
        name: 'valid.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 valid')
      },
      {
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('invalid')
      }
    ])

    // Start upload
    await page.click('button:has-text("Upload All")')

    // Verify partial success
    await page.waitForSelector('text=1 of 2 files uploaded', { timeout: 30000 })
    await expect(page.locator('text=1 file failed')).toBeVisible()
  })

  test('H2-006-003: Should cancel batch upload', async ({ page }) => {
    await page.goto('/transcripts/upload/batch')

    // Upload files
    const fileInput = page.locator('input[type="file"][multiple]')
    await fileInput.setInputFiles([
      {
        name: 'transcript1.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4')
      },
      {
        name: 'transcript2.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4')
      }
    ])

    // Start upload
    await page.click('button:has-text("Upload All")')

    // Cancel upload
    await page.click('button:has-text("Cancel")')

    // Verify cancellation
    await expect(page.locator('text=Upload cancelled')).toBeVisible()
  })
})
```

### 5.3 Security and Compliance Testing

#### 5.3.1 FERPA Compliance Tests

```typescript
// tests/e2e/security/ferpa-compliance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('FERPA Compliance E2E Tests', () => {
  test('H2-SEC-001: Should protect student data in transit', async ({ page, context }) => {
    // Enable request interception
    await context.route('**/*', route => {
      const request = route.request()
      
      // Verify all requests use HTTPS
      if (request.url().startsWith('http://')) {
        throw new Error('Unencrypted HTTP request detected')
      }
      
      route.continue()
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    // Navigate to student data
    await page.goto('/students/123')
    
    // Verify data is loaded securely
    await expect(page.locator('text=Student Information')).toBeVisible()
  })

  test('H2-SEC-002: Should require authentication for protected resources', async ({ page }) => {
    // Try to access protected resource without login
    await page.goto('/students/123')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('H2-SEC-003: Should log out properly and clear session', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)

    // Logout
    await page.click('button:has-text("Logout")')

    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/)

    // Try to access protected resource
    await page.goto('/students/123')
    await expect(page).toHaveURL(/\/login/)
  })

  test('H2-SEC-004: Should mask sensitive data in audit logs', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await page.goto('/compliance/audit-trail')

    // Verify sensitive data is masked
    await page.click('text=Transcript uploaded')
    
    // SSN should be masked
    await expect(page.locator('text=***-**-****')).toBeVisible()
    
    // Full student ID should not be visible
    await expect(page.locator('text=123-45-6789')).not.toBeVisible()
  })
})
```

#### 5.3.2 Accessibility Tests

```typescript
// tests/e2e/accessibility/wcag-compliance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('WCAG 2.1 Level AA Compliance', () => {
  test('H2-A11Y-001: Should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Check for single h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // Check heading order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    let previousLevel = 0
    
    for (const heading of headings) {
      const level = parseInt(heading.match(/h(\d)/i)?.[1] || '0')
      expect(level).toBeLessThanOrEqual(previousLevel + 1)
      previousLevel = level
    }
  })

  test('H2-A11Y-002: Should have proper ARIA labels', async ({ page }) => {
    await page.goto('/transcripts/upload')

    // Check form inputs have labels
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('aria-label')

    // Check buttons have accessible names
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const hasAccessibleName = await button.evaluate(el => {
        return el.textContent?.trim() || 
               el.getAttribute('aria-label') || 
               el.getAttribute('aria-labelledby')
      })
      expect(hasAccessibleName).toBeTruthy()
    }
  })

  test('H2-A11Y-003: Should be keyboard navigable', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Tab through interactive elements
    const focusableElements = page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const count = await focusableElements.count()
    
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement)
    }
  })

  test('H2-A11Y-004: Should have sufficient color contrast', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Use axe-core to check contrast
    const violations = await page.accessibility.snapshot()
    
    // Filter for contrast violations
    const contrastViolations = violations?.children?.filter(node => 
      node.role === 'text' && 
      node.value?.includes('contrast')
    )

    expect(contrastViolations?.length || 0).toBe(0)
  })

  test('H2-A11Y-005: Should have focus indicators', async ({ page }) {
    await page.goto('/transcripts/upload')

    // Focus on button
    await page.keyboard.press('Tab')
    const button = page.locator('button').first()
    
    // Check for focus indicator
    const hasFocusStyle = await button.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.outline !== 'none' || 
             styles.boxShadow !== 'none' ||
             styles.border !== 'none'
    })
    
    expect(hasFocusStyle).toBe(true)
  })
})
```

### 5.4 Performance Testing

```typescript
// tests/e2e/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Core Web Vitals Performance', () => {
  test('H2-PERF-001: Should meet LCP threshold', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/compliance/dashboard')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // LCP should be under 2.5 seconds
    expect(loadTime).toBeLessThan(2500)
  })

  test('H2-PERF-002: Should meet FID threshold', async ({ page }) => {
    await page.goto('/compliance/dashboard')
    
    const startTime = Date.now()
    await page.click('button:has-text("Filter")')
    const interactionTime = Date.now() - startTime
    
    // FID should be under 100ms
    expect(interactionTime).toBeLessThan(100)
  })

  test('H2-PERF-003: Should meet CLS threshold', async ({ page }) => {
    await page.goto('/compliance/dashboard')
    
    // Monitor layout shifts
    let clsScore = 0
    await page.evaluateOnNewDocument(() => {
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        ;(window as any).__CLS = clsValue
      }).observe({ entryTypes: ['layout-shift'] })
    })

    await page.waitForLoadState('networkidle')
    
    clsScore = await page.evaluate(() => (window as any).__CLS || 0)
    
    // CLS should be under 0.1
    expect(clsScore).toBeLessThan(0.1)
  })

  test('H2-PERF-004: Should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/students')
    
    const startTime = Date.now()
    
    // Scroll through large list
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('PageDown')
      await page.waitForTimeout(100)
    }
    
    const scrollTime = Date.now() - startTime
    
    // Scrolling should be smooth (under 2 seconds)
    expect(scrollTime).toBeLessThan(2000)
  })
})
```

### 5.5 Responsive Design Testing

```typescript
// tests/e2e/responsive/mobile.spec.ts
import { test, expect, devices } from '@playwright/test'

test.describe('Mobile Responsive Design', () => {
  test.use(devices['iPhone 13'])

  test('H2-RESP-001: Should display correctly on mobile', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Verify content is readable
    const fontSize = await page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).fontSize
    })
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16)
  })

  test('H2-RESP-002: Should handle touch interactions', async ({ page }) => {
    await page.goto('/transcripts/upload')

    // Test tap on upload button
    await page.tap('button:has-text("Upload")')
    await expect(page.locator('text=Uploading')).toBeVisible()

    // Test swipe gestures
    await page.goto('/students')
    await page.touchscreen.tap(100, 200)
    await page.touchscreen.swipe(100, 200, 100, 100)
  })
})

test.describe('Tablet Responsive Design', () => {
  test.use(devices['iPad Pro'])

  test('H2-RESP-003: Should display correctly on tablet', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Verify tablet layout
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()

    // Verify content fits
    const contentWidth = await page.locator('[data-testid="main-content"]').evaluate(el => {
      return el.getBoundingClientRect().width
    })
    expect(contentWidth).toBeLessThanOrEqual(1024)
  })
})

test.describe('Desktop Responsive Design', () => {
  test.use(devices['Desktop Chrome'])

  test('H2-RESP-004: Should display correctly on desktop', async ({ page }) => {
    await page.goto('/compliance/dashboard')

    // Verify desktop layout
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()

    // Verify hover states work
    await page.hover('button:has-text("Filter")')
    await expect(page.locator('[data-testid="filter-dropdown"]')).toBeVisible()
  })
})
```

### 5.6 E2E Test Coverage Targets

| Flow Type | Coverage Target | Priority |
|-----------|-----------------|----------|
| **Critical Flows** (Upload, Review) | 100% | P0 |
| **Important Flows** (Dashboard, Mapping) | 90%+ | P1 |
| **Secondary Flows** (Settings, Profile) | 75%+ | P2 |
| **Security/Compliance** | 100% | P0 |
| **Accessibility** | 100% | P0 |
| **Performance** | 80%+ | P1 |
| **Responsive** | 90%+ | P1 |

---

## 6. Mocking Strategy

### 6.1 Mock Service Worker (MSW) Setup

#### 6.1.1 MSW Server Configuration

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// Setup for Vitest
export const setupMSW = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}
```

#### 6.1.2 Common Handlers

```typescript
// tests/mocks/handlers/common.handlers.ts
import { http, HttpResponse } from 'msw'

export const commonHandlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  // Authentication
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    
    if (body.email === 'admin@example.com' && body.password === 'TestPassword123!') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'admin@example.com',
          role: 'admin'
        }
      })
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      id: '1',
      email: 'admin@example.com',
      role: 'admin'
    })
  })
]
```

#### 6.1.3 Transcript Handlers

```typescript
// tests/mocks/handlers/transcript.handlers.ts
import { http, HttpResponse, delay } from 'msw'
import { mockTranscripts } from '../fixtures/transcripts'

export const transcriptHandlers = [
  // Upload transcript
  http.post('/api/transcripts/upload', async ({ request }) => {
    await delay(500) // Simulate network delay
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (file.type !== 'application/pdf') {
      return HttpResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return HttpResponse.json(
        { error: 'File too large' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      id: 'transcript-' + Date.now(),
      filename: file.name,
      status: 'uploaded',
      createdAt: new Date().toISOString()
    })
  }),

  // Get transcript
  http.get('/api/transcripts/:id', ({ params }) => {
    const transcript = mockTranscripts.find(t => t.id === params.id)
    
    if (!transcript) {
      return HttpResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(transcript)
  }),

  // List transcripts
  http.get('/api/transcripts', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const start = (page - 1) * limit
    const end = start + limit
    
    return HttpResponse.json({
      transcripts: mockTranscripts.slice(start, end),
      total: mockTranscripts.length,
      page,
      limit
    })
  }),

  // Delete transcript
  http.delete('/api/transcripts/:id', ({ params }) => {
    const index = mockTranscripts.findIndex(t => t.id === params.id)
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      )
    }
    
    mockTranscripts.splice(index, 1)
    
    return HttpResponse.json({ success: true })
  }),

  // Batch upload
  http.post('/api/transcripts/batch-upload', async ({ request }) => {
    await delay(1000)
    
    const formData = await request.formData()
    const files: File[] = []
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }
    
    const results = files.map(file => ({
      id: 'transcript-' + Date.now() + '-' + Math.random(),
      filename: file.name,
      status: 'uploaded'
    }))
    
    return HttpResponse.json({
      batchId: 'batch-' + Date.now(),
      results,
      total: files.length,
      successful: results.length,
      failed: 0
    })
  })
]
```

#### 6.1.4 Eligibility Handlers

```typescript
// tests/mocks/handlers/eligibility.handlers.ts
import { http, HttpResponse } from 'msw'
import { mockStudents } from '../fixtures/students'

export const eligibilityHandlers = [
  // Get eligibility status
  http.get('/api/eligibility/:studentId', ({ params }) => {
    const student = mockStudents.find(s => s.id === params.studentId)
    
    if (!student) {
      return HttpResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      studentId: student.id,
      studentName: student.name,
      gpa: student.gpa,
      credits: student.credits,
      status: student.gpa >= 2.5 ? 'eligible' : 'ineligible',
      requirements: [
        { name: 'GPA Requirement', met: student.gpa >= 2.5, value: student.gpa, required: 2.5 },
        { name: 'Credit Requirement', met: student.credits >= 24, value: student.credits, required: 24 }
      ]
    })
  }),

  // Update eligibility status
  http.put('/api/eligibility/:studentId', async ({ request, params }) => {
    const body = await request.json()
    const student = mockStudents.find(s => s.id === params.studentId)
    
    if (!student) {
      return HttpResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      ...student,
      status: body.status,
      overrideReason: body.overrideReason,
      updatedAt: new Date().toISOString()
    })
  }),

  // What-if calculation
  http.post('/api/eligibility/what-if', async ({ request }) => {
    const body = await request.json()
    const student = mockStudents.find(s => s.id === body.studentId)
    
    if (!student) {
      return HttpResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    const projectedGPA = body.projectedGPA || student.gpa
    const projectedCredits = body.projectedCredits || student.credits
    
    return HttpResponse.json({
      studentId: student.id,
      currentStatus: student.gpa >= 2.5 ? 'eligible' : 'ineligible',
      projectedStatus: projectedGPA >= 2.5 ? 'eligible' : 'ineligible',
      currentGPA: student.gpa,
      projectedGPA,
      currentCredits: student.credits,
      projectedCredits,
      requirements: [
        { name: 'GPA Requirement', met: projectedGPA >= 2.5, value: projectedGPA, required: 2.5 },
        { name: 'Credit Requirement', met: projectedCredits >= 24, value: projectedCredits, required: 24 }
      ]
    })
  })
]
```

#### 6.1.5 Course Mapping Handlers

```typescript
// tests/mocks/handlers/course-mapping.handlers.ts
import { http, HttpResponse } from 'msw'
import { mockTransferCourses, mockInstitutionCourses } from '../fixtures/courses'

export const courseMappingHandlers = [
  // Get transfer courses
  http.get('/api/course-mapping/transfer/:studentId', ({ params }) => {
    const courses = mockTransferCourses.filter(c => c.studentId === params.studentId)
    return HttpResponse.json(courses)
  }),

  // Get institution courses
  http.get('/api/course-mapping/institution', () => {
    return HttpResponse.json(mockInstitutionCourses)
  }),

  // Map course
  http.post('/api/course-mapping/map', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      id: 'mapping-' + Date.now(),
      transferCourseId: body.transferCourseId,
      institutionCourseId: body.institutionCourseId,
      mappedAt: new Date().toISOString()
    })
  }),

  // Bulk map courses
  http.post('/api/course-mapping/bulk-map', async ({ request }) => {
    const body = await request.json()
    
    const mappings = body.mappings.map((m: any) => ({
      id: 'mapping-' + Date.now() + '-' + Math.random(),
      transferCourseId: m.transferCourseId,
      institutionCourseId: m.institutionCourseId,
      mappedAt: new Date().toISOString()
    }))
    
    return HttpResponse.json({
      mappings,
      total: mappings.length,
      successful: mappings.length,
      failed: 0
    })
  }),

  // Request manual review
  http.post('/api/course-mapping/request-review', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      id: 'review-' + Date.now(),
      transferCourseId: body.transferCourseId,
      reason: body.reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    })
  })
]
```

### 6.2 Mock Data Fixtures

#### 6.2.1 Transcript Fixtures

```typescript
// tests/fixtures/transcripts.ts
export const mockTranscripts = [
  {
    id: 'transcript-1',
    studentId: 'student-1',
    filename: 'john-doe-transcript.pdf',
    status: 'processed',
    uploadedAt: '2024-12-01T10:00:00Z',
    processedAt: '2024-12-01T10:05:00Z',
    courses: [
      { code: 'ENGL 101', name: 'English Composition I', credits: 3, grade: 'A' },
      { code: 'MATH 201', name: 'Calculus I', credits: 4, grade: 'B+' },
      { code: 'HIST 101', name: 'World History', credits: 3, grade: 'A-' }
    ],
    gpa: 3.7,
    totalCredits: 10
  },
  {
    id: 'transcript-2',
    studentId: 'student-2',
    filename: 'jane-smith-transcript.pdf',
    status: 'processed',
    uploadedAt: '2024-12-02T14:30:00Z',
    processedAt: '2024-12-02T14:35:00Z',
    courses: [
      { code: 'ENGL 101', name: 'English Composition I', credits: 3, grade: 'B' },
      { code: 'MATH 201', name: 'Calculus I', credits: 4, grade: 'C+' },
      { code: 'CHEM 101', name: 'General Chemistry', credits: 4, grade: 'B-' }
    ],
    gpa: 2.8,
    totalCredits: 11
  }
]
```

#### 6.2.2 Student Fixtures

```typescript
// tests/fixtures/students.ts
export const mockStudents = [
  {
    id: 'student-1',
    name: 'John Doe',
    email: 'john.doe@example.edu',
    studentId: '12345678',
    sport: 'Football',
    year: 'Junior',
    gpa: 3.7,
    credits: 90,
    status: 'eligible'
  },
  {
    id: 'student-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.edu',
    studentId: '87654321',
    sport: 'Basketball',
    year: 'Sophomore',
    gpa: 2.8,
    credits: 45,
    status: 'ineligible'
  },
  {
    id: 'student-3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.edu',
    studentId: '11223344',
    sport: 'Baseball',
    year: 'Senior',
    gpa: 3.2,
    credits: 120,
    status: 'eligible'
  }
]
```

#### 6.2.3 Course Fixtures

```typescript
// tests/fixtures/courses.ts
export const mockTransferCourses = [
  {
    id: 'transfer-1',
    studentId: 'student-1',
    code: 'ENGL 101',
    name: 'English Composition I',
    credits: 3,
    grade: 'A',
    institution: 'Community College',
    mappedTo: null
  },
  {
    id: 'transfer-2',
    studentId: 'student-1',
    code: 'MATH 201',
    name: 'Calculus I',
    credits: 4,
    grade: 'B+',
    institution: 'State University',
    mappedTo: null
  }
]

export const mockInstitutionCourses = [
  {
    id: 'inst-1',
    code: 'ENG 101',
    name: 'English Composition I',
    credits: 3,
    department: 'English'
  },
  {
    id: 'inst-2',
    code: 'MAT 201',
    name: 'Calculus I',
    credits: 4,
    department: 'Mathematics'
  },
  {
    id: 'inst-3',
    code: 'HIS 101',
    name: 'World History',
    credits: 3,
    department: 'History'
  }
]
```

### 6.3 Mocking Best Practices

1. **Use MSW for All API Calls:** Consistent mocking across unit, integration, and E2E tests
2. **Keep Mocks Realistic:** Mocks should match real API responses
3. **Version Mocks:** Tag mocks with API version for easy updates
4. **Document Mocks:** Add comments explaining what each mock does
5. **Test Error States:** Include mocks for error responses
6. **Use Delays:** Simulate network delays for realistic testing
7. **Reset Between Tests:** Always reset mocks between test runs

---

## 7. Test Data Management

### 7.1 Test Data Strategy

#### 7.1.1 Data Generation

```typescript
// tests/shared/helpers/data-generator.ts
import { faker } from '@faker-js/faker'

export class TestDataGenerator {
  static generateStudent(overrides = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      studentId: faker.string.numeric(8),
      sport: faker.helpers.arrayElement(['Football', 'Basketball', 'Baseball', 'Soccer']),
      year: faker.helpers.arrayElement(['Freshman', 'Sophomore', 'Junior', 'Senior']),
      gpa: faker.number.float({ min: 2.0, max: 4.0, precision: 0.1 }),
      credits: faker.number.int({ min: 0, max: 120 }),
      status: faker.helpers.arrayElement(['eligible', 'ineligible', 'pending']),
      ...overrides
    }
  }

  static generateTranscript(overrides = {}) {
    const student = this.generateStudent()
    return {
      id: faker.string.uuid(),
      studentId: student.id,
      filename: `${student.name.toLowerCase().replace(' ', '-')}-transcript.pdf`,
      status: faker.helpers.arrayElement(['uploaded', 'processing', 'processed', 'failed']),
      uploadedAt: faker.date.recent().toISOString(),
      courses: this.generateCourses(),
      gpa: student.gpa,
      totalCredits: faker.number.int({ min: 3, max: 15 }),
      ...overrides
    }
  }

  static generateCourses(count = 5) {
    return Array.from({ length: count }, () => ({
      code: faker.helpers.arrayElement(['ENGL', 'MATH', 'HIST', 'CHEM', 'PHYS']) + 
             faker.number.int({ min: 100, max: 400 }),
      name: faker.lorem.words(3),
      credits: faker.number.int({ min: 1, max: 4 }),
      grade: faker.helpers.arrayElement(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'])
    }))
  }

  static generateEligibilityReport(overrides = {}) {
    const student = this.generateStudent()
    return {
      studentId: student.id,
      studentName: student.name,
      gpa: student.gpa,
      credits: student.credits,
      status: student.gpa >= 2.5 ? 'eligible' : 'ineligible',
      requirements: [
        { name: 'GPA Requirement', met: student.gpa >= 2.5, value: student.gpa, required: 2.5 },
        { name: 'Credit Requirement', met: student.credits >= 24, value: student.credits, required: 24 },
        { name: 'Progress Requirement', met: student.credits >= 12, value: student.credits, required: 12 }
      ],
      ...overrides
    }
  }
}
```

#### 7.1.2 Test Database Setup

```typescript
// tests/shared/helpers/test-database.ts
import { PrismaClient } from '@aah/database'

export class TestDatabase {
  private static instance: PrismaClient

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
          }
        }
      })
    }
    return this.instance
  }

  static async reset() {
    const db = this.getInstance()
    
    // Delete all data in correct order (respecting foreign keys)
    await db.auditLog.deleteMany()
    await db.courseMapping.deleteMany()
    await db.transferCourse.deleteMany()
    await db.eligibilityOverride.deleteMany()
    await db.eligibilityStatus.deleteMany()
    await db.transcript.deleteMany()
    await db.student.deleteMany()
    await db.user.deleteMany()
  }

  static async seed() {
    const db = this.getInstance()
    
    // Seed test users
    await db.user.createMany({
      data: [
        {
          id: 'user-1',
          email: 'admin@example.com',
          role: 'admin',
          name: 'Admin User'
        },
        {
          id: 'user-2',
          email: 'compliance@example.com',
          role: 'compliance_officer',
          name: 'Compliance Officer'
        }
      ]
    })

    // Seed test students
    await db.student.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        id: `student-${i + 1}`,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@example.edu`,
        studentId: `1000000${i + 1}`,
        sport: ['Football', 'Basketball', 'Baseball'][i % 3],
        year: ['Freshman', 'Sophomore', 'Junior', 'Senior'][i % 4],
        gpa: 2.0 + (i * 0.2),
        credits: i * 12,
        status: i >= 5 ? 'eligible' : 'ineligible'
      }))
    })
  }

  static async cleanup() {
    await this.reset()
    await this.getInstance().$disconnect()
  }
}
```

### 7.2 Test Data Fixtures

#### 7.2.1 FERPA-Compliant Test Data

```typescript
// tests/shared/fixtures/ferpa-compliant-data.ts
/**
 * FERPA-Compliant Test Data
 * 
 * All test data uses synthetic, non-identifiable information.
 * No real student data is used in testing.
 */

export const ferpaCompliantStudents = [
  {
    id: 'test-student-001',
    // Synthetic name - not a real person
    name: 'Alex Testington',
    // Synthetic email - not a real address
    email: 'alex.testington@synthetic-test.edu',
    // Synthetic student ID - not a real ID
    studentId: '900000001',
    sport: 'Football',
    year: 'Junior',
    gpa: 3.5,
    credits: 90,
    status: 'eligible'
  }
]

export const ferpaCompliantTranscripts = [
  {
    id: 'test-transcript-001',
    studentId: 'test-student-001',
    filename: 'synthetic-transcript.pdf',
    status: 'processed',
    // Synthetic course data
    courses: [
      { code: 'TEST 101', name: 'Test Course One', credits: 3, grade: 'A' },
      { code: 'TEST 102', name: 'Test Course Two', credits: 4, grade: 'B+' }
    ],
    gpa: 3.5,
    totalCredits: 7
  }
]
```

### 7.3 Test Data Management Best Practices

1. **Use Synthetic Data:** Never use real student data (FERPA compliance)
2. **Version Fixtures:** Tag fixtures with version numbers
3. **Document Data Schema:** Include JSDoc comments explaining structure
4. **Use Factories:** Use data generators for dynamic test data
5. **Clean Up Between Tests:** Reset database state between test runs
6. **Isolate Test Data:** Each test should have its own data set
7. **Use Transactions:** Wrap test data operations in database transactions

---

## 8. Coverage Targets and Reporting

### 8.1 Coverage Targets

| Layer | Target | Tool | Rationale |
|-------|--------|------|-----------|
| **Components** | 90%+ | Vitest + c8 | UI reliability |
| **Hooks** | 95%+ | Vitest + c8 | Complex logic |
| **Utilities** | 100% | Vitest + c8 | Pure functions |
| **Services** | 85%+ | Vitest + c8 | External deps |
| **Integration** | 80%+ | Vitest + c8 | Flow coverage |
| **E2E** | N/A | Playwright | User paths |
| **Overall** | 90%+ | Vitest + c8 | Industry standard |

### 8.2 Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import next from '@vitest/next'

export default defineConfig({
  plugins: [react(), next()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**'
      ],
      // Per-file thresholds
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      },
      // Per-directory thresholds
      perFile: true,
      // Include uncovered lines in report
      all: true,
      // Clean coverage directory before running
      clean: true
    }
  }
})
```

### 8.3 Coverage Reporting

#### 8.3.1 HTML Report

```bash
# Generate HTML coverage report
npm run test:coverage

# View report
open coverage/index.html
```

#### 8.3.2 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests with coverage
        run: pnpm test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          
      - name: Check coverage thresholds
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 90" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 90% threshold"
            exit 1
          fi
```

### 8.4 Coverage Badges

```markdown
# README.md

## Test Coverage

[![Coverage](https://codecov.io/gh/your-org/academic-compliance-hub-glm/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/academic-compliance-hub-glm)

- **Lines:** 92%
- **Functions:** 91%
- **Branches:** 87%
- **Statements:** 92%
```

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Unit and Integration Tests
  unit-tests:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        app: [admin, main, student]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Setup test database
        run: |
          docker run -d -p 5432:5432 \
            -e POSTGRES_USER=test \
            -e POSTGRES_PASSWORD=test \
            -e POSTGRES_DB=test_db \
            postgres:15-alpine
          
          # Wait for database to be ready
          sleep 5
      
      - name: Run unit tests
        working-directory: ./apps/${{ matrix.app }}
        run: pnpm test:unit
      
      - name: Run integration tests
        working-directory: ./apps/${{ matrix.app }}
        run: pnpm test:integration
      
      - name: Generate coverage report
        working-directory: ./apps/${{ matrix.app }}
        run: pnpm test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/${{ matrix.app }}/coverage/lcov.info
          flags: ${{ matrix.app }}
          name: codecov-${{ matrix.app }}

  # E2E Tests
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps ${{ matrix.browser }}
      
      - name: Setup test database
        run: |
          docker run -d -p 5432:5432 \
            -e POSTGRES_USER=test \
            -e POSTGRES_PASSWORD=test \
            -e POSTGRES_DB=test_db \
            postgres:15-alpine
          sleep 5
      
      - name: Seed test database
        run: pnpm db:seed:test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      
      - name: Run E2E tests
        working-directory: ./apps/admin
        run: pnpm test:e2e --project=${{ matrix.browser }}
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}
          path: apps/admin/playwright-report/
          retention-days: 7
      
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots-${{ matrix.browser }}
          path: apps/admin/test-results/
          retention-days: 7

  # Accessibility Tests
  accessibility-tests:
    name: Accessibility Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Run accessibility tests
        working-directory: ./apps/admin
        run: pnpm test:a11y
      
      - name: Upload accessibility report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-report
          path: apps/admin/accessibility-report/
          retention-days: 30

  # Performance Tests
  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
          urls: |
            http://localhost:3000/compliance/dashboard
            http://localhost:3000/transcripts/upload
            http://localhost:3000/eligibility/review
          budgetPath: ./.github/lighthouse-budget.json
          configPath: ./lighthouse.config.js

  # TestSprite Integration
  testsprite-tests:
    name: TestSprite Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Bootstrap TestSprite
        run: npx @testsprite/testsprite-mcp@latest bootstrap
        env:
          PROJECT_PATH: ${{ github.workspace }}
          LOCAL_PORT: 3000
          TYPE: frontend
          TEST_SCOPE: codebase
      
      - name: Run TestSprite tests
        run: npx @testsprite/testsprite-mcp@latest generate-and-execute
        env:
          PROJECT_NAME: academic-compliance-hub-glm
          PROJECT_PATH: ${{ github.workspace }}
          TEST_IDS: '[]'
          ADDITIONAL_INSTRUCTION: ''
```

### 9.2 Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ],
    "*.{ts,tsx,js,jsx}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

### 9.3 Test Results Dashboard

```typescript
// tests/shared/reporting/test-dashboard.ts
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestResults {
  unit: {
    total: number
    passed: number
    failed: number
    coverage: number
  }
  integration: {
    total: number
    passed: number
    failed: number
    coverage: number
  }
  e2e: {
    total: number
    passed: number
    failed: number
  }
  accessibility: {
    violations: number
    passes: number
  }
  performance: {
    lcp: number
    fid: number
    cls: number
  }
}

export function generateTestDashboard(): void {
  const results: TestResults = {
    unit: parseVitestResults('coverage/coverage-summary.json'),
    integration: parseVitestResults('coverage/coverage-summary.json'),
    e2e: parsePlaywrightResults('playwright-report/results.json'),
    accessibility: parseAxeResults('accessibility-report/axe-results.json'),
    performance: parseLighthouseResults('lighthouse-report/lhr.json')
  }

  const html = generateDashboardHTML(results)
  fs.writeFileSync('test-results/dashboard.html', html)
}

function parseVitestResults(path: string) {
  // Parse Vitest coverage results
  const data = JSON.parse(fs.readFileSync(path, 'utf-8'))
  return {
    total: data.total.lines?.total || 0,
    passed: data.total.lines?.covered || 0,
    failed: (data.total.lines?.total || 0) - (data.total.lines?.covered || 0),
    coverage: data.total.lines?.pct || 0
  }
}

function parsePlaywrightResults(path: string) {
  // Parse Playwright test results
  const data = JSON.parse(fs.readFileSync(path, 'utf-8'))
  return {
    total: data.suites.reduce((acc: number, s: any) => acc + s.specs.length, 0),
    passed: data.suites.reduce((acc: number, s: any) => 
      acc + s.specs.filter((sp: any) => sp.ok).length, 0),
    failed: data.suites.reduce((acc: number, s: any) => 
      acc + s.specs.filter((sp: any) => !sp.ok).length, 0)
  }
}

function generateDashboardHTML(results: TestResults): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Test Results Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .metric { display: inline-block; margin: 10px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .pass { color: green; }
    .fail { color: red; }
    .coverage-bar { width: 200px; height: 20px; background: #eee; border-radius: 10px; overflow: hidden; }
    .coverage-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); }
  </style>
</head>
<body>
  <h1>Test Results Dashboard</h1>
  
  <h2>Unit Tests</h2>
  <div class="metric">
    <div>Total: ${results.unit.total}</div>
    <div class="pass">Passed: ${results.unit.passed}</div>
    <div class="fail">Failed: ${results.unit.failed}</div>
    <div>Coverage: ${results.unit.coverage}%</div>
    <div class="coverage-bar">
      <div class="coverage-fill" style="width: ${results.unit.coverage}%"></div>
    </div>
  </div>
  
  <h2>Integration Tests</h2>
  <div class="metric">
    <div>Total: ${results.integration.total}</div>
    <div class="pass">Passed: ${results.integration.passed}</div>
    <div class="fail">Failed: ${results.integration.failed}</div>
    <div>Coverage: ${results.integration.coverage}%</div>
  </div>
  
  <h2>E2E Tests</h2>
  <div class="metric">
    <div>Total: ${results.e2e.total}</div>
    <div class="pass">Passed: ${results.e2e.passed}</div>
    <div class="fail">Failed: ${results.e2e.failed}</div>
  </div>
  
  <h2>Accessibility</h2>
  <div class="metric">
    <div class="pass">Passes: ${results.accessibility.passes}</div>
    <div class="fail">Violations: ${results.accessibility.violations}</div>
  </div>
  
  <h2>Performance</h2>
  <div class="metric">
    <div>LCP: ${results.performance.lcp}ms</div>
    <div>FID: ${results.performance.fid}ms</div>
    <div>CLS: ${results.performance.cls}</div>
  </div>
</body>
</html>
  `
}
```

---

## 10. TestSprite MCP Server Integration

### 10.1 TestSprite Overview

TestSprite is an AI-powered testing tool that can automatically generate and execute tests based on codebase analysis. It integrates with the MCP (Model Context Protocol) server to provide intelligent test generation capabilities.

### 10.2 Integration Architecture

```mermaid
graph TB
    A[Developer] --> B[VS Code / CLI]
    B --> C[TestSprite MCP Server]
    C --> D[Codebase Analysis]
    D --> E[Test Generation]
    E --> F[Test Execution]
    F --> G[Results Reporting]
    G --> H[Coverage Reports]
    G --> I[Test Dashboard]
    
    C --> J[Frontend Tests]
    C --> K[Backend Tests]
    
    J --> L[Vitest]
    J --> M[Playwright]
    J --> N[React Testing Library]
    
    K --> O[Jest]
    K --> P[Supertest]
```

### 10.3 TestSprite Configuration

#### 10.3.1 Bootstrap Configuration

```typescript
// testsprite.config.ts
export default {
  projectName: 'academic-compliance-hub-glm',
  projectPath: process.cwd(),
  
  // Frontend configuration
  frontend: {
    type: 'frontend',
    localPort: 3000,
    pathname: '',
    testScope: 'codebase',
    
    // Test frameworks
    frameworks: {
      unit: 'vitest',
      integration: 'vitest',
      e2e: 'playwright'
    },
    
    // Critical paths to test
    criticalPaths: [
      '/compliance/dashboard',
      '/transcripts/upload',
      '/eligibility/review',
      '/compliance/course-mapping',
      '/compliance/audit-trail',
      '/transcripts/upload/batch'
    ],
    
    // Components to test
    components: [
      'Button',
      'Card',
      'Dialog',
      'Input',
      'Label',
      'Select',
      'Tabs',
      'DropdownMenu'
    ],
    
    // Testing considerations
    considerations: {
      accessibility: 'WCAG 2.1 Level AA',
      compliance: 'FERPA',
      responsive: true,
      performance: 'Core Web Vitals'
    }
  },
  
  // Backend configuration
  backend: {
    type: 'backend',
    testScope: 'codebase',
    
    // API endpoints to test
    endpoints: [
      '/api/transcripts/*',
      '/api/eligibility/*',
      '/api/course-mapping/*',
      '/api/auth/*'
    ]
  },
  
  // Test generation settings
  generation: {
    // Include login in tests
    needLogin: true,
    
    // Test IDs to generate (empty = all)
    testIds: [],
    
    // Additional instructions
    additionalInstruction: `
      Focus on:
      1. FERPA compliance - ensure student data is protected
      2. Accessibility - test with screen readers and keyboard navigation
      3. Error handling - test all error states
      4. Edge cases - large files, invalid data, network failures
      5. Performance - measure Core Web Vitals
    `
  }
}
```

#### 10.3.2 TestSprite Workflow

```typescript
// scripts/testsprite-bootstrap.ts
import { testspriteBootstrap } from '@testsprite/testsprite-mcp'

async function bootstrapTestSprite() {
  const result = await testspriteBootstrap({
    projectPath: process.cwd(),
    localPort: 3000,
    pathname: '',
    type: 'frontend',
    testScope: 'codebase'
  })
  
  console.log('TestSprite bootstrapped successfully:', result)
}

bootstrapTestSprite()
```

```typescript
// scripts/testsprite-generate.ts
import { testspriteGenerateAndExecute } from '@testsprite/testsprite-mcp'

async function generateAndRunTests() {
  const result = await testspriteGenerateAndExecute({
    projectName: 'academic-compliance-hub-glm',
    projectPath: process.cwd(),
    testIds: [],
    additionalInstruction: `
      Generate comprehensive tests for:
      1. Transcript upload flow (single and batch)
      2. Eligibility review and approval
      3. Compliance dashboard
      4. Course mapping
      5. Audit trail review
      
      Ensure tests cover:
      - FERPA compliance (data protection, access control)
      - WCAG 2.1 Level AA accessibility
      - Responsive design (mobile, tablet, desktop)
      - Core Web Vitals (LCP, FID, CLS)
      - Error handling and edge cases
    `
  })
  
  console.log('Tests generated and executed:', result)
}

generateAndRunTests()
```

### 10.4 TestSprite Integration Points

#### 10.4.1 Package.json Scripts

```json
{
  "scripts": {
    "testsprite:bootstrap": "npx @testsprite/testsprite-mcp@latest bootstrap",
    "testsprite:generate": "npx @testsprite/testsprite-mcp@latest generate-and-execute",
    "testsprite:rerun": "npx @testsprite/testsprite-mcp@latest rerun",
    "testsprite:report": "npx @testsprite/testsprite-mcp@latest generate-report"
  }
}
```

#### 10.4.2 CI/CD Integration

```yaml
# .github/workflows/testsprite.yml
name: TestSprite Tests

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  testsprite:
    name: TestSprite Test Generation
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
      
      - name: Start application
        run: pnpm start &
        env:
          PORT: 3000
      
      - name: Wait for application
        run: sleep 10
      
      - name: Bootstrap TestSprite
        run: pnpm testsprite:bootstrap
        env:
          PROJECT_PATH: ${{ github.workspace }}
          LOCAL_PORT: 3000
          TYPE: frontend
          TEST_SCOPE: codebase
      
      - name: Generate and run tests
        run: pnpm testsprite:generate
        env:
          PROJECT_NAME: academic-compliance-hub-glm
          PROJECT_PATH: ${{ github.workspace }}
          TEST_IDS: '[]'
          ADDITIONAL_INSTRUCTION: |
            Focus on FERPA compliance, accessibility, and performance testing
      
      - name: Upload TestSprite results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: testsprite-results
          path: testsprite_tests/
          retention-days: 30
      
      - name: Generate TestSprite report
        run: pnpm testsprite:report
      
      - name: Upload TestSprite report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: testsprite-report
          path: testsprite-report/
          retention-days: 30
```

### 10.5 TestSprite Test Plan Generation

#### 10.5.1 Frontend Test Plan

```typescript
// testsprite_tests/frontend-test-plan.ts
export const frontendTestPlan = {
  // Authentication tests
  authentication: [
    {
      id: 'AUTH-001',
      name: 'Login with valid credentials',
      priority: 'P0',
      steps: [
        'Navigate to /login',
        'Enter valid email',
        'Enter valid password',
        'Click submit',
        'Verify redirect to dashboard'
      ]
    },
    {
      id: 'AUTH-002',
      name: 'Login with invalid credentials',
      priority: 'P0',
      steps: [
        'Navigate to /login',
        'Enter invalid email',
        'Enter invalid password',
        'Click submit',
        'Verify error message'
      ]
    }
  ],
  
  // Transcript upload tests
  transcriptUpload: [
    {
      id: 'UPLOAD-001',
      name: 'Upload single transcript',
      priority: 'P0',
      steps: [
        'Navigate to /transcripts/upload',
        'Select PDF file',
        'Click upload',
        'Verify progress indicator',
        'Verify success message',
        'Verify transcript preview'
      ]
    },
    {
      id: 'UPLOAD-002',
      name: 'Upload batch transcripts',
      priority: 'P0',
      steps: [
        'Navigate to /transcripts/upload/batch',
        'Select multiple PDF files',
        'Click upload all',
        'Verify batch progress',
        'Verify completion summary'
      ]
    },
    {
      id: 'UPLOAD-003',
      name: 'Validate file type',
      priority: 'P1',
      steps: [
        'Navigate to /transcripts/upload',
        'Select non-PDF file',
        'Click upload',
        'Verify error message'
      ]
    }
  ],
  
  // Eligibility review tests
  eligibilityReview: [
    {
      id: 'ELIG-001',
      name: 'Review eligible student',
      priority: 'P0',
      steps: [
        'Navigate to /eligibility/review',
        'Select eligible student',
        'View eligibility details',
        'View course requirements',
        'Approve eligibility'
      ]
    },
    {
      id: 'ELIG-002',
      name: 'Review ineligible student',
      priority: 'P0',
      steps: [
        'Navigate to /eligibility/review',
        'Select ineligible student',
        'View ineligibility reasons',
        'Run what-if scenario',
        'Add override if needed'
      ]
    }
  ],
  
  // Compliance dashboard tests
  complianceDashboard: [
    {
      id: 'DASH-001',
      name: 'View compliance overview',
      priority: 'P0',
      steps: [
        'Navigate to /compliance/dashboard',
        'Verify statistics display',
        'Verify charts render',
        'Verify data accuracy'
      ]
    },
    {
      id: 'DASH-002',
      name: 'Filter compliance data',
      priority: 'P1',
      steps: [
        'Navigate to /compliance/dashboard',
        'Click filter button',
        'Select sport filter',
        'Apply filter',
        'Verify filtered results'
      ]
    }
  ],
  
  // Course mapping tests
  courseMapping: [
    {
      id: 'MAP-001',
      name: 'Map transfer course',
      priority: 'P0',
      steps: [
        'Navigate to /compliance/course-mapping',
        'Select student',
        'View transfer courses',
        'Map course to institution course',
        'Save mapping'
      ]
    },
    {
      id: 'MAP-002',
      name: 'Bulk map courses',
      priority: 'P1',
      steps: [
        'Navigate to /compliance/course-mapping',
        'Select multiple courses',
        'Click bulk map',
        'Auto-map selected',
        'Verify all mapped'
      ]
    }
  ],
  
  // Audit trail tests
  auditTrail: [
    {
      id: 'AUDIT-001',
      name: 'View audit trail',
      priority: 'P0',
      steps: [
        'Navigate to /compliance/audit-trail',
        'View audit entries',
        'Filter by action type',
        'View entry details'
      ]
    },
    {
      id: 'AUDIT-002',
      name: 'Export audit log',
      priority: 'P1',
      steps: [
        'Navigate to /compliance/audit-trail',
        'Click export button',
        'Verify download',
        'Verify file format'
      ]
    }
  ],
  
  // Accessibility tests
  accessibility: [
    {
      id: 'A11Y-001',
      name: 'WCAG 2.1 Level AA compliance',
      priority: 'P0',
      steps: [
        'Run axe-core scan',
        'Verify no violations',
        'Check color contrast',
        'Verify keyboard navigation',
        'Verify screen reader compatibility'
      ]
    },
    {
      id: 'A11Y-002',
      name: 'Focus management',
      priority: 'P1',
      steps: [
        'Tab through page',
        'Verify focus indicators',
        'Verify focus order',
        'Verify trap focus in modals'
      ]
    }
  ],
  
  // Performance tests
  performance: [
    {
      id: 'PERF-001',
      name: 'Core Web Vitals',
      priority: 'P1',
      steps: [
        'Measure LCP (target < 2.5s)',
        'Measure FID (target < 100ms)',
        'Measure CLS (target < 0.1)',
        'Verify all thresholds met'
      ]
    },
    {
      id: 'PERF-002',
      name: 'Large dataset handling',
      priority: 'P2',
      steps: [
        'Load page with 100+ items',
        'Verify smooth scrolling',
        'Verify virtualization',
        'Measure render time'
      ]
    }
  ],
  
  // Responsive design tests
  responsive: [
    {
      id: 'RESP-001',
      name: 'Mobile layout',
      priority: 'P1',
      steps: [
        'Set viewport to mobile (375x667)',
        'Verify mobile menu',
        'Verify content fits',
        'Verify touch interactions'
      ]
    },
    {
      id: 'RESP-002',
      name: 'Tablet layout',
      priority: 'P1',
      steps: [
        'Set viewport to tablet (768x1024)',
        'Verify tablet layout',
        'Verify content fits',
        'Verify interactions'
      ]
    },
    {
      id: 'RESP-003',
      name: 'Desktop layout',
      priority: 'P1',
      steps: [
        'Set viewport to desktop (1920x1080)',
        'Verify desktop layout',
        'Verify hover states',
        'Verify interactions'
      ]
    }
  ],
  
  // Security tests
  security: [
    {
      id: 'SEC-001',
      name: 'FERPA compliance',
      priority: 'P0',
      steps: [
        'Verify HTTPS in transit',
        'Verify authentication required',
        'Verify data masking in logs',
        'Verify proper logout'
      ]
    },
    {
      id: 'SEC-002',
      name: 'Access control',
      priority: 'P0',
      steps: [
        'Try to access protected resource without auth',
        'Verify redirect to login',
        'Verify role-based access',
        'Verify session timeout'
      ]
    }
  ]
}
```

### 10.6 TestSprite Best Practices

1. **Start with Critical Paths:** Focus on high-impact user flows first
2. **Iterative Generation:** Generate tests in batches, review, and refine
3. **Custom Instructions:** Provide clear, specific instructions for test generation
4. **Review Generated Tests:** Always review and potentially modify generated tests
5. **Combine with Manual Tests:** Use TestSprite for coverage, manual tests for edge cases
6. **Regular Updates:** Re-run TestSprite after significant code changes
7. **Track Coverage:** Monitor test coverage and identify gaps

---

## 11. Implementation Roadmap

### 11.1 Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up testing infrastructure
- Configure test frameworks
- Establish test directory structure

**Tasks:**
- [ ] Install Vitest, React Testing Library, Playwright
- [ ] Configure Vitest for all apps
- [ ] Configure Playwright for E2E tests
- [ ] Set up MSW for API mocking
- [ ] Create test directory structure
- [ ] Set up test database
- [ ] Configure coverage reporting
- [ ] Set up CI/CD pipelines

### 11.2 Phase 2: Unit Tests (Week 3-4)

**Goals:**
- Achieve 90%+ unit test coverage
- Test all UI components
- Test all hooks and utilities

**Tasks:**
- [ ] Write unit tests for all shadcn/ui components
- [ ] Write unit tests for app-specific components
- [ ] Write unit tests for custom hooks
- [ ] Write unit tests for utilities
- [ ] Write unit tests for services
- [ ] Achieve 90%+ coverage target

### 11.3 Phase 3: Integration Tests (Week 5-6)

**Goals:**
- Test critical user flows
- Test API integrations
- Test authentication flows

**Tasks:**
- [ ] Write integration tests for transcript upload flow
- [ ] Write integration tests for eligibility review flow
- [ ] Write integration tests for compliance dashboard
- [ ] Write integration tests for course mapping
- [ ] Write integration tests for audit trail
- [ ] Write integration tests for batch upload

### 11.4 Phase 4: E2E Tests (Week 7-8)

**Goals:**
- Test all critical user paths
- Test cross-browser compatibility
- Test responsive design

**Tasks:**
- [ ] Write E2E tests for transcript upload
- [ ] Write E2E tests for eligibility review
- [ ] Write E2E tests for compliance dashboard
- [ ] Write E2E tests for course mapping
- [ ] Write E2E tests for audit trail
- [ ] Write E2E tests for batch upload
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile, tablet, desktop

### 11.5 Phase 5: Accessibility & Performance (Week 9)

**Goals:**
- Ensure WCAG 2.1 Level AA compliance
- Meet Core Web Vitals thresholds

**Tasks:**
- [ ] Run axe-core accessibility scans
- [ ] Fix all accessibility violations
- [ ] Write accessibility tests
- [ ] Run Lighthouse performance audits
- [ ] Optimize for Core Web Vitals
- [ ] Write performance tests

### 11.6 Phase 6: Security & Compliance (Week 10)

**Goals:**
- Ensure FERPA compliance
- Test security measures

**Tasks:**
- [ ] Write FERPA compliance tests
- [ ] Test data encryption in transit
- [ ] Test access control
- [ ] Test session management
- [ ] Test audit logging
- [ ] Verify data masking

### 11.7 Phase 7: TestSprite Integration (Week 11)

**Goals:**
- Integrate TestSprite MCP server
- Generate additional tests
- Automate test generation

**Tasks:**
- [ ] Bootstrap TestSprite
- [ ] Configure TestSprite for frontend
- [ ] Generate test plan
- [ ] Generate and execute tests
- [ ] Review and refine generated tests
- [ ] Set up TestSprite CI/CD

### 11.8 Phase 8: Documentation & Training (Week 12)

**Goals:**
- Document testing practices
- Train team on testing tools

**Tasks:**
- [ ] Write testing guidelines
- [ ] Create test templates
- [ ] Document test data management
- [ ] Create testing checklist
- [ ] Train team on Vitest
- [ ] Train team on Playwright
- [ ] Train team on TestSprite

---

## 12. Testing Guidelines and Best Practices

### 12.1 General Principles

1. **Test Behavior, Not Implementation:** Focus on what users see and do
2. **Use Accessible Queries:** Prioritize `getByRole`, `getByLabelText`, `getByText`
3. **Avoid Testing Internal State:** Don't test state directly, test rendered output
4. **Keep Tests Independent:** Each test should be able to run in isolation
5. **Make Tests Deterministic:** No random data or external dependencies
6. **Write Descriptive Tests:** Test names should clearly describe what they test
7. **Follow AAA Pattern:** Arrange, Act, Assert
8. **Use Page Objects:** For E2E tests, encapsulate page interactions

### 12.2 Unit Testing Guidelines

```typescript
// ✅ Good: Test user behavior
test('should submit form when valid', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  
  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  })
})

// ❌ Bad: Test implementation details
test('should call handleSubmit when button clicked', () => {
  const handleSubmit = vi.fn()
  render(<LoginForm onSubmit={handleSubmit} />)
  
  fireEvent.click(screen.getByRole('button'))
  
  expect(handleSubmit).toHaveBeenCalled()
})
```

### 12.3 Integration Testing Guidelines

```typescript
// ✅ Good: Test complete flow
test('should complete transcript upload flow', async () => {
  const user = userEvent.setup()
  render(<TranscriptUploadPage />)
  
  await user.upload(screen.getByLabelText('Select file'), mockFile)
  await user.click(screen.getByRole('button', { name: 'Upload' }))
  
  await waitFor(() => {
    expect(screen.getByText('Upload successful')).toBeVisible()
  })
})

// ❌ Bad: Test individual components in isolation
test('should render upload button', () => {
  render(<UploadButton />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### 12.4 E2E Testing Guidelines

```typescript
// ✅ Good: Test real user journey
test('should upload and review transcript', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await page.goto('/transcripts/upload')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(mockFile)
  await page.click('button:has-text("Upload")')
  
  await expect(page.locator('text=Upload successful')).toBeVisible()
})

// ❌ Bad: Test implementation details
test('should call API endpoint', async ({ page, request }) => {
  const response = await request.post('/api/transcripts/upload', {
    data: mockFile
  })
  expect(response.status()).toBe(200)
})
```

### 12.5 Accessibility Testing Guidelines

```typescript
// ✅ Good: Test accessibility
test('should be keyboard navigable', async () => {
  render(<LoginForm />)
  
  await user.tab()
  expect(screen.getByLabelText('Email')).toHaveFocus()
  
  await user.tab()
  expect(screen.getByLabelText('Password')).toHaveFocus()
  
  await user.keyboard('{Enter}')
  expect(mockSubmit).toHaveBeenCalled()
})

// ✅ Good: Test with axe-core
test('should have no accessibility violations', async () => {
  const { container } = render(<Dashboard />)
  const results = await axe(container)
  
  expect(results).toHaveNoViolations()
})
```

### 12.6 Performance Testing Guidelines

```typescript
// ✅ Good: Test performance metrics
test('should meet LCP threshold', async ({ page }) => {
  const startTime = Date.now()
  
  await page.goto('/compliance/dashboard')
  await page.waitForLoadState('networkidle')
  
  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(2500) // 2.5s threshold
})

// ✅ Good: Test with Lighthouse
test('should pass Lighthouse audit', async () => {
  const results = await runLighthouse('http://localhost:3000/compliance/dashboard')
  
  expect(results.accessibility).toBeGreaterThan(90)
  expect(results.performance).toBeGreaterThan(90)
})
```

---

## 13. Maintenance and Evolution

### 13.1 Test Maintenance

1. **Regular Review:** Review tests monthly for relevance and accuracy
2. **Update Fixtures:** Keep test data fixtures up to date
3. **Refactor Tests:** Refactor tests when code changes
4. **Remove Flaky Tests:** Identify and fix flaky tests
5. **Update Documentation:** Keep test documentation current

### 13.2 Test Evolution

1. **Add New Tests:** Add tests for new features immediately
2. **Update Coverage Targets:** Adjust targets as codebase grows
3. **Adopt New Tools:** Evaluate and adopt new testing tools
4. **Improve Performance:** Optimize test execution time
5. **Enhance CI/CD:** Improve CI/CD pipelines

### 13.3 Metrics and KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Code Coverage** | 90%+ | Vitest coverage report |
| **Test Execution Time** | < 5 min (unit), < 10 min (E2E) | CI/CD logs |
| **Flaky Test Rate** | < 1% | Test run history |
| **Test Pass Rate** | > 95% | CI/CD results |
| **Accessibility Score** | 100% | axe-core results |
| **Performance Score** | > 90 | Lighthouse results |

---

## 14. Conclusion

This test architecture provides a comprehensive strategy for ensuring the quality, reliability, and compliance of the Academic Compliance Hub frontend codebase. By following this architecture, the team can:

- **Achieve High Coverage:** 90%+ code coverage across all layers
- **Ensure Compliance:** FERPA and WCAG 2.1 Level AA compliance
- **Maintain Quality:** Fast feedback loops with efficient test execution
- **Scale Effectively:** Automated testing in CI/CD pipelines
- **Leverage AI:** TestSprite integration for intelligent test generation

The architecture is designed to be flexible and evolve with the project, ensuring that testing practices remain effective as the codebase grows and changes.

---

## Appendix A: Quick Reference

### A.1 Common Commands

```bash
# Unit tests
pnpm test              # Run all unit tests
pnpm test:unit         # Run unit tests only
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# Integration tests
pnpm test:integration  # Run integration tests

# E2E tests
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Run E2E tests with UI
pnpm test:e2e:headed   # Run E2E tests in headed mode

# Accessibility tests
pnpm test:a11y         # Run accessibility tests

# Performance tests
pnpm test:perf         # Run performance tests

# TestSprite
pnpm testsprite:bootstrap   # Bootstrap TestSprite
pnpm testsprite:generate    # Generate and run tests
pnpm testsprite:rerun       # Re-run TestSprite tests
```

### A.2 Test File Naming Conventions

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit | `*.test.ts` or `*.test.tsx` | `button.test.tsx` |
| Integration | `*.integration.test.ts` | `upload-flow.integration.test.ts` |
| E2E | `*.spec.ts` | `transcript-upload.spec.ts` |
| Accessibility | `*.a11y.test.ts` | `dashboard.a11y.test.ts` |
| Visual | `*.visual.test.tsx` | `button.visual.test.tsx` |

### A.3 Test Priority Levels

| Priority | Description | Examples |
|----------|-------------|----------|
| **P0** | Critical paths, must pass | Upload, Review, Auth |
| **P1** | Important features, should pass | Dashboard, Mapping |
| **P2** | Nice to have, can fail | Settings, Profile |

---

**Document End**
