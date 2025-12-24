import { Hono } from "hono";
import type { Context } from "hono";
import { FileValidator } from "../lib/fileValidator";
import { VirusScanner } from "../lib/virusScanner";
import { BlobStorage } from "../lib/storage";
import { DocumentClassifier } from "../lib/classifier";
import { OCRPipeline } from "../services/ocr-pipeline.service";
import type { UploadResponse } from "../types";

const documentRouter = new Hono();

documentRouter.post("/upload", async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json(
        {
          success: false,
          error: "No file provided",
        },
        400,
      );
    }

    const validation = FileValidator.validateFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.valid) {
      return c.json(
        {
          success: false,
          error: validation.error,
        },
        400,
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const virusScanResult = await VirusScanner.scanFile(fileBuffer);

    if (!virusScanResult.isClean) {
      return c.json(
        {
          success: false,
          error: "File contains threats and cannot be uploaded",
          threats: virusScanResult.threats,
        },
        403,
      );
    }

    const storageResult = await BlobStorage.uploadFile(
      file.name,
      fileBuffer,
      validation.fileType!,
    );

    if (!storageResult.success) {
      return c.json(
        {
          success: false,
          error: storageResult.error || "Failed to store file",
        },
        500,
      );
    }

    const classificationResult = await DocumentClassifier.classify(
      fileBuffer,
      validation.fileType!,
      file.name,
    );

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const uploadResponse: UploadResponse = {
      success: true,
      documentId,
      metadata: {
        fileName: file.name,
        fileType: validation.fileType!,
        fileSize: file.size,
        category: classificationResult.category,
        pageCount: classificationResult.pageCount,
        isTranscript: classificationResult.isTranscript,
        transcriptStructure: classificationResult.transcriptStructure,
        uploadedAt: new Date(),
      },
      storageUrl: storageResult.url!,
    };

    const asyncOcr = formData.get("asyncOcr") === "true";

    if (
      asyncOcr &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "application/pdf")
    ) {
      const queueResult = await OCRPipeline.queueJob({
        documentId,
        fileBuffer,
        fileType: validation.fileType!,
        priority: "normal",
      });

      if (queueResult.success) {
        OCRPipeline.processQueue();
      }
    } else if (
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "application/pdf"
    ) {
      try {
        const ocrResult = await OCRPipeline.processDocument({
          documentId,
          fileBuffer,
          fileType: validation.fileType!,
        });

        if (ocrResult.success) {
          uploadResponse.metadata.ocrData = {
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            fields: ocrResult.fields,
            processingTime: ocrResult.metadata.processingTime,
          };
        }
      } catch (ocrError) {
        console.error("OCR processing error:", ocrError);
      }
    }

    return c.json(uploadResponse, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload document",
      },
      500,
    );
  }
});

documentRouter.post("/process-ocr", async (c: Context) => {
  try {
    const body = await c.req.json();
    const { documentId, priority = "normal" } = body;

    if (!documentId) {
      return c.json(
        {
          success: false,
          error: "documentId is required",
        },
        400,
      );
    }

    const queueResult = await OCRPipeline.queueJob({
      documentId,
      fileBuffer: Buffer.alloc(0),
      fileType: "pdf",
      priority,
    });

    if (!queueResult.success) {
      return c.json(
        {
          success: false,
          error: queueResult.error || "Failed to queue OCR job",
        },
        500,
      );
    }

    OCRPipeline.processQueue();

    return c.json({
      success: true,
      jobId: queueResult.jobId,
      documentId,
      message: "OCR job queued successfully",
    });
  } catch (error) {
    console.error("Queue OCR error:", error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to queue OCR job",
      },
      500,
    );
  }
});

documentRouter.get("/queue/metrics", async (c: Context) => {
  try {
    const metrics = OCRPipeline.getMetrics();
    const status = OCRPipeline.getQueueStatus();
    const circuitBreakerState = OCRPipeline.getCircuitBreakerState();

    return c.json({
      success: true,
      metrics,
      status,
      circuitBreaker: {
        state: circuitBreakerState,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get metrics",
      },
      500,
    );
  }
});

documentRouter.get("/queue/dead-letter", async (c: Context) => {
  try {
    const deadLetterQueue = OCRPipeline.getDeadLetterQueue();

    return c.json({
      success: true,
      jobs: deadLetterQueue.map((job) => ({
        id: job.id,
        documentId: job.documentId,
        attempts: job.attempts,
        status: job.status,
        error: job.error,
        createdAt: job.createdAt,
      })),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get dead letter queue",
      },
      500,
    );
  }
});

documentRouter.post("/queue/retry/:jobId", async (c: Context) => {
  try {
    const { jobId } = c.req.param();

    const success = await OCRPipeline.retryDeadLetterJob(jobId);

    if (!success) {
      return c.json(
        {
          success: false,
          error: "Job not found in dead letter queue",
        },
        404,
      );
    }

    OCRPipeline.processQueue();

    return c.json({
      success: true,
      message: "Job requeued successfully",
      jobId,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retry job",
      },
      500,
    );
  }
});

documentRouter.post("/queue/clear-dead-letter", async (c: Context) => {
  try {
    OCRPipeline.clearDeadLetterQueue();

    return c.json({
      success: true,
      message: "Dead letter queue cleared successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to clear dead letter queue",
      },
      500,
    );
  }
});

documentRouter.post("/queue/circuit-breaker/reset", async (c: Context) => {
  try {
    OCRPipeline.resetCircuitBreaker();

    return c.json({
      success: true,
      message: "Circuit breaker reset successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reset circuit breaker",
      },
      500,
    );
  }
});

export { documentRouter };
