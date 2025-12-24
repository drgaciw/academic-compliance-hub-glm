# Testing Guide

This guide provides comprehensive information on how to run tests, interpret coverage reports, and troubleshoot common issues for the Academic Compliance Hub frontend codebase.

## Table of Contents

- [Quick Start](#quick-start)
- [Running Tests Locally](#running-tests-locally)
- [Running Tests with Coverage](#running-tests-with-coverage)
- [Interpreting Coverage Reports](#interpreting-coverage-reports)
- [CI/CD Integration](#cicd-integration)
- [TestSprite Integration](#testsprite-integration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm 8+ installed
- All dependencies installed (`pnpm install`)

### Run All Tests

```bash
# Run all tests across the monorepo
pnpm test

# Run all tests with coverage
pnpm test:coverage
```

---

## Running Tests Locally

### Unit Tests

Unit tests test individual components, hooks, utilities, and services in isolation.

#### Run Unit Tests for All Apps

```bash
# Run unit tests for all apps and packages
pnpm test:unit
```

#### Run Unit Tests for Specific App

```bash
# Admin app
cd apps/admin
pnpm test:unit

# Main app
cd apps/main
pnpm test:unit

# Student app
cd apps/student
pnpm test:unit

# UI package
cd packages/ui
pnpm test:unit
```

#### Run Unit Tests in Watch Mode

Watch mode automatically re-runs tests when files change.

```bash
# Watch mode for all apps
pnpm test:watch

# Watch mode for specific app
cd apps/admin
pnpm test:watch
```

#### Run Unit Tests with UI

Vitest UI provides a visual interface for running and debugging tests.

```bash
# UI mode for all apps
pnpm test:ui

# UI mode for specific app
cd apps/admin
pnpm test:ui
```

### Integration Tests

Integration tests verify that multiple components work together correctly.

```bash
# Run integration tests for all apps
pnpm test:integration

# Run integration tests for specific app
cd apps/admin
pnpm test:integration
```

### E2E Tests

E2E (End-to-End) tests verify the application works as expected from the user's perspective using real browsers.

#### Run E2E Tests

```bash
# Run E2E tests (admin app only has Playwright configured)
cd apps/admin
pnpm test:e2e
```

#### Run E2E Tests with UI

```bash
cd apps/admin
pnpm test:e2e:ui
```

#### Run E2E Tests in Headed Mode

```bash
cd apps/admin
pnpm test:e2e:headed
```

---

## Running Tests with Coverage

### Generate Coverage Reports

Coverage reports show how much of your code is tested.

```bash
# Generate coverage for all apps
pnpm test:coverage

# Generate coverage for specific app
cd apps/admin
pnpm test:coverage
```

### Coverage Report Formats

Coverage reports are generated in multiple formats:

| Format | Location | Description |
|---------|-----------|-------------|
| **Text** | Terminal output | Summary printed to console |
| **HTML** | `coverage/index.html` | Interactive HTML report |
| **JSON** | `coverage/coverage-final.json` | Machine-readable JSON |
| **LCOV** | `coverage/lcov.info` | For Codecov and other tools |
| **JSON Summary** | `coverage/coverage-summary.json` | Quick summary in JSON |

### View HTML Coverage Report

```bash
# Generate coverage
pnpm test:coverage

# Open HTML report (macOS)
open apps/admin/coverage/index.html

# Open HTML report (Linux)
xdg-open apps/admin/coverage/index.html

# Open HTML report (Windows)
start apps/admin/coverage/index.html
```

---

## Interpreting Coverage Reports

### Coverage Metrics

Coverage reports include the following metrics:

| Metric | Description | Target |
|---------|-------------|---------|
| **Lines** | Percentage of executable lines covered | 90%+ |
| **Functions** | Percentage of functions called | 90%+ |
| **Branches** | Percentage of conditional branches covered | 85%+ |
| **Statements** | Percentage of statements executed | 90%+ |

### Coverage Targets by Layer

| Layer | Target | Rationale |
|--------|---------|-----------|
| **Components** | 90%+ | UI reliability |
| **Hooks** | 95%+ | Complex logic, high impact |
| **Utilities** | 100% | Pure functions, easy to test |
| **Services** | 85%+ | External dependencies, harder to test |
| **Overall** | 90%+ | Industry standard for critical applications |

### Reading the HTML Report

1. Open `coverage/index.html` in your browser
2. Navigate through the directory structure
3. Click on files to see detailed coverage
4. **Green** lines are covered, **Red** lines are not covered
5. **Yellow** lines are partially covered (some branches not executed)

### Reading the Text Summary

```
% Coverage report from v8
--------------------------
----------|---------|---------|---------|---------|---------|
File      | % Stmts | % Branch | % Funcs | % Lines |
----------|---------|---------|---------|---------|---------|
All files |    92.5 |     87.3 |    91.2 |    92.5 |
----------|---------|---------|---------|---------|---------|
```

- **% Stmts**: Statement coverage
- **% Branch**: Branch coverage
- **% Funcs**: Function coverage
- **% Lines**: Line coverage

### Improving Coverage

1. **Identify Uncovered Code**: Use the HTML report to find red lines
2. **Write Tests**: Add tests for uncovered code paths
3. **Test Edge Cases**: Ensure all branches are covered
4. **Test Error States**: Don't forget error handling paths
5. **Re-run Coverage**: Verify improvements

---

## CI/CD Integration

### GitHub Actions Workflow

The project uses GitHub Actions for automated testing. The workflow (`.github/workflows/test.yml`) runs on:

- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop` branches

### CI Jobs

| Job | Description | Matrix |
|------|-------------|---------|
| **unit-tests** | Unit and integration tests | admin, main, student, ui |
| **e2e-tests** | E2E tests with Playwright | chromium, firefox, webkit |
| **accessibility-tests** | WCAG 2.1 AA compliance | - |
| **performance-tests** | Lighthouse performance audits | - |
| **testsprite-tests** | AI-powered test generation | - |
| **coverage-summary** | Aggregate coverage results | - |

### Coverage Thresholds in CI

The CI pipeline will fail if coverage drops below 90%:

```yaml
- name: Check coverage thresholds
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 90" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 90% threshold"
      exit 1
    fi
```

### Codecov Integration

Coverage reports are automatically uploaded to Codecov:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
```

### Viewing CI Results

1. Go to the **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. View job logs and artifacts
4. Download coverage artifacts for detailed analysis

---

## TestSprite Integration

TestSprite is an AI-powered testing tool that automatically generates and executes tests.

### Bootstrap TestSprite

Initialize TestSprite for the project:

```bash
npx @testsprite/testsprite-mcp@latest bootstrap
```

### Generate and Run Tests

Generate tests based on codebase analysis:

```bash
npx @testsprite/testsprite-mcp@latest generate-and-execute
```

### Re-run TestSprite Tests

Re-run previously generated tests:

```bash
npx @testsprite/testsprite-mcp@latest rerun
```

### TestSprite Configuration

Configuration is defined in `testsprite.config.ts`:

```typescript
export default {
  projectName: 'academic-compliance-hub-glm',
  frontend: {
    type: 'frontend',
    localPort: 3000,
    testScope: 'codebase',
    criticalPaths: [
      '/compliance/dashboard',
      '/transcripts/upload',
      '/eligibility/review'
    ],
    considerations: {
      accessibility: 'WCAG 2.1 Level AA',
      compliance: 'FERPA',
      responsive: true,
      performance: 'Core Web Vitals'
    }
  }
}
```

### TestSprite in CI

TestSprite runs automatically in CI on a schedule:

```yaml
testsprite-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Bootstrap TestSprite
      run: npx @testsprite/testsprite-mcp@latest bootstrap
    
    - name: Generate and run tests
      run: npx @testsprite/testsprite-mcp@latest generate-and-execute
```

---

## Troubleshooting

### Common Issues

#### Tests Fail with "Module not found"

**Problem**: Tests fail with module resolution errors.

**Solution**:
1. Check `vitest.config.ts` alias configuration
2. Ensure all workspace packages are linked
3. Run `pnpm install` to refresh dependencies

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Coverage Reports Not Generated

**Problem**: Coverage reports are not created after running tests.

**Solution**:
1. Ensure `@vitest/coverage-v8` is installed
2. Check `coverage` configuration in `vitest.config.ts`
3. Verify `--coverage` flag is used

```bash
# Install coverage provider
pnpm add -D @vitest/coverage-v8

# Run with coverage
pnpm test:coverage
```

#### Tests Timeout in CI

**Problem**: Tests timeout in CI but pass locally.

**Solution**:
1. Increase timeout in `vitest.config.ts`
2. Check for flaky tests (non-deterministic)
3. Ensure proper cleanup in `afterEach` hooks

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
    hookTimeout: 10000,
  }
})
```

#### E2E Tests Fail with "Element not found"

**Problem**: Playwright can't find elements.

**Solution**:
1. Use proper waits (`waitFor`, `waitForSelector`)
2. Check for dynamic content loading
3. Verify selectors are correct

```typescript
// Use waitFor instead of immediate assertion
await page.waitForSelector('button[type="submit"]')
await page.click('button[type="submit"]')
```

#### Coverage Below Threshold

**Problem**: Coverage is below the 90% threshold.

**Solution**:
1. Identify uncovered files in HTML report
2. Add tests for uncovered code paths
3. Test error states and edge cases
4. Consider if code is dead (can be removed)

```bash
# View coverage report
open coverage/index.html

# Look for red lines (uncovered)
# Write tests for those lines
```

#### Playwright Browsers Not Found

**Problem**: Playwright can't find browsers.

**Solution**:
1. Install Playwright browsers

```bash
# Install all browsers
pnpm exec playwright install

# Install specific browser
pnpm exec playwright install chromium
```

#### Tests Run Slowly

**Problem**: Tests take too long to run.

**Solution**:
1. Use `vi.mock()` for external dependencies
2. Avoid unnecessary `waitFor` calls
3. Run tests in parallel (Vitest does this by default)
4. Use `test.concurrent()` for independent tests

```typescript
// Run tests concurrently
test.concurrent('should handle multiple requests', async () => {
  // Test code
})
```

### Debugging Tests

#### Debug with Vitest UI

```bash
# Run tests with UI
pnpm test:ui

# Click on a test to see:
# - Test code
# - Component output
# - Console logs
```

#### Debug with Playwright Inspector

```bash
# Run Playwright in debug mode
npx playwright codegen

# This opens a browser and records interactions
# Use it to find correct selectors
```

#### Debug with Console Logs

```typescript
// Add console.log in tests
test('should render button', () => {
  console.log('Rendering button...')
  render(<Button>Click me</Button>)
  console.log('Button rendered')
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### Getting Help

If you encounter issues not covered here:

1. Check the [Test Architecture Document](./test-architecture.md)
2. Review [Vitest Documentation](https://vitest.dev/)
3. Review [Playwright Documentation](https://playwright.dev/)
4. Check [TestSprite Documentation](https://testsprite.dev/)
5. Open an issue in the project repository

---

## Best Practices

### Writing Tests

1. **Test Behavior, Not Implementation**: Focus on what users see and do
2. **Use Accessible Queries**: Prioritize `getByRole`, `getByLabelText`, `getByText`
3. **Keep Tests Independent**: Each test should run in isolation
4. **Use Descriptive Names**: Test names should clearly describe what they test
5. **Follow AAA Pattern**: Arrange, Act, Assert

### Maintaining Coverage

1. **Write Tests First**: Test-driven development ensures coverage
2. **Test Edge Cases**: Don't forget error states
3. **Review Coverage Regularly**: Check coverage reports after each PR
4. **Remove Dead Code**: Delete unused code instead of writing tests for it

### CI/CD Best Practices

1. **Run Tests Locally First**: Ensure tests pass before pushing
2. **Keep Tests Fast**: Slow tests slow down development
3. **Fix Flaky Tests**: Non-deterministic tests waste CI time
4. **Monitor Coverage**: Watch for coverage drops in PRs

---

## Additional Resources

- [Test Architecture Document](./test-architecture.md) - Comprehensive test strategy
- [Vitest Documentation](https://vitest.dev/) - Testing framework docs
- [React Testing Library](https://testing-library.com/react) - Component testing
- [Playwright Documentation](https://playwright.dev/) - E2E testing
- [TestSprite](https://testsprite.dev/) - AI-powered testing
- [Codecov](https://codecov.io/) - Coverage reporting
