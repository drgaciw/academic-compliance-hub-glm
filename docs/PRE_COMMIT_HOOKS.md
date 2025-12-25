# Pre-Commit Hooks Configuration

## Overview

This document describes the pre-commit hooks setup for Track 9.

## Installed Packages

- `lint-staged@^16.2.7`: Run linters on staged files
- `@commitlint/cli@^20.2.0`: Commit message validation
- `@commitlint/config-conventional@^20.2.0`: Conventional commits configuration

## Configuration Files

### lint-staged.config.js

Runs eslint and prettier on staged files only:

- `*.{ts,tsx,js,jsx}`: ESLint with auto-fix + Prettier formatting
- `*.{json,md,yml,yaml}`: Prettier formatting

### commitlint.config.js

Validates commit messages using conventional commits format:

- Valid types: feat, fix, docs, style, refactor, perf, test, chore, revert, ci, build
- Disables subject-case requirement (allows any case)

### .husky/pre-commit

Executes before each commit:

1. Runs lint-staged on staged files (ESLint + Prettier)
2. Runs type-check across the project (Turbo for incremental checks)

### .husky/commit-msg

Validates commit message format using commitlint

## NPM Scripts

### New Scripts

- `type-check:staged`: Runs TypeScript type check with pretty output

## Performance Optimization

The pre-commit hook is optimized to run efficiently (<10s):

- **lint-staged**: Only processes staged files, not entire codebase
- **Turbo**: Uses incremental caching for type-check
- **Parallel execution**: lint-staged runs ESLint and Prettier in parallel
- **No test execution**: Removed from pre-commit to maintain speed (tests run in CI)

## Usage Examples

### Valid Commit Messages

```
feat: add user authentication
fix: resolve memory leak in report generation
docs: update API documentation
chore: upgrade dependencies
test: add unit tests for auth service
```

### Invalid Commit Messages

```
add new feature
Update docs
Fix bug
```

### Pre-commit Workflow

1. Stage files: `git add .`
2. Commit: `git commit -m "feat: add feature"`
3. Hook automatically runs checks:
   - ESLint fixes on staged files
   - Prettier formats staged files
   - TypeScript type checking
   - Commit message validation

## Troubleshooting

### Pre-commit hook fails

- Check the error message for specific issue
- Run `pnpm run lint:fix` to auto-fix linting issues
- Run `pnpm run type-check` to see type errors

### Commit message validation fails

- Follow conventional commits format: `type: description`
- Use one of the valid types listed in commitlint.config.js

### Hook is not running

- Ensure hooks are installed: `pnpm exec husky install`
- Check file permissions (on Unix systems: `chmod +x .husky/*`)
