import { randomUUID } from "crypto";

let cachedNonce: string | null = null;
let nonceExpiry: number = 0;
const NONCE_TTL = 1000 * 60 * 5;

export function generateNonce(): string {
  const now = Date.now();

  if (cachedNonce && now < nonceExpiry) {
    return cachedNonce;
  }

  cachedNonce = randomUUID();
  nonceExpiry = now + NONCE_TTL;

  return cachedNonce;
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
  return !!nonce && nonce === cachedNonce;
}

export function clearNonceCache(): void {
  cachedNonce = null;
  nonceExpiry = 0;
}
