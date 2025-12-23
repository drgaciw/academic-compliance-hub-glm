import { Hono } from "hono";
import type { Context } from "hono";
import { FileValidator } from "../lib/fileValidator";
import { VirusScanner } from "../lib/virusScanner";
import { BlobStorage } from "../lib/storage";
import { DocumentClassifier } from "../lib/classifier";
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

export { documentRouter };
