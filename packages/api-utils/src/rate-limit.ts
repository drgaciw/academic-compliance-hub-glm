/**
 * Upstash Rate Limiting Middleware
 *
 * Provides rate limiting using Upstash Redis for API endpoints.
 * Supports different limits for different user roles and endpoints.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Default limits
  default: { windowMs: 60 * 1000, maxRequests: 100 },

  // API limits
  api: { windowMs: 60 * 1000, maxRequests: 60 },
  api_auth: { windowMs: 60 * 1000, maxRequests: 20 },
  api_sensitive: { windowMs: 60 * 1000, maxRequests: 10 },

  // Admin limits (higher)
  admin: { windowMs: 60 * 1000, maxRequests: 200 },
  admin_api: { windowMs: 60 * 1000, maxRequests: 120 },

  // AI API limits
  ai: { windowMs: 60 * 1000, maxRequests: 30 },
  ai_upload: { windowMs: 60 * 1000, maxRequests: 5 },

  // Document processing limits
  document_upload: { windowMs: 60 * 1000, maxRequests: 20 },
  document_download: { windowMs: 60 * 1000, maxRequests: 50 },

  // Compliance endpoints
  compliance_api: { windowMs: 60 * 1000, maxRequests: 40 },

  // Webhook endpoints (higher to prevent missing events)
  webhook: { windowMs: 60 * 1000, maxRequests: 1000 },
};

let ratelimit: Ratelimit | null = null;

/**
 * Initialize Upstash Rate Limiter
 */
function initRatelimit() {
  if (ratelimit) {
    return ratelimit;
  }

  const redisUrl = process.env.KV_REST_API_URL;
  const redisToken = process.env.KV_REST_API_TOKEN;

  if (!redisUrl || !redisToken) {
    console.warn(
      "Upstash Redis credentials not found. Rate limiting is disabled.",
    );
    return null;
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      RATE_LIMIT_CONFIGS.default.maxRequests,
      RATE_LIMIT_CONFIGS.default.windowMs + "ms",
    ),
    analytics: true,
    prefix: "aah_ratelimit",
  });

  return ratelimit;
}

/**
 * Get user identifier for rate limiting
 */
function getUserIdentifier(request: NextRequest): string {
  // Check for API key first
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    return `api:${apiKey}`;
  }

  // Check for user ID from session
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  return `ip:${ip}`;
}

/**
 * Get rate limit config for request
 */
function getRateLimitConfig(request: NextRequest): RateLimitConfig {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // API routes
  if (path.startsWith("/api")) {
    // Webhook endpoints
    if (path.includes("webhook")) {
      return RATE_LIMIT_CONFIGS.webhook;
    }

    // Auth endpoints
    if (path.includes("auth")) {
      return RATE_LIMIT_CONFIGS.api_auth;
    }

    // AI endpoints
    if (path.includes("ai")) {
      if (method === "POST" && path.includes("upload")) {
        return RATE_LIMIT_CONFIGS.ai_upload;
      }
      return RATE_LIMIT_CONFIGS.ai;
    }

    // Document endpoints
    if (path.includes("documents")) {
      if (method === "POST" && path.includes("upload")) {
        return RATE_LIMIT_CONFIGS.document_upload;
      }
      if (method === "GET" && path.includes("download")) {
        return RATE_LIMIT_CONFIGS.document_download;
      }
    }

    // Compliance endpoints
    if (path.includes("compliance")) {
      return RATE_LIMIT_CONFIGS.compliance_api;
    }

    return RATE_LIMIT_CONFIGS.api;
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    return RATE_LIMIT_CONFIGS.admin_api;
  }

  // Default
  return RATE_LIMIT_CONFIGS.default;
}

/**
 * Check if user is admin (can be based on headers or session)
 */
function isAdminUser(request: NextRequest): boolean {
  const role = request.headers.get("x-user-role");
  return role === "admin" || role === "compliance_officer";
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const limiter = initRatelimit();

  if (!limiter) {
    // Rate limiting disabled, proceed with request
    return null;
  }

  const identifier = getUserIdentifier(request);
  const config = getRateLimitConfig(request);
  const isAdmin = isAdminUser(request);

  // Use higher limits for admin users
  const effectiveConfig = isAdmin
    ? { ...config, maxRequests: config.maxRequests * 2 }
    : config;

  // Create specific limiter for this config
  const limiterForConfig = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      effectiveConfig.maxRequests,
      effectiveConfig.windowMs + "ms",
    ),
    analytics: true,
    prefix: `aah_ratelimit_${identifier}`,
  });

  const { success, limit, remaining, reset } =
    await limiterForConfig.limit(identifier);

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(reset).toISOString());

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: `Too many requests. Please try again later.`,
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  return null;
}

/**
 * Rate limit error response helper
 */
export function rateLimitErrorResponse(
  limit: number,
  remaining: number,
  reset: Date,
): NextResponse {
  return NextResponse.json(
    {
      error: "Rate limit exceeded",
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((reset.getTime() - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toISOString(),
        "Retry-After": Math.ceil(
          (reset.getTime() - Date.now()) / 1000,
        ).toString(),
      },
    },
  );
}

/**
 * Export configuration for use in other middleware
 */
export { RATE_LIMIT_CONFIGS, type RateLimitConfig };
