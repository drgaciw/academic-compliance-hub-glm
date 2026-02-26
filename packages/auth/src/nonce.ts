import { randomUUID } from "crypto";

// Track the most recently generated nonce for validation within
// the same request lifecycle. CSP nonces MUST be unique per request
// to prevent attackers from predicting or reusing them.
let lastNonce: string | null = null;

export function generateNonce(): string {
  lastNonce = randomUUID();
  return lastNonce;
}

export function getCSPHeader(
  nonce: string,
  isDev: boolean,
  reportUri?: string,
): string {
  const reportDirective = reportUri ? `report-uri ${reportUri}` : "";

  const directives = isDev
    ? [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self' ws://localhost:* wss://localhost:*",
        "media-src 'self' blob: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        reportDirective,
      ].filter(Boolean)
    : [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}'`,
        "img-src 'self' data: blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self' blob: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
        reportDirective,
      ].filter(Boolean);

  return directives.join("; ");
}

export function validateNonce(nonce: string): boolean {
  return !!nonce && nonce === lastNonce;
}

export function clearNonceCache(): void {
  lastNonce = null;
}
