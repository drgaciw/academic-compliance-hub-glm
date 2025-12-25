import { TRPCError } from "@trpc/server";

export interface LoggerConfig {
  enabled: boolean;
  level: "debug" | "info" | "warn" | "error";
}

const defaultConfig: LoggerConfig = {
  enabled: process.env.NODE_ENV === "development",
  level: "info",
};

export class TRPCLogger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private log(level: string, message: string, meta?: unknown) {
    if (!this.config.enabled) return;

    const levels = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex < currentLevelIndex) return;

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...(meta && typeof meta === "object" ? meta : {}),
    };

    console.log(JSON.stringify(logData));
  }

  debug(message: string, meta?: unknown) {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: unknown) {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log("warn", message, meta);
  }

  error(message: string, error?: Error | unknown) {
    this.log("error", message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

export const logger = new TRPCLogger();

export function errorHandlerMiddleware() {
  return async ({ next }: { next: () => Promise<unknown> }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      if (error instanceof Error) {
        logger.error("Unhandled error in tRPC procedure", error);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "An unexpected error occurred",
        });
      }

      logger.error("Unknown error in tRPC procedure", error);

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      });
    }
  };
}

export function validationErrorHandler() {
  return async ({ next }: { next: () => Promise<unknown> }) => {
    try {
      return await next();
    } catch (error) {
      logger.error("Validation error", error);

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Validation failed",
        cause: error,
      });
    }
  };
}
