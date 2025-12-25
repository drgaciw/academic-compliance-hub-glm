import pino from "pino";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  service?: string;
  environment?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}

class Logger {
  private logger: pino.Logger;

  constructor(service: string) {
    this.logger = pino({
      level: process.env.LOG_LEVEL || "info",
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      serializers: {
        error: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
      },
    }).child({ service });
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const baseContext = {
      environment:
        process.env.NEXT_PUBLIC_VERCEL_ENV ||
        process.env.NODE_ENV ||
        "development",
      timestamp: new Date().toISOString(),
      ...context,
    };

    (this.logger as any)[level](baseContext, message);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context);
  }

  apiRequest(context: {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
    userId?: string;
    requestId: string;
  }): void {
    this.info("API Request", {
      ...context,
      service: "api",
    });
  }

  apiError(context: {
    method: string;
    path: string;
    error: Error;
    statusCode: number;
    userId?: string;
    requestId: string;
  }): void {
    this.error("API Error", {
      method: context.method,
      path: context.path,
      statusCode: context.statusCode,
      userId: context.userId,
      requestId: context.requestId,
      error: {
        message: context.error.message,
        stack: context.error.stack,
        code: (context.error as any).code,
      },
      service: "api",
    });
  }

  userAction(context: {
    userId: string;
    action: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.info(`User Action: ${context.action}`, {
      userId: context.userId,
      metadata: context.metadata,
      service: "user-action",
    });
  }

  performance(context: {
    operation: string;
    duration: number;
    metadata?: Record<string, unknown>;
  }): void {
    this.info("Performance Metric", {
      operation: context.operation,
      duration: context.duration,
      metadata: context.metadata,
      service: "performance",
    });
  }
}

const loggers = new Map<string, Logger>();

export function createLogger(service: string): Logger {
  if (!loggers.has(service)) {
    loggers.set(service, new Logger(service));
  }
  return loggers.get(service)!;
}

export const logger = createLogger("aah");
