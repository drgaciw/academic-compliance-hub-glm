# Preview Deployment Configuration

This document explains how to set up unique preview deployment domains for each pull request using Vercel.

## Overview

Preview deployments are automatically created for each pull request, providing isolated environments for testing changes before merging to production.

## Preview Deployment Structure

### Main App Preview

- **URL Pattern**: `https://aah-git-<branch-name>-<commit-hash>.vercel.app`
- **Example**: `https://aah-git-feature-auth-abc123.vercel.app`

### Student Portal Preview

- **URL Pattern**: `https://student-aah-git-<branch-name>-<commit-hash>.vercel.app`
- **Example**: `https://student-aah-git-feature-auth-abc123.vercel.app`

### Admin Dashboard Preview

- **URL Pattern**: `https://admin-aah-git-<branch-name>-<commit-hash>.vercel.app`
- **Example**: `https://admin-aah-git-feature-auth-abc123.vercel.app`

## Vercel Project Setup

### 1. Configure Multiple Projects

Create separate Vercel projects for each app:

```bash
# Main app
vercel link --yes --project-name aah
vercel env add NEXTAUTH_URL preview
vercel env add COOKIE_DOMAIN preview

# Student portal
vercel link --yes --project-name student-aah
vercel env add NEXT_PUBLIC_STUDENT_URL preview

# Admin dashboard
vercel link --yes --project-name admin-aah
vercel env add NEXT_PUBLIC_ADMIN_URL preview
```

### 2. Environment Variables for Preview

Configure these environment variables for preview deployments:

```bash
# Main App
NEXTAUTH_URL=https://aah-git-{{branch}}-{{hash}}.vercel.app
NEXT_PUBLIC_APP_URL=https://aah-git-{{branch}}-{{hash}}.vercel.app
COOKIE_DOMAIN=.vercel.app
NEXT_PUBLIC_STUDENT_URL=https://student-aah-git-{{branch}}-{{hash}}.vercel.app
NEXT_PUBLIC_ADMIN_URL=https://admin-aah-git-{{branch}}-{{hash}}.vercel.app
ALLOWED_ORIGINS=https://aah-git-{{branch}}-{{hash}}.vercel.app,https://student-aah-git-{{branch}}-{{hash}}.vercel.app,https://admin-aah-git-{{branch}}-{{hash}}.vercel.app
```

### 3. vercel.json Configuration

Each app should have a `vercel.json` file with proper rewrites:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "framework": null,
  "regions": ["iad1"],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

## PR Preview Deployment Workflow

### Automatic Deployment

When a PR is opened or updated:

1. Vercel automatically creates a preview deployment
2. Unique URL is generated based on branch name and commit hash
3. All microsites are deployed with linked preview URLs
4. Environment variables are set for the preview environment
5. CI/CD tests run against the preview deployment

### Manual Preview Deployment

To manually trigger a preview deployment:

```bash
# From any branch
vercel --env=preview

# Or push to a new branch
git checkout -b feature/my-feature
git push origin feature/my-feature
```

## Preview Deployment Features

### 1. Live Updates

- Changes push to PR trigger new preview deployments
- Old previews are kept for 7 days (configurable)
- Latest preview is always available

### 2. Comment Integration

Add comments to PRs to interact with deployments:

```
@vercel redeploy          # Redeploy latest commit
@vercel cancel-preview     # Cancel current preview
@vercel deploy:production # Deploy to production (from main)
```

### 3. Deployment Checks

Vercel adds deployment checks to PRs:

```
✅ Deploy Preview - aah-git-feature-auth-abc123.vercel.app
✅ Deploy Preview - student-aah-git-feature-auth-abc123.vercel.app
✅ Deploy Preview - admin-aah-git-feature-auth-abc123.vercel.app
```

## Cross-Zone Navigation in Preview

To test cross-zone navigation in preview deployments, update zone URLs in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/student/:path*",
      "destination": "https://student-aah-git-{{branch}}-{{hash}}.vercel.app/:path*"
    },
    {
      "source": "/admin/:path*",
      "destination": "https://admin-aah-git-{{branch}}-{{hash}}.vercel.app/:path*"
    }
  ]
}
```

## Testing Preview Deployments

### Playwright Configuration

Update Playwright config to use preview deployment:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
    trace: "on-first-retry",
  },
});
```

### Running Tests on Preview

```bash
# Get preview URL from Vercel
export VERCEL_URL=aah-git-feature-auth-abc123.vercel.app

# Run tests
pnpm test:e2e
```

## Preview Deployment Best Practices

1. **Test Before Merging**: Always test preview deployments thoroughly
2. **Check Environment Variables**: Ensure preview-specific variables are set
3. **Verify Cross-Zone Links**: Test navigation between microsites
4. **Check Auth Flow**: Verify login/logout works across zones
5. **Test API Routes**: Ensure API calls work with preview URLs
6. **Monitor Logs**: Check Vercel logs for preview deployment issues

## Preview Deployment Cleanup

Preview deployments are automatically cleaned up:

- **Default Retention**: 7 days
- **Manual Cleanup**: Can delete from Vercel dashboard
- **On PR Merge**: Preview can be kept or deleted based on settings

## Troubleshooting

### Preview Deployment Fails

Check the following:

- Build logs in Vercel dashboard
- Environment variables are set correctly
- All dependencies are installed
- No syntax errors in code

### Cross-Zone Navigation Issues

If navigation between zones doesn't work:

- Verify `vercel.json` rewrites are correct
- Check `ALLOWED_ORIGINS` includes all preview URLs
- Ensure cookie domain is `.vercel.app` for preview
- Test with CORS headers enabled

### Auth Not Working in Preview

If authentication fails:

- Verify `NEXTAUTH_URL` matches preview URL
- Check OAuth redirect URLs include preview domain
- Ensure cookie domain is set correctly
- Test with production OAuth credentials or test credentials

## Monitoring Preview Deployments

### Vercel Dashboard

Monitor preview deployments at:

- https://vercel.com/[team]/[project]/deployments

### GitHub Status Checks

Check PR status for deployment status:

- ✅ Preview deployment succeeded
- ❌ Preview deployment failed
- ⏳ Preview deployment in progress

### Automated Testing

Configure GitHub Actions to run tests against preview:

```yaml
- name: Run E2E Tests
  run: |
    export VERCEL_URL=${{ steps.deploy.outputs.url }}
    pnpm test:e2e
```

## Summary

Preview deployments provide:

- Isolated testing environments for each PR
- Unique URLs for all microsites
- Automatic creation and updates
- Cross-zone navigation testing
- Integrated with PR workflows
- Easy access via GitHub comments

For more information, see:

- [Vercel Previews](https://vercel.com/docs/deployments/previews)
- [Vercel Environments](https://vercel.com/docs/projects/environment-variables)
- [Vercel Multi-Zone](https://vercel.com/docs/concepts/multi-zones)
