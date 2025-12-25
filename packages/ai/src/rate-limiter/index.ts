interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private storage: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(config: RateLimitConfig) {
    this.storage = new Map();
    this.config = config;
    this.cleanupInterval = null;
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.storage.entries()) {
        if (entry.resetTime <= now) {
          this.storage.delete(key);
        }
      }
    }, this.config.windowMs);
  }

  check(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || entry.resetTime <= now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.storage.set(key, newEntry);
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(key?: string): void {
    if (key) {
      this.storage.delete(key);
    } else {
      this.storage.clear();
    }
  }

  getInfo(key: string): { count: number; resetTime: number } | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    return {
      count: entry.count,
      resetTime: entry.resetTime,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }
}

const DEFAULT_RATE_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60 * 1000;

export const aiRateLimiter = new RateLimiter({
  windowMs: DEFAULT_WINDOW_MS,
  maxRequests: DEFAULT_RATE_LIMIT,
});

export async function checkAIRateLimit(identifier: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}> {
  const result = aiRateLimiter.check(identifier);

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetTime: new Date(result.resetTime),
    retryAfter: result.allowed
      ? undefined
      : Math.ceil((result.resetTime - Date.now()) / 1000),
  };
}

export function createRateLimiterMiddleware(options?: {
  keyGenerator?: (request: Request) => string;
  onLimitReached?: (identifier: string, resetTime: Date) => void;
}): (request: Request) => Promise<Response | null> {
  return async (request: Request) => {
    const identifier = options?.keyGenerator
      ? options.keyGenerator(request)
      : (request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        "anonymous");

    const result = await checkAIRateLimit(identifier);

    if (!result.allowed) {
      options?.onLimitReached?.(identifier, result.resetTime);

      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again after ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": DEFAULT_RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": result.resetTime.toISOString(),
            "Retry-After": result.retryAfter?.toString() ?? "60",
          },
        },
      );
    }

    return null;
  };
}

export function extractRateLimitHeaders(
  request: Request,
  result: {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  },
): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", DEFAULT_RATE_LIMIT.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.resetTime.toISOString());

  return headers;
}

export function createRateLimitResponse(
  request: Request,
  result: {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  },
): Response {
  const headers = extractRateLimitHeaders(request, result);

  if (!result.allowed) {
    headers.set("Retry-After", result.retryAfter?.toString() ?? "60");
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: `Too many requests. Please try again after ${result.retryAfter} seconds.`,
      }),
      {
        status: 429,
        headers,
      },
    );
  }

  return new Response(
    JSON.stringify({
      message: "OK",
      rateLimit: {
        remaining: result.remaining,
        resetTime: result.resetTime,
      },
    }),
    {
      status: 200,
      headers,
    },
  );
}
