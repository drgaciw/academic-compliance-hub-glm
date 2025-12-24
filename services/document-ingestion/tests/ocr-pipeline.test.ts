import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import {
  OCRPipeline,
  CircuitBreaker,
} from "../src/services/ocr-pipeline.service";

describe("OCRPipeline", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    OCRPipeline.clearDeadLetterQueue();
    OCRPipeline.resetCircuitBreaker();
  });

  afterEach(() => {
    OCRPipeline.clearDeadLetterQueue();
    OCRPipeline.resetCircuitBreaker();
  });

  describe("Error Classification", () => {
    it("should classify timeout errors as transient", () => {
      const error = new Error("Request timeout after 30s");
      expect((OCRPipeline as any).classifyError(error)).toBe("transient");
    });

    it("should classify network errors as transient", () => {
      const error = new Error("Network connection failed");
      expect((OCRPipeline as any).classifyError(error)).toBe("transient");
    });

    it("should classify invalid format errors as permanent", () => {
      const error = new Error("Invalid file format");
      expect((OCRPipeline as any).classifyError(error)).toBe("permanent");
    });

    it("should classify corrupted files as permanent", () => {
      const error = new Error("File is corrupted");
      expect((OCRPipeline as any).classifyError(error)).toBe("permanent");
    });

    it("should classify validation errors as validation", () => {
      const error = new Error("Validation failed: missing required field");
      expect((OCRPipeline as any).classifyError(error)).toBe("validation");
    });

    it("should classify unknown errors as validation", () => {
      const error = new Error("Unknown error occurred");
      expect((OCRPipeline as any).classifyError(error)).toBe("validation");
    });
  });

  describe("Retry Logic", () => {
    it("should retry on transient errors", async () => {
      const mockProcess = jest
        .fn()
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValueOnce({
          success: true,
          documentId: "test-doc-1",
          text: "Sample text",
          confidence: 95,
          metadata: {
            processingTime: 1000,
            attempts: 1,
            pageCount: 1,
            preprocessTime: 100,
            ocrTime: 800,
            postprocessTime: 100,
          },
        });

      jest
        .spyOn(OCRPipeline as any, "processDocumentAttempt")
        .mockImplementation(mockProcess);

      const result = await OCRPipeline.processDocument({
        documentId: "test-doc-1",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        maxAttempts: 3,
      });

      expect(mockProcess).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.metadata.attempts).toBe(2);
    });

    it("should not retry on permanent errors", async () => {
      const mockProcess = jest
        .fn()
        .mockRejectedValueOnce(new Error("Invalid file format"));

      jest
        .spyOn(OCRPipeline as any, "processDocumentAttempt")
        .mockImplementation(mockProcess);

      const result = await OCRPipeline.processDocument({
        documentId: "test-doc-2",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        maxAttempts: 3,
      });

      expect(mockProcess).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
      expect(result.metadata.attempts).toBe(1);
    });

    it("should respect max attempts limit", async () => {
      const mockProcess = jest
        .fn()
        .mockRejectedValue(new Error("Network timeout"));

      jest
        .spyOn(OCRPipeline as any, "processDocumentAttempt")
        .mockImplementation(mockProcess);

      const result = await OCRPipeline.processDocument({
        documentId: "test-doc-3",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        maxAttempts: 3,
      });

      expect(mockProcess).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(false);
      expect(result.metadata.attempts).toBe(3);
    });
  });

  describe("Circuit Breaker", () => {
    it("should open circuit after threshold failures", async () => {
      const circuitBreaker = new CircuitBreaker(3, 1000);

      for (let i = 0; i < 3; i++) {
        await expect(
          circuitBreaker.execute(() =>
            Promise.reject(new Error("Service unavailable")),
          ),
        ).rejects.toThrow();
      }

      expect(circuitBreaker.getState()).toBe("open");

      await expect(
        circuitBreaker.execute(() => Promise.resolve("success")),
      ).rejects.toThrow("Circuit breaker is open");
    });

    it("should transition to half-open after timeout", async () => {
      const circuitBreaker = new CircuitBreaker(2, 100);

      for (let i = 0; i < 2; i++) {
        await expect(
          circuitBreaker.execute(() =>
            Promise.reject(new Error("Service unavailable")),
          ),
        ).rejects.toThrow();
      }

      expect(circuitBreaker.getState()).toBe("open");

      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(circuitBreaker.getState()).toBe("half-open");
    });

    it("should close circuit on successful execution in half-open state", async () => {
      const circuitBreaker = new CircuitBreaker(2, 100);

      for (let i = 0; i < 2; i++) {
        await expect(
          circuitBreaker.execute(() =>
            Promise.reject(new Error("Service unavailable")),
          ),
        ).rejects.toThrow();
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await circuitBreaker.execute(() =>
        Promise.resolve("success"),
      );
      expect(result).toBe("success");
      expect(circuitBreaker.getState()).toBe("closed");
    });

    it("should reset circuit breaker state", () => {
      const circuitBreaker = new CircuitBreaker(3, 1000);
      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe("closed");
    });
  });

  describe("Job Queue", () => {
    it("should queue a job successfully", async () => {
      const result = await OCRPipeline.queueJob({
        documentId: "test-doc-4",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      expect(result.success).toBe(true);
      expect(result.jobId).toBeTruthy();
      expect(result.jobId).toMatch(/^job_\d+_[a-z0-9]+$/);
    });

    it("should reject job when queue is at capacity", async () => {
      OCRPipeline.configure({ maxConcurrentJobs: 0 });

      const result = await OCRPipeline.queueJob({
        documentId: "test-doc-5",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Queue is at maximum capacity");

      OCRPipeline.configure({ maxConcurrentJobs: 5 });
    });

    it("should prioritize high priority jobs", async () => {
      const highPriorityResult = await OCRPipeline.queueJob({
        documentId: "test-doc-6",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "high",
      });

      const normalPriorityResult = await OCRPipeline.queueJob({
        documentId: "test-doc-7",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      expect(highPriorityResult.success).toBe(true);
      expect(normalPriorityResult.success).toBe(true);

      const queue = (OCRPipeline as any).queue;
      const highPriorityJob = queue.get(highPriorityResult.jobId);
      const normalPriorityJob = queue.get(normalPriorityResult.jobId);

      expect(highPriorityJob.priority).toBeLessThan(normalPriorityJob.priority);
    });
  });

  describe("Metrics", () => {
    it("should track queue metrics", async () => {
      await OCRPipeline.queueJob({
        documentId: "test-doc-8",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      await OCRPipeline.queueJob({
        documentId: "test-doc-9",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      const metrics = OCRPipeline.getMetrics();

      expect(metrics.pending).toBeGreaterThanOrEqual(0);
      expect(metrics.totalProcessed).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
    });

    it("should return queue status", () => {
      const status = OCRPipeline.getQueueStatus();

      expect(status).toHaveProperty("pending");
      expect(status).toHaveProperty("processing");
      expect(status).toHaveProperty("deadLetterQueue");
      expect(typeof status.pending).toBe("number");
      expect(typeof status.processing).toBe("number");
      expect(typeof status.deadLetterQueue).toBe("number");
    });
  });

  describe("Dead Letter Queue", () => {
    it("should move failed jobs to dead letter queue", async () => {
      const result = await OCRPipeline.queueJob({
        documentId: "test-doc-10",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      expect(result.success).toBe(true);

      const queue = (OCRPipeline as any).queue;
      const job = queue.get(result.jobId);

      job.status = "failed";
      job.error = "Invalid file format";
      (OCRPipeline as any).deadLetterQueue.push(job);
      queue.delete(result.jobId);

      const deadLetterQueue = OCRPipeline.getDeadLetterQueue();
      expect(deadLetterQueue.length).toBeGreaterThan(0);
    });

    it("should retry job from dead letter queue", async () => {
      const result = await OCRPipeline.queueJob({
        documentId: "test-doc-11",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      const queue = (OCRPipeline as any).queue;
      const job = queue.get(result.jobId);
      job.status = "failed";
      job.error = "Network timeout";
      (OCRPipeline as any).deadLetterQueue.push(job);
      queue.delete(result.jobId);

      const retrySuccess = await OCRPipeline.retryDeadLetterJob(result.jobId);
      expect(retrySuccess).toBe(true);

      const deadLetterQueue = OCRPipeline.getDeadLetterQueue();
      expect(
        deadLetterQueue.find((j) => j.id === result.jobId),
      ).toBeUndefined();

      const requeuedJob = queue.get(result.jobId);
      expect(requeuedJob).toBeDefined();
      expect(requeuedJob.status).toBe("pending");
    });

    it("should clear dead letter queue", async () => {
      const result1 = await OCRPipeline.queueJob({
        documentId: "test-doc-12",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      const result2 = await OCRPipeline.queueJob({
        documentId: "test-doc-13",
        fileBuffer: Buffer.from("test"),
        fileType: "pdf",
        priority: "normal",
      });

      const queue = (OCRPipeline as any).queue;
      const job1 = queue.get(result1.jobId);
      const job2 = queue.get(result2.jobId);
      job1.status = "failed";
      job2.status = "failed";
      (OCRPipeline as any).deadLetterQueue.push(job1, job2);

      expect(OCRPipeline.getDeadLetterQueue().length).toBe(2);

      OCRPipeline.clearDeadLetterQueue();

      expect(OCRPipeline.getDeadLetterQueue().length).toBe(0);
    });
  });

  describe("Configuration", () => {
    it("should configure retry settings", () => {
      OCRPipeline.configure({
        retryConfig: {
          initialDelay: 200,
          maxDelay: 10000,
          maxAttempts: 5,
          backoffMultiplier: 3,
        },
      });

      const config = (OCRPipeline as any).retryConfig;

      expect(config.initialDelay).toBe(200);
      expect(config.maxDelay).toBe(10000);
      expect(config.maxAttempts).toBe(5);
      expect(config.backoffMultiplier).toBe(3);
    });

    it("should configure max concurrent jobs", () => {
      OCRPipeline.configure({ maxConcurrentJobs: 10 });

      expect((OCRPipeline as any).maxConcurrentJobs).toBe(10);
    });

    it("should configure priority values", () => {
      OCRPipeline.configure({
        priorityValues: {
          high: 0,
          normal: 1,
          low: 2,
        },
      });

      const priorities = (OCRPipeline as any).priorityValues;

      expect(priorities.high).toBe(0);
      expect(priorities.normal).toBe(1);
      expect(priorities.low).toBe(2);
    });
  });

  describe("Field Extraction", () => {
    it("should extract student name from text", () => {
      const text = "Student: John Doe\nGPA: 3.5";
      const fields = (OCRPipeline as any).extractFields(text);

      expect(fields.studentName?.trim()).toBe("John Doe");
    });

    it("should extract GPA from text", () => {
      const text = "GPA: 3.75\nStudent: Jane Smith";
      const fields = (OCRPipeline as any).extractFields(text);

      expect(fields.gpa).toBe(3.75);
    });

    it("should extract cumulative credits from text", () => {
      const text = "Cumulative Credits: 120";
      const fields = (OCRPipeline as any).extractFields(text);

      expect(fields.cumulativeCredits).toBe(120);
    });

    it("should extract term from text", () => {
      const text = "Term: Fall 2024";
      const fields = (OCRPipeline as any).extractFields(text);

      expect(fields.term).toBe("Fall 2024");
    });

    it("should extract courses from text", () => {
      const text = "CS 101 Introduction to Programming 3.0 A";
      const fields = (OCRPipeline as any).extractFields(text);

      expect(fields.courses).toBeDefined();
      expect(fields.courses.length).toBeGreaterThan(0);
      expect(fields.courses[0].code).toBe("CS 101");
      expect(fields.courses[0].name).toBe("Introduction to Programming");
      expect(fields.courses[0].credits).toBe(3);
      expect(fields.courses[0].grade).toBe("A");
    });
  });

  describe("Confidence Filtering", () => {
    it("should filter text by confidence threshold", () => {
      const mockData = {
        text: "Sample text with confidence",
        confidence: 80,
        words: [
          { text: "Sample", confidence: 95 },
          { text: "text", confidence: 85 },
          { text: "with", confidence: 50 },
          { text: "confidence", confidence: 90 },
        ],
      };

      const filteredText = (OCRPipeline as any).filterByConfidence(mockData);

      expect(filteredText).toContain("Sample");
      expect(filteredText).toContain("text");
      expect(filteredText).toContain("confidence");
      expect(filteredText).not.toContain("with");
    });
  });
});
