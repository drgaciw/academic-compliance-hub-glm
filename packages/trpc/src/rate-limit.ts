import { TRPCError } from "@trpc/server";
import { logger } from "./middleware";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 100,
  skipSuccessfulRequests: false,
};

const rateLimitStore = new Map<string, RateLimitStore>();

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60000);

export interface EndpointLimit {
  windowMs: number;
  maxRequests: number;
}

const endpointLimits: Record<string, EndpointLimit> = {
  "courseMapping.getCourseEquivalency": {
    windowMs: 60000,
    maxRequests: 50,
  },
  "courseMapping.searchCourses": {
    windowMs: 60000,
    maxRequests: 30,
  },
  "courseMapping.requestEquivalencyReview": {
    windowMs: 60000,
    maxRequests: 10,
  },
  "courseMapping.bulkImportMappings": {
    windowMs: 3600000,
    maxRequests: 5,
  },
  "reportService.generateReport": {
    windowMs: 60000,
    maxRequests: 20,
  },
  "reportService.batchGenerateReports": {
    windowMs: 3600000,
    maxRequests: 3,
  },
  "reportService.getReportStatus": {
    windowMs: 60000,
    maxRequests: 100,
  },
  "reportService.downloadReport": {
    windowMs: 60000,
    maxRequests: 50,
  },
  "compliance.checkEligibility": {
    windowMs: 60000,
    maxRequests: 30,
  },
  "advising.getCourseRecommendations": {
    windowMs: 60000,
    maxRequests: 40,
  },
};

export function getEndpointLimits(): Record<string, EndpointLimit> {
  return endpointLimits;
}

export function setEndpointLimit(
  endpoint: string,
  config: EndpointLimit,
): void {
  endpointLimits[endpoint] = config;
  logger.info(`Updated rate limit for endpoint: ${endpoint}`, {
    windowMs: config.windowMs,
    maxRequests: config.maxRequests,
  });
}

export function rateLimitMiddleware(options?: Partial<RateLimitConfig>) {
  const config: RateLimitConfig = { ...defaultConfig, ...options };

  return async ({ ctx, next }: any) => {
    const userId = ctx.user?.id || "anonymous";
    const path = ctx._req?.path || "unknown";
    const key = `${userId}:${path}`;

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }

    entry.count++;

    const endpointKey = Object.keys(endpointLimits).find((k) =>
      path.includes(k.replace(".", "/")),
    );

    const limit = endpointKey ? endpointLimits[endpointKey] : null;

    if (limit) {
      if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + limit.windowMs;
        return next();
      }

      if (entry.count > limit.maxRequests) {
        logger.warn("Rate limit exceeded", {
          userId,
          path,
          count: entry.count,
          limit: limit.maxRequests,
          resetTime: new Date(entry.resetTime).toISOString(),
        });

        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
          cause: {
            limit: limit.maxRequests,
            resetTime: new Date(entry.resetTime).toISOString(),
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
        });
      }
    } else {
      if (entry.count > config.maxRequests) {
        logger.warn("Rate limit exceeded", {
          userId,
          path,
          count: entry.count,
          limit: config.maxRequests,
          resetTime: new Date(entry.resetTime).toISOString(),
        });

        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please try again later.",
          cause: {
            limit: config.maxRequests,
            resetTime: new Date(entry.resetTime).toISOString(),
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
        });
      }
    }

    return next();
  };
}

export function strictRateLimitMiddleware(config: EndpointLimit) {
  return async ({ ctx, next }: any) => {
    const userId = ctx.user?.id || "anonymous";
    const path = ctx._req?.path || "unknown";
    const key = `${userId}:${path}`;

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }

    entry.count++;

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + config.windowMs;
      return next();
    }

    if (entry.count > config.maxRequests) {
      logger.warn("Strict rate limit exceeded", {
        userId,
        path,
        count: entry.count,
        limit: config.maxRequests,
        resetTime: new Date(entry.resetTime).toISOString(),
      });

      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Please try again later.",
        cause: {
          limit: config.maxRequests,
          resetTime: new Date(entry.resetTime).toISOString(),
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
      });
    }

    return next();
  };
}

export function getUserRateLimitStats(userId: string, path?: string) {
  const stats: Record<string, any> = {};

  for (const [storeKey, entry] of rateLimitStore.entries()) {
    if (storeKey.startsWith(userId) && (!path || storeKey.endsWith(path))) {
      const endpoint = storeKey.split(":")[1];
      if (endpoint) {
        const limit = endpointLimits[endpoint] || defaultConfig;
        stats[endpoint] = {
          count: entry.count,
          remaining: Math.max(
            0,
            (limit.maxRequests || defaultConfig.maxRequests) - entry.count,
          ),
          resetTime: new Date(entry.resetTime).toISOString(),
        };
      }
    }
  }

  return stats;
}

export function resetUserRateLimit(userId: string, path?: string): void {
  if (path) {
    const key = `${userId}:${path}`;
    rateLimitStore.delete(key);
    logger.info(`Rate limit reset for user: ${userId}, path: ${path}`);
  } else {
    const prefix = `${userId}:`;
    for (const storeKey of Array.from(rateLimitStore.keys())) {
      if (storeKey.startsWith(prefix)) {
        rateLimitStore.delete(storeKey);
      }
    }
    logger.info(`Rate limit reset for user: ${userId}, all paths`);
  }
}

export function getGlobalRateLimitStats() {
  const now = Date.now();
  const stats = {
    totalEntries: rateLimitStore.size,
    activeUsers: new Set<string>(),
    endpoints: new Map<string, number>(),
  };

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now < entry.resetTime) {
      const parts = key.split(":");
      if (parts.length >= 2) {
        const userId = parts[0];
        const endpoint = parts[1];
        if (endpoint && userId) {
          stats.activeUsers.add(userId);
          const currentCount = stats.endpoints.get(endpoint) || 0;
          stats.endpoints.set(endpoint, currentCount + entry.count);
        }
      }
    }
  }

  return {
    totalEntries: stats.totalEntries,
    activeUsers: stats.activeUsers.size,
    endpoints: Object.fromEntries(stats.endpoints),
  };
}
