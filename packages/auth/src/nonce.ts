import { randomUUID } from "crypto";

const NONCE_TTL_MS = 60_000;

// Track active nonces in a Set with expiry timestamps so concurrent requests
// each get their own nonce and don't overwrite each other's state.
const activeNonces = new Map<string, number>();

export function generateNonce(): string {
  const nonce = randomUUID();
  const now = Date.now();
  activeNonces.set(nonce, now + NONCE_TTL_MS);

  // Lazily evict expired nonces (cap iteration to avoid CPU spikes)
  let evicted = 0;
  for (const [key, expiresAt] of activeNonces) {
    if (evicted >= 50) break;
    if (now > expiresAt) {
      activeNonces.delete(key);
      evicted++;
    }
  }

  return nonce;
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
  if (!nonce) return false;
  const expiresAt = activeNonces.get(nonce);
  if (expiresAt === undefined) return false;
  // Consume nonce on validation (single-use)
  activeNonces.delete(nonce);
  return Date.now() <= expiresAt;
}

export function clearNonceCache(): void {
  activeNonces.clear();
}
