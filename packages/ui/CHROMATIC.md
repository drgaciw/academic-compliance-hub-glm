# Chromatic Visual Regression Testing

## Overview

This project uses [Chromatic](https://www.chromatic.com/) for visual regression testing integrated with Storybook. Chromatic automatically captures screenshots of component stories and compares them against baselines to detect visual changes.

## Setup

### 1. Chromatic Project Token

To use Chromatic, you need to set up a project token:

1. Create an account at [chromatic.com](https://www.chromatic.com)
2. Connect your GitHub repository
3. Create a new project
4. Copy your project token (starts with `chromatic_`)
5. Add it to your GitHub Secrets as `CHROMATIC_PROJECT_TOKEN`

### 2. Local Development

Add the token to your `.env` file:

```env
CHROMATIC_PROJECT_TOKEN=chromatic_xxx
```

## Usage

### Running Chromatic Locally

```bash
# Run Chromatic with manual review
pnpm chromatic

# Capture baseline snapshots (auto-accept changes)
CHROMATIC_AUTO_ACCEPT=true pnpm chromatic:baselines

# Build only (no upload)
pnpm chromatic:build
```

### Running Storybook

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook static files
pnpm build-storybook
```

## CI/CD Integration

### Automatic Testing

Chromatic runs automatically on:

- Pull requests (detects visual changes)
- Push to `main` (updates baselines)
- Push to `develop` (detects visual changes)

### Approval Workflow

The approval workflow ensures visual changes are reviewed before merging:

1. **Pull Requests**: Chromatic detects changes and requires manual approval
   - Review changes in the Chromatic UI
   - Accept or reject individual changes
   - CI passes only after all changes are approved

2. **Main Branch Push**: Baselines are automatically updated
   - No manual approval required
   - Serves as the new baseline for future changes

### Manual Baseline Capture

To capture baseline snapshots manually:

1. Go to GitHub Actions → "Visual Regression Tests"
2. Select "Capture Baseline Snapshots" workflow
3. Click "Run workflow"
4. This will publish a new build with auto-accept enabled

## Configuration

### Chromatic Config

Located in `packages/ui/.storybook/chromatic.ts`:

```typescript
{
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,
  autoAcceptChanges: process.env.CHROMATIC_AUTO_ACCEPT === "true",
  exitZeroOnChanges: process.env.CHROMATIC_EXIT_ZERO === "true",
  onlyChanged: process.env.CI === "true",
  // ... more options
}
```

### Environment Variables

| Variable                  | Description                         | Default       |
| ------------------------- | ----------------------------------- | ------------- |
| `CHROMATIC_PROJECT_TOKEN` | Your Chromatic project token        | Required      |
| `CHROMATIC_AUTO_ACCEPT`   | Auto-accept changes                 | `false`       |
| `CHROMATIC_EXIT_ZERO`     | Exit with zero code on changes      | `false`       |
| `CI`                      | Indicates running in CI environment | Auto-detected |

## Best Practices

1. **Capture Initial Baselines**: Run baseline capture after major UI changes
2. **Review PRs Promptly**: Keep the Chromatic review queue small
3. **Group Related Changes**: Combine related component updates in one PR
4. **Test Multiple Viewports**: Storybook automatically tests different viewports
5. **Consider Dark Mode**: Ensure components work in both light and dark themes

## Troubleshooting

### Changes Detected But No Visual Difference

- Check if CSS animations are disabled (configured in chromatic.ts)
- Verify no random data in components (use mock data in stories)
- Check for timestamp or date-dependent content

### CI Fails on Changes

- Review and approve changes in Chromatic UI
- Or use `CHROMATIC_EXIT_ZERO=true` for non-blocking checks

### Build Takes Too Long

- Use `onlyChanged: true` (enabled by default in CI)
- Reduce the number of stories per component
- Optimize Storybook configuration

## Resources

- [Chromatic Documentation](https://www.chromatic.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Visual Testing Best Practices](https://www.chromatic.com/docs/best-practices)
