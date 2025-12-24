import Tesseract from "tesseract.js";
import sharp from "sharp";
import type { DocumentType } from "../types";

export interface OCRProcessingOptions {
  documentId: string;
  fileBuffer: Buffer;
  fileType: DocumentType;
  priority?: "high" | "normal" | "low";
  timeout?: number;
  maxAttempts?: number;
}

export interface OCRResult {
  success: boolean;
  documentId: string;
  text: string;
  confidence: number;
  fields?: ExtractedFields;
  pages?: PageResult[];
  metadata: OCRMetadata;
  error?: string;
}

export interface PageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  fields?: ExtractedFields;
}

export interface ExtractedFields {
  studentName?: string;
  studentId?: string;
  gpa?: number;
  cumulativeCredits?: number;
  term?: string;
  courses?: CourseInfo[];
  institutionName?: string;
}

export interface CourseInfo {
  code?: string;
  name?: string;
  credits?: number;
  grade?: string;
  term?: string;
}

export interface OCRMetadata {
  processingTime: number;
  attempts: number;
  pageCount: number;
  preprocessTime: number;
  ocrTime: number;
  postprocessTime: number;
}

export interface RetryConfig {
  initialDelay: number;
  maxDelay: number;
  maxAttempts: number;
  backoffMultiplier: number;
}

export interface JobPriority {
  high: number;
  normal: number;
  low: number;
}

export interface QueueJob {
  id: string;
  documentId: string;
  fileBuffer: Buffer;
  fileType: DocumentType;
  priority: number;
  attempts: number;
  status: "pending" | "processing" | "completed" | "failed" | "retrying";
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  errorType?: ErrorType;
  result?: OCRResult;
}

export interface QueueMetrics {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
  totalProcessed: number;
  averageProcessingTime: number;
  successRate: number;
}

export type ErrorType = "transient" | "permanent" | "validation";

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: "closed" | "open" | "half-open" = "closed";
  private readonly threshold: number;
  private readonly timeout: number;

  constructor(threshold: number = 5, timeout: number = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime.getTime() > this.timeout
      ) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    if (this.failureCount >= this.threshold) {
      this.state = "open";
    }
  }

  getState(): string {
    if (
      this.state === "open" &&
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime.getTime() > this.timeout
    ) {
      this.state = "half-open";
    }
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = "closed";
    this.lastFailureTime = undefined;
  }
}

export class OCRPipeline {
  private static retryConfig: RetryConfig = {
    initialDelay: 100,
    maxDelay: 5000,
    maxAttempts: 3,
    backoffMultiplier: 2,
  };

  private static circuitBreaker = new CircuitBreaker(5, 60000);
  private static queue: Map<string, QueueJob> = new Map();
  private static deadLetterQueue: QueueJob[] = [];
  private static metrics: QueueMetrics = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    totalProcessed: 0,
    averageProcessingTime: 0,
    successRate: 100,
  };
  private static processingTimes: number[] = [];
  private static maxConcurrentJobs = 5;
  private static currentJobs = 0;
  private static priorityValues: JobPriority = {
    high: 1,
    normal: 2,
    low: 3,
  };

  static async processDocument(
    options: OCRProcessingOptions,
  ): Promise<OCRResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;
    const maxAttempts = options.maxAttempts ?? this.retryConfig.maxAttempts;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await this.circuitBreaker.execute(() =>
          this.processDocumentAttempt(options),
        );
        return {
          ...result,
          metadata: {
            ...result.metadata,
            attempts: attempt,
          },
        };
      } catch (error) {
        lastError = error as Error;
        const errorType = this.classifyError(error as Error);

        if (errorType === "permanent") {
          return {
            success: false,
            documentId: options.documentId,
            text: "",
            confidence: 0,
            metadata: {
              processingTime: Date.now() - startTime,
              attempts: attempt,
              pageCount: 0,
              preprocessTime: 0,
              ocrTime: 0,
              postprocessTime: 0,
            },
            error: lastError.message,
          };
        }

        if (attempt < maxAttempts) {
          const delay = Math.min(
            this.retryConfig.initialDelay *
              Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
            this.retryConfig.maxDelay,
          );
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      documentId: options.documentId,
      text: "",
      confidence: 0,
      metadata: {
        processingTime: Date.now() - startTime,
        attempts: maxAttempts,
        pageCount: 0,
        preprocessTime: 0,
        ocrTime: 0,
        postprocessTime: 0,
      },
      error: lastError?.message || "Max retry attempts exceeded",
    };
  }

  private static async processDocumentAttempt(
    options: OCRProcessingOptions,
  ): Promise<OCRResult> {
    const startTime = Date.now();
    const preprocessStart = Date.now();

    const { preprocessedImage, imageInfo } = await this.preprocessImage(
      options.fileBuffer,
      options.fileType,
    );

    const preprocessTime = Date.now() - preprocessStart;
    const ocrStart = Date.now();

    const { data } = await Tesseract.recognize(preprocessedImage, "eng", {
      logger: (m: any) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const ocrTime = Date.now() - ocrStart;
    const postprocessStart = Date.now();

    const filteredText = this.filterByConfidence(data);
    const fields = this.extractFields(filteredText);
    const pages = this.extractPageResults(data);

    const postprocessTime = Date.now() - postprocessStart;

    return {
      success: true,
      documentId: options.documentId,
      text: filteredText,
      confidence: data.confidence,
      fields,
      pages,
      metadata: {
        processingTime: Date.now() - startTime,
        attempts: 1,
        pageCount: imageInfo.pageCount,
        preprocessTime,
        ocrTime,
        postprocessTime,
      },
    };
  }

  private static async preprocessImage(
    buffer: Buffer,
    fileType: DocumentType,
  ): Promise<{ preprocessedImage: Buffer; imageInfo: any }> {
    if (fileType === "jpeg" || fileType === "png") {
      const preprocessed = await sharp(buffer)
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

      return {
        preprocessedImage: preprocessed,
        imageInfo: { pageCount: 1 },
      };
    }

    if (fileType === "pdf") {
      const { default: pdfjsLib } = await import("pdfjs-dist");

      const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
      const pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;

      let combinedText = "";
      let combinedConfidence = 0;
      const pages: any[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");

        combinedText += pageText + "\n\n";
        pages.push({
          pageNumber: i,
          text: pageText,
          confidence: 85,
        });
      }

      combinedConfidence =
        pages.length > 0
          ? pages.reduce((sum: number, p: any) => sum + p.confidence, 0) /
            pages.length
          : 0;

      return {
        preprocessedImage: Buffer.from(combinedText, "utf-8"),
        imageInfo: { pageCount },
      };
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  }

  private static filterByConfidence(data: any): string {
    const minConfidence = 60;

    if (data.words && Array.isArray(data.words)) {
      const filteredWords = data.words.filter(
        (word: any) => word.confidence >= minConfidence,
      );
      return filteredWords.map((word: any) => word.text).join(" ");
    }

    return data.text || "";
  }

  private static extractFields(text: string): ExtractedFields {
    const fields: ExtractedFields = {};

    const studentNameMatch = text.match(
      /(?:student|name)[:\s]+([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*)/i,
    );
    if (studentNameMatch) {
      fields.studentName = studentNameMatch[1].trim();
    }

    const studentIdMatch = text.match(/(?:student\s*id|id)[:\s]+([A-Z0-9-]+)/i);
    if (studentIdMatch) {
      fields.studentId = studentIdMatch[1].trim();
    }

    const gpaMatch = text.match(
      /(?:gpa|grade\s*point\s*average)[:\s]+(\d+\.?\d*)/i,
    );
    if (gpaMatch) {
      fields.gpa = parseFloat(gpaMatch[1]);
    }

    const creditsMatch = text.match(
      /(?:cumulative\s*)?(?:credit|credits?)[:\s]+(\d+\.?\d*)/i,
    );
    if (creditsMatch) {
      fields.cumulativeCredits = parseFloat(creditsMatch[1]);
    }

    const termMatch = text.match(
      /(?:term|semester|quarter)[:\s]+((?:fall|spring|summer|winter)\s*\d{4})/i,
    );
    if (termMatch) {
      fields.term = termMatch[1].trim();
    }

    const institutionMatch = text.match(
      /(?:university|college|institute|school)\s+of\s+([A-Z][a-zA-Z\s]+)/i,
    );
    if (institutionMatch) {
      fields.institutionName = institutionMatch[1].trim();
    }

    fields.courses = this.extractCourses(text);

    return fields;
  }

  private static extractCourses(text: string): CourseInfo[] {
    const courses: CourseInfo[] = [];
    const coursePattern =
      /([A-Z]{2,4}\s*\d{3,4})\s+(.+?)\s+(\d+\.?\d*)\s+([A-D][+-]?|F)\s*(?:\(([^)]+)\))?/g;

    let match;
    while ((match = coursePattern.exec(text)) !== null) {
      courses.push({
        code: match[1].trim(),
        name: match[2].trim(),
        credits: parseFloat(match[3]),
        grade: match[4],
        term: match[5]?.trim(),
      });
    }

    return courses;
  }

  private static extractPageResults(data: any): PageResult[] {
    if (!data.pages || !Array.isArray(data.pages)) {
      return [];
    }

    return data.pages.map((page: any, index: number) => ({
      pageNumber: index + 1,
      text: page.text || "",
      confidence: page.confidence || 0,
      fields: page.text ? this.extractFields(page.text) : undefined,
    }));
  }

  private static classifyError(error: Error): ErrorType {
    const errorMessage = error.message.toLowerCase();

    const transientPatterns = [
      "timeout",
      "network",
      "connection",
      "temporary",
      "rate limit",
      "service unavailable",
      "503",
    ];

    const permanentPatterns = [
      "invalid",
      "corrupted",
      "not supported",
      "unauthorized",
      "forbidden",
    ];

    const validationPatterns = ["validation", "invalid data"];

    if (transientPatterns.some((pattern) => errorMessage.includes(pattern))) {
      return "transient";
    }

    if (permanentPatterns.some((pattern) => errorMessage.includes(pattern))) {
      return "permanent";
    }

    if (validationPatterns.some((pattern) => errorMessage.includes(pattern))) {
      return "validation";
    }

    return "validation";
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async queueJob(
    options: OCRProcessingOptions,
  ): Promise<{ success: boolean; jobId: string; error?: string }> {
    if (this.currentJobs >= this.maxConcurrentJobs) {
      return {
        success: false,
        jobId: "",
        error: "Queue is at maximum capacity",
      };
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const job: QueueJob = {
      id: jobId,
      documentId: options.documentId,
      fileBuffer: options.fileBuffer,
      fileType: options.fileType,
      priority: this.priorityValues[options.priority ?? "normal"],
      attempts: 0,
      status: "pending",
      createdAt: new Date(),
    };

    this.queue.set(jobId, job);
    this.updateMetrics();

    return { success: true, jobId };
  }

  static async processQueue(): Promise<void> {
    const pendingJobs = Array.from(this.queue.values())
      .filter((job) => job.status === "pending")
      .sort((a, b) => a.priority - b.priority)
      .slice(0, this.maxConcurrentJobs - this.currentJobs);

    for (const job of pendingJobs) {
      if (this.currentJobs >= this.maxConcurrentJobs) {
        break;
      }

      this.processJob(job);
    }
  }

  private static async processJob(job: QueueJob): Promise<void> {
    if (this.currentJobs >= this.maxConcurrentJobs) {
      return;
    }

    this.currentJobs++;
    job.status = "processing";
    job.startedAt = new Date();
    job.attempts++;
    this.updateMetrics();

    try {
      const result = await this.processDocument({
        documentId: job.documentId,
        fileBuffer: job.fileBuffer,
        fileType: job.fileType,
      });

      job.result = result;
      job.status = result.success ? "completed" : "failed";
      job.completedAt = new Date();

      if (!result.success) {
        const errorType = this.classifyError(new Error(result.error || ""));

        if (
          errorType === "transient" &&
          job.attempts < this.retryConfig.maxAttempts
        ) {
          job.status = "retrying";
          setTimeout(
            () => {
              this.processJob(job);
            },
            Math.min(
              this.retryConfig.initialDelay *
                Math.pow(this.retryConfig.backoffMultiplier, job.attempts - 1),
              this.retryConfig.maxDelay,
            ),
          );
        } else {
          this.deadLetterQueue.push(job);
        }
      }

      const processingTime =
        job.completedAt.getTime() - job.startedAt.getTime();
      this.processingTimes.push(processingTime);
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift();
      }
    } catch (error) {
      job.status = "failed";
      job.error = (error as Error).message;
      job.completedAt = new Date();
      this.deadLetterQueue.push(job);
    } finally {
      this.currentJobs--;
      this.updateMetrics();
    }
  }

  static updateMetrics(): void {
    const jobs = Array.from(this.queue.values());

    this.metrics.pending = jobs.filter((j) => j.status === "pending").length;
    this.metrics.processing = jobs.filter(
      (j) => j.status === "processing",
    ).length;
    this.metrics.completed = jobs.filter(
      (j) => j.status === "completed",
    ).length;
    this.metrics.failed = jobs.filter((j) => j.status === "failed").length;
    this.metrics.retrying = jobs.filter((j) => j.status === "retrying").length;
    this.metrics.totalProcessed = this.metrics.completed + this.metrics.failed;

    if (this.processingTimes.length > 0) {
      this.metrics.averageProcessingTime =
        this.processingTimes.reduce((sum, time) => sum + time, 0) /
        this.processingTimes.length;
    }

    if (this.metrics.totalProcessed > 0) {
      this.metrics.successRate =
        (this.metrics.completed / this.metrics.totalProcessed) * 100;
    }
  }

  static getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  static getQueueStatus(): {
    pending: number;
    processing: number;
    deadLetterQueue: number;
  } {
    return {
      pending: this.metrics.pending,
      processing: this.metrics.processing,
      deadLetterQueue: this.deadLetterQueue.length,
    };
  }

  static getDeadLetterQueue(): QueueJob[] {
    return [...this.deadLetterQueue];
  }

  static clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  static async retryDeadLetterJob(jobId: string): Promise<boolean> {
    const jobIndex = this.deadLetterQueue.findIndex((j) => j.id === jobId);
    if (jobIndex === -1) {
      return false;
    }

    const job = this.deadLetterQueue.splice(jobIndex, 1)[0];
    job.status = "pending";
    job.attempts = 0;
    job.error = undefined;
    this.queue.set(job.id, job);
    this.updateMetrics();

    return true;
  }

  static getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  static resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  static configure(config: {
    retryConfig?: Partial<RetryConfig>;
    maxConcurrentJobs?: number;
    priorityValues?: Partial<JobPriority>;
  }): void {
    if (config.retryConfig) {
      this.retryConfig = { ...this.retryConfig, ...config.retryConfig };
    }
    if (config.maxConcurrentJobs !== undefined) {
      this.maxConcurrentJobs = config.maxConcurrentJobs;
    }
    if (config.priorityValues) {
      this.priorityValues = {
        ...this.priorityValues,
        ...config.priorityValues,
      };
    }
  }
}
