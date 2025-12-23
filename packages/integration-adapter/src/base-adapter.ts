import {
  SISAdapter,
  SISCredentials,
  Session,
  StudentInfo,
  Transcript,
  CourseEnrollment,
  CourseInfo,
  GradeRecord,
  SISType,
} from "./index";

export interface AdapterConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  enableLogging?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
}

export interface RequestLog {
  timestamp: Date;
  method: string;
  url?: string;
  success: boolean;
  statusCode?: number;
  duration: number;
  error?: string;
}

export abstract class BaseSISAdapter implements SISAdapter {
  abstract sisType: SISType;

  protected config: Required<AdapterConfig>;
  protected logs: RequestLog[] = [];
  protected credentials?: SISCredentials;

  constructor(config: AdapterConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      timeout: config.timeout ?? 30000,
      enableLogging: config.enableLogging ?? true,
      logLevel: config.logLevel ?? "info",
    };
  }

  abstract authenticate(credentials: SISCredentials): Promise<Session>;

  abstract getStudentInfo(
    session: Session,
    studentId: string,
  ): Promise<StudentInfo>;

  abstract getTranscript(
    session: Session,
    studentId: string,
  ): Promise<Transcript>;

  abstract getCurrentEnrollments(
    session: Session,
    studentId: string,
  ): Promise<CourseEnrollment[]>;

  abstract getCourseInfo(
    session: Session,
    courseId: string,
  ): Promise<CourseInfo>;

  abstract validateStudent(
    session: Session,
    studentId: string,
  ): Promise<boolean>;

  abstract checkHold(session: Session, studentId: string): Promise<boolean>;

  abstract getGradeRecords(
    session: Session,
    studentId: string,
    termCode?: string,
  ): Promise<GradeRecord[]>;

  abstract refreshToken(session: Session): Promise<Session>;

  abstract logout(session: Session): Promise<void>;

  abstract healthCheck(): Promise<boolean>;

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        return await this.executeOperation(operation, context);
      } catch (error) {
        lastError = error as Error;
        this.log(
          "warn",
          `${context} attempt ${attempt + 1}/${this.config.maxRetries} failed: ${lastError.message}`,
        );

        if (attempt < this.config.maxRetries - 1) {
          await this.delay(this.config.retryDelay * (attempt + 1));
        }
      }
    }

    throw this.createError(
      `Operation failed after ${this.config.maxRetries} attempts: ${context}`,
      lastError,
    );
  }

  protected async executeOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await operation();
      this.log(
        "success",
        `${context} completed successfully`,
        Date.now() - startTime,
      );
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(
        "error",
        `${context} failed: ${(error as Error).message}`,
        duration,
      );
      throw error;
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected createError(message: string, cause?: Error): Error {
    const error = new Error(message);
    if (cause) {
      (error as any).cause = cause;
    }
    return error;
  }

  protected log(
    level: "debug" | "info" | "warn" | "error" | "success",
    message: string,
    duration?: number,
  ): void {
    if (!this.config.enableLogging) return;

    const logEntry: RequestLog = {
      timestamp: new Date(),
      method: level,
      success: level === "success",
      duration: duration ?? 0,
      error: level === "error" ? message : undefined,
    };

    this.logs.push(logEntry);

    const levels = { debug: 0, info: 1, warn: 2, error: 3, success: 1 };
    const currentLevel = levels[this.config.logLevel];
    const messageLevel = levels[level];

    if (messageLevel >= currentLevel) {
      const timestamp = logEntry.timestamp.toISOString();
      const durationStr = duration && duration > 0 ? ` (${duration}ms)` : "";
      console.log(
        `[${timestamp}] [${this.sisType}] [${level.toUpperCase()}] ${message}${durationStr}`,
      );
    }
  }

  protected logRequest(
    method: string,
    url: string,
    statusCode?: number,
    success: boolean = true,
    duration: number = 0,
  ): void {
    this.log("debug", `${method} ${url} - ${statusCode}`, duration);

    this.logs.push({
      timestamp: new Date(),
      method,
      url,
      success,
      statusCode,
      duration,
    });
  }

  protected validateSession(session: Session): void {
    if (!session || !session.token || !session.expiresAt) {
      throw this.createError("Invalid session: missing required fields");
    }

    if (new Date() >= session.expiresAt) {
      throw this.createError("Session has expired");
    }
  }

  protected isSessionValid(
    session: Session,
    bufferMinutes: number = 5,
  ): boolean {
    if (!session || !session.expiresAt) return false;

    const now = new Date();
    const expiryBuffer = new Date(
      session.expiresAt.getTime() - bufferMinutes * 60000,
    );

    return now < expiryBuffer;
  }

  public getLogs(): RequestLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getConfig(): Readonly<Required<AdapterConfig>> {
    return this.config;
  }
}
