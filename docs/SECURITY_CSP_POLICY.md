# Content Security Policy (CSP) Configuration

## Overview

This document defines the Content Security Policy for the Athletic Academics Hub platform. CSP is a security feature that helps prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks by controlling which resources the browser is allowed to load.

## Policy Strategy

Our CSP policy follows a strict allowlist approach:

- **Inline scripts are BLOCKED** - All JavaScript must be loaded from external files
- **Inline styles are BLOCKED** - All CSS must be loaded from external files
- **Eval() is BLOCKED** - Dynamic code execution is disabled
- **Only allowlisted domains** are permitted for each resource type

## CSP Policy

### Production Policy

```http
Content-Security-Policy: default-src 'self';
  script-src 'self' 'nonce-{random}' https://js.clerk.accounts.dev https://cdn.jsdelivr.net https://www.googletagmanager.com;
  style-src 'self' 'nonce-{random}' https://fonts.googleapis.com https://cdn.jsdelivr.net;
  img-src 'self' data: blob: https://images.clerk.accounts.dev https://*.vercel-storage.com;
  font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
  connect-src 'self' https://*.clerk.accounts.dev https://api.openai.com https://*.vercel.app;
  media-src 'self' blob: data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  report-uri /api/csp-report;
```

### Development Policy

```http
Content-Security-Policy-Report-Only: default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.accounts.dev https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
  img-src 'self' data: blob: https://images.clerk.accounts.dev;
  font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
  connect-src 'self' https://*.clerk.accounts.dev https://api.openai.com ws://localhost:* wss://localhost:*;
  media-src 'self' blob: data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  report-uri /api/csp-report;
```

## Directive Breakdown

### default-src

- **'self'**: Only allow resources from the same origin

### script-src

- **'self'**: Allow scripts from same origin
- **'nonce-{random}'**: Allow inline scripts with valid nonce attribute (used for Clerk)
- **https://js.clerk.accounts.dev**: Clerk authentication scripts
- **https://cdn.jsdelivr.net**: CDN for third-party libraries (Shadcn UI)
- **https://www.googletagmanager.com**: Google Analytics/Tag Manager

### style-src

- **'self'**: Allow stylesheets from same origin
- **'nonce-{random}'**: Allow inline styles with valid nonce (used for dynamic styling)
- **https://fonts.googleapis.com**: Google Fonts stylesheets
- **https://cdn.jsdelivr.net**: CDN for third-party CSS

### img-src

- **'self'**: Allow images from same origin
- **data:**: Allow data URLs for base64 images
- **blob:**: Allow blob URLs for temporary images
- **https://images.clerk.accounts.dev**: Clerk avatar/profile images
- **https://\*.vercel-storage.com**: Vercel Blob storage images

### font-src

- **'self'**: Allow fonts from same origin
- **https://fonts.gstatic.com**: Google Fonts
- **https://cdn.jsdelivr.net**: CDN for icons (Lucide)

### connect-src

- **'self'**: Allow API calls to same origin
- **https://\*.clerk.accounts.dev**: Clerk API calls
- **https://api.openai.com**: OpenAI API calls
- **https://\*.vercel.app**: Cross-origin requests between Vercel apps
- **ws://localhost:\***: WebSocket connections (dev only)
- **wss://localhost:\***: Secure WebSocket connections (dev only)

### media-src

- **'self'**: Allow media from same origin
- **blob:**: Allow blob URLs for video/audio
- **data:**: Allow data URLs for media

### object-src

- **'none'**: Block all plugins (Flash, Java, etc.)

### base-uri

- **'self'**: Restrict base URL to same origin

### form-action

- **'self'**: Restrict form submissions to same origin

### frame-ancestors

- **'none'**: Block embedding in frames/clickjacking protection

### upgrade-insecure-requests

- Upgrade all HTTP requests to HTTPS

### report-uri

- **/api/csp-report**: Send CSP violation reports

## CSP Violation Handling

### Violation Report Endpoint

Create `/api/csp-report` endpoint to log violations:

```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const report = await request.json();

  // Log violation for monitoring
  console.error("CSP Violation:", JSON.stringify(report, null, 2));

  // Send to monitoring service (e.g., Sentry)
  // Sentry.captureMessage('CSP Violation', { extra: report });

  return NextResponse.json({ success: true }, { status: 204 });
}
```

### Common Violations and Fixes

1. **Inline Script Violation**
   - Cause: Using `<script>...</script>` without nonce
   - Fix: Move script to external file or add nonce

2. **Inline Style Violation**
   - Cause: Using `style="..."` attribute
   - Fix: Move to external stylesheet or use className

3. **Eval Violation**
   - Cause: Using `eval()`, `setTimeout(code)`, `new Function(code)`
   - Fix: Rewrite to avoid dynamic code execution

## Implementation

### Next.js Middleware

Implement CSP in middleware:

```typescript
// middleware.ts
import { NextResponse } from "next/server";

const CSP_HEADERS = {
  "Content-Security-Policy": getCSPPolicy(),
};

function getCSPPolicy() {
  const isDev = process.env.NODE_ENV === "development";
  const nonce = crypto.randomUUID();

  if (isDev) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.clerk.accounts.dev",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.clerk.accounts.dev ws://localhost:* wss://localhost:*",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "report-uri /api/csp-report",
    ].join("; ");
  } else {
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://js.clerk.accounts.dev https://cdn.jsdelivr.net https://www.googletagmanager.com`,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://cdn.jsdelivr.net`,
      "img-src 'self' data: blob: https://images.clerk.accounts.dev https://*.vercel-storage.com",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "connect-src 'self' https://*.clerk.accounts.dev https://api.openai.com https://*.vercel.app",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
      "report-uri /api/csp-report",
    ].join("; ");
  }
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", getCSPPolicy());
  return response;
}
```

## Testing CSP

### Test Locally

1. Install CSP Evaluator: `npm install -g csp-evaluator`
2. Test your policy: `csp-evaluator <policy>`

### Browser DevTools

Check Console for CSP violations:

```
[Report Only] Refused to load the script 'https://example.com/script.js'
because it violates the following Content Security Policy directive:
"script-src 'self'"
```

## CSP Best Practices

1. **Start with Report-Only** in development to catch violations without blocking
2. **Use Nonces** for necessary inline scripts instead of 'unsafe-inline'
3. **Regular Review** - Audit CSP quarterly and update allowlist
4. **Monitor Violations** - Set up alerts for CSP violations
5. **Minimize Allowlist** - Only add domains that are absolutely necessary
6. **Version Your Policy** - Track CSP changes in Git with version numbers

## References

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
