# Rollback Procedures

This document provides step-by-step procedures for rolling back deployments in the Athletic Academics Hub (AAH) platform.

## Table of Contents

- [Automated Rollback](#automated-rollback)
- [Manual Rollback via Vercel CLI](#manual-rollback-via-vercel-cli)
- [Manual Rollback via Vercel Dashboard](#manual-rollback-via-vercel-dashboard)
- [Database Rollback](#database-rollback)
- [Post-Rollback Checklist](#post-rollback-checklist)
- [Common Rollback Scenarios](#common-rollback-scenarios)

## Automated Rollback

### Using GitHub Actions Workflow

The fastest way to rollback is using the automated GitHub Actions workflow.

1. Navigate to the repository's Actions tab
2. Select the "Rollback Deployment" workflow
3. Click "Run workflow"
4. Configure parameters:
   - **Environment**: Select target environment (production/staging/preview)
   - **Deployment ID**: Leave empty for latest successful, or specify a deployment ID
   - **Reason**: Provide a reason for the rollback

### Workflow Steps

The automated rollback workflow performs the following:

1. Fetches deployment history for the environment
2. Identifies the target deployment to rollback to
3. Executes rollback for all apps (main, student, admin)
4. Verifies rollback success
5. Runs health checks
6. Creates a rollback record
7. Notifies team
8. Creates GitHub issue for post-mortem (production only)

## Manual Rollback via Vercel CLI

### Prerequisites

- Install Vercel CLI: `npm i -g vercel`
- Authenticate: `vercel login`
- Link project: `vercel link`

### Rollback Commands

#### Rollback to Previous Deployment

```bash
# Production
vercel rollback --prod

# Staging
vercel rollback

# Preview deployment
vercel rollback <deployment-url>
```

#### Rollback to Specific Deployment

```bash
# List deployments
vercel ls --prod

# Rollback to specific deployment
vercel rollback <deployment-id> --prod
```

#### Rollback Individual Apps

```bash
# Main app
cd apps/main
vercel rollback --prod

# Student app
cd apps/student
vercel rollback --prod

# Admin app
cd apps/admin
vercel rollback --prod
```

## Manual Rollback via Vercel Dashboard

### Step-by-Step Instructions

1. Navigate to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the AAH project
3. Go to the "Deployments" tab
4. Find the deployment you want to rollback to
5. Click the "..." menu on that deployment
6. Select "Promote to Production" or "Promote to Staging"

### Verification Steps

After promoting, verify:

1. Check deployment status is "Ready"
2. Visit production URL
3. Test critical user flows
4. Check error logs
5. Verify database migrations haven't caused issues

## Database Rollback

### Prerequisites

- Access to production database
- Backup of current state
- Understanding of migration changes

### Rollback Prisma Migrations

```bash
# View migration history
pnpm --filter @aah/database db:migrate:status

# Rollback specific migration
pnpm --filter @aah/database db:migrate:reset --force

# Apply specific migration
pnpm --filter @aah/database db:migrate:apply <migration-name>
```

### Manual Database Changes

If manual schema changes were made:

1. Take database backup: `pg_dump database_url > backup.sql`
2. Connect to database: `pnpm --filter @aah/database db:studio`
3. Manually revert changes
4. Verify data integrity
5. Test application with reverted schema

### Important Notes

- Always backup before rollback
- Test rollback on staging first
- Document any data loss scenarios
- Consider data migrations for complex rollbacks

## Post-Rollback Checklist

After completing any rollback, complete these steps:

### Immediate Actions

- [ ] Verify all apps are deployed and healthy
- [ ] Test critical user flows (login, dashboard, course view)
- [ ] Check error rates and logs
- [ ] Verify database connectivity
- [ ] Check external integrations (auth, payments, etc.)

### Monitoring (Next 2 Hours)

- [ ] Monitor error rates (Sentry)
- [ ] Monitor performance metrics (Vercel Analytics)
- [ ] Check user feedback channels
- [ ] Verify cache invalidation
- [ ] Check CDN propagation

### Documentation

- [ ] Create rollback record in issue tracker
- [ ] Document root cause analysis
- [ ] Update this document with lessons learned
- [ ] Share findings with team

### Follow-up (Next 24 Hours)

- [ ] Schedule post-mortem meeting
- [ ] Fix underlying issues
- [ ] Add tests to prevent regression
- [ ] Update monitoring/alerting rules
- [ ] Communicate with stakeholders

## Common Rollback Scenarios

### Scenario 1: Critical Bug in Production

**Symptoms**: High error rate, user reports, broken core functionality

**Action**: Immediate rollback to previous stable version

**Steps**:

1. Trigger automated rollback workflow
2. Monitor for 30 minutes
3. Investigate root cause
4. Create hotfix branch
5. Fix and test
6. Deploy hotfix

### Scenario 2: Performance Degradation

**Symptoms**: Slow page loads, high latency, timeouts

**Action**: Rollback if performance is critically impacted

**Steps**:

1. Check performance metrics (Vercel Analytics, Speed Insights)
2. Identify performance regression point
3. Rollback if >50% degradation
4. Profile and optimize before redeploy

### Scenario 3: Database Migration Failure

**Symptoms**: Database errors, data integrity issues

**Action**: Rollback database and application

**Steps**:

1. Stop application deployment
2. Rollback database migrations
3. Restore from backup if needed
4. Rollback application code
5. Fix migration script
6. Test on staging
7. Redeploy carefully

### Scenario 4: Third-Party Integration Failure

**Symptoms**: External API errors, authentication failures

**Action**: May not need rollback - check integration first

**Steps**:

1. Check third-party service status
2. Verify API keys and configuration
3. Check rate limits
4. Only rollback if our code caused the issue
5. Otherwise, wait for third-party fix

### Scenario 5: Security Vulnerability

**Symptoms**: Security scan alerts, reported vulnerabilities

**Action**: Rollback if critical vulnerability

**Steps**:

1. Assess vulnerability severity
2. Check for evidence of exploitation
3. Rollback to secure version if critical
4. Patch vulnerability
5. Perform security audit
6. Deploy fix

## Rollback Decision Tree

```
Is production affected?
├─ Yes
│  └─ Is it critical (high error rate, broken core functionality)?
│     ├─ Yes → IMMEDIATE ROLLBACK
│     └─ No → Monitor 15 minutes, then decide
└─ No
   └─ Is it staging/preview?
      └─ Can fix quickly (< 30 minutes)?
         ├─ Yes → Fix in place
         └─ No → Rollback for stability
```

## Emergency Contacts

- On-call DevOps: [Contact info]
- Engineering Lead: [Contact info]
- Product Owner: [Contact info]

## Related Documentation

- [Deployment Workflow](../.github/workflows/production-deploy.yml)
- [Monitoring & Observability](../docs/monitoring/README.md)
- [Incident Response Plan](../docs/incident-response.md)

## Version History

| Date       | Version | Changes                  |
| ---------- | ------- | ------------------------ |
| 2025-01-09 | 1.0     | Initial document created |
