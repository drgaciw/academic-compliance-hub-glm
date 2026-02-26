import { NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const defaultLimits: Record<string, RateLimitConfig> = {
  "api/search": { windowMs: 60000, maxRequests: 30 },
  "api/ai": { windowMs: 60000, maxRequests: 20 },
  "api/transfer-credits": { windowMs: 60000, maxRequests: 10 },
  "api/analytics": { windowMs: 60000, maxRequests: 50 },
  "api/auth": { windowMs: 900000, maxRequests: 5 },
  default: { windowMs: 60000, maxRequests: 100 },
};

// WARNING: This in-memory store does NOT persist across serverless function
// invocations (e.g., Vercel). Each cold start creates a fresh Map, so rate
// limits are effectively per-instance, not global. For production, replace
// with a shared store like Upstash Redis (see packages/api-utils/src/rate-limit.ts).
const store = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitConfig(route: string): RateLimitConfig {
  const normalizedRoute = route.split("/").slice(0, 3).join("/");
  return (
    defaultLimits[normalizedRoute] ||
    defaultLimits[route] ||
    defaultLimits["default"]
  );
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  const key = identifier;

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    // Clean up expired entries periodically to prevent memory leaks.
    // Cap iteration to 100 entries per pass to avoid CPU spikes under DoS.
    if (store.size > 10000) {
      let cleaned = 0;
      for (const [k, v] of store) {
        if (cleaned >= 100) break;
        if (now > v.resetTime) {
          store.delete(k);
          cleaned++;
        }
      }
    }
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, resetTime: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, resetTime: record.resetTime };
}

export function createRateLimitResponse(
  resetTime: number,
  maxRequests: number,
): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later",
        details: {
          retryAfter,
        },
      },
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(resetTime).toISOString(),
        "Retry-After": retryAfter.toString(),
      },
    },
  );
}

export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  maxRequests: number,
  resetTime: number,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(resetTime).toISOString());
  return response;
}

export function isInternalServiceRequest(req: Request): boolean {
  const internalToken = req.headers.get("x-internal-service-token");

  return (
    !!internalToken && internalToken === process.env.INTERNAL_SERVICE_TOKEN
  );
}

export function generateIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
