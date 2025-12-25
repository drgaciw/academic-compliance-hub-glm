# Vercel Log Drains Configuration

This configuration enables automated log forwarding from Vercel to your observability platforms.

## Setup Instructions

### 1. Enable Log Drains via Vercel CLI

```bash
vercel logs add https://sentry.io/api/{SENTRY_PROJECT_ID}/store/ \
  --secret X-Sentry-Auth:${SENTRY_AUTH_TOKEN}
```

### 2. Configure via Vercel Dashboard

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Logs" > "Log Drains"
3. Click "Add Log Drain"
4. Configure each drain:

#### Sentry Log Drain

- **Name**: `sentry-drain`
- **URL**: `https://sentry.io/api/{SENTRY_PROJECT_ID}/store/`
- **Format**: JSON
- **Secret**: Add header `X-Sentry-Auth` with your Sentry auth token

#### Monitoring Service Log Drain

- **Name**: `log-analytics-drain`
- **URL**: `https://{MONITORING_SERVICE_URL}/api/ingest-logs`
- **Format**: NDJSON
- **Secret**: Use `LOG_DRAIN_SECRET` environment variable

### 3. Environment Variables

Add these to your Vercel project environment variables:

```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
SENTRY_PROJECT_ID=xxx
LOG_DRAIN_SECRET=xxx
MONITORING_SERVICE_URL=https://monitoring.yourdomain.com
```

## Log Drain Filters

### Sentry Drain

- **Level**: error, warn
- **Sources**: lambda, edge, build

### Monitoring Service Drain

- **Level**: info, warn, error, debug
- **All sources** included

## Testing

Verify log drains are working by:

1. Deploy to Vercel
2. Trigger some errors (visit a non-existent route)
3. Check Sentry for error events
4. Check your log search interface

## Troubleshooting

### Logs not appearing in Sentry

- Verify SENTRY_AUTH_TOKEN has correct permissions
- Check Log Drain status in Vercel Dashboard
- Ensure `SENTRY_PROJECT_ID` is correct

### High latency

- Reduce filter levels to only include error/warn
- Consider batching logs before sending
- Check drain URL endpoint performance

## Security

- Never commit auth tokens to version control
- Use Vercel Secrets for sensitive values
- Rotate tokens regularly
- Monitor for unauthorized drain access
