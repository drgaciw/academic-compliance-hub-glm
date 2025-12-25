import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { logger } from "../middleware";
import { prisma } from "@aah/database";

export const uploadDocumentInput = z.object({
  studentProfileId: z.string().cuid(),
  institutionId: z.string().cuid().optional(),
  fileName: z.string().min(1),
  fileType: z.enum(["pdf", "jpeg", "png", "edi"]),
  fileSize: z.number().positive(),
  fileUrl: z.string().url(),
  transferEvaluationId: z.string().cuid().optional(),
});

export const uploadDocumentOutput = z.object({
  id: z.string().cuid(),
  studentProfileId: z.string().cuid(),
  institutionId: z.string().cuid().nullable(),
  fileName: z.string(),
  fileType: z.enum(["pdf", "jpeg", "png", "edi"]),
  fileSize: z.number(),
  fileUrl: z.string(),
  extractionStatus: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
    "PARTIAL",
    "REQUIRES_REVIEW",
  ]),
  uploadedAt: z.date(),
});

export const uploadDocument = protectedProcedure
  .input(uploadDocumentInput)
  .output(uploadDocumentOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Uploading document", {
      studentProfileId: input.studentProfileId,
      fileName: input.fileName,
      fileType: input.fileType,
      user: ctx.user.id,
    });

    try {
      const document = await prisma.transcriptDocument.create({
        data: {
          studentProfileId: input.studentProfileId,
          institutionId: input.institutionId,
          transferEvaluation: input.transferEvaluationId
            ? {
                connect: { id: input.transferEvaluationId },
              }
            : undefined,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          fileUrl: input.fileUrl,
          extractionStatus: "NOT_STARTED",
          uploadedAt: new Date(),
        },
      });

      return {
        id: document.id,
        studentProfileId: document.studentProfileId,
        institutionId: document.institutionId,
        fileName: document.fileName,
        fileType: document.fileType as any,
        fileSize: document.fileSize,
        fileUrl: document.fileUrl,
        extractionStatus: document.extractionStatus,
        uploadedAt: document.uploadedAt,
      };
    } catch (error) {
      logger.error("Failed to upload document", error);
      throw error;
    }
  });

export const processOcrInput = z.object({
  documentId: z.string().cuid(),
});

export const processOcrOutput = z.object({
  success: z.boolean(),
  documentId: z.string().cuid(),
  extractionStatus: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
    "PARTIAL",
    "REQUIRES_REVIEW",
  ]),
  ocrText: z.string().optional(),
  confidence: z.number().optional(),
  extractedFields: z.any().optional(),
  error: z.string().optional(),
});

export const processOcr = protectedProcedure
  .input(processOcrInput)
  .output(processOcrOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Processing OCR for document", {
      documentId: input.documentId,
      user: ctx.user.id,
    });

    try {
      const document = await prisma.transcriptDocument.findUnique({
        where: { id: input.documentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      await prisma.transcriptDocument.update({
        where: { id: input.documentId },
        data: {
          extractionStatus: "IN_PROGRESS",
          extractionStartedAt: new Date(),
        },
      });

      const simulatedOcrResult = {
        text: "Sample OCR extracted text from transcript...",
        confidence: 0.85,
        fields: {
          studentName: "John Doe",
          studentId: "STU12345",
          gpa: 3.5,
          cumulativeCredits: 60,
          institution: "Example University",
          courses: [
            {
              code: "MATH101",
              name: "College Algebra",
              credits: 3,
              grade: "A",
            },
            {
              code: "ENG101",
              name: "English Composition",
              credits: 3,
              grade: "B",
            },
          ],
        },
      };

      await prisma.transcriptDocument.update({
        where: { id: input.documentId },
        data: {
          extractionStatus: "COMPLETED",
          extractionCompletedAt: new Date(),
          extractionMetadata: simulatedOcrResult,
        },
      });

      return {
        success: true,
        documentId: input.documentId,
        extractionStatus: "COMPLETED",
        ocrText: simulatedOcrResult.text,
        confidence: simulatedOcrResult.confidence,
        extractedFields: simulatedOcrResult.fields,
      };
    } catch (error) {
      logger.error("Failed to process OCR", error);

      try {
        await prisma.transcriptDocument.update({
          where: { id: input.documentId },
          data: {
            extractionStatus: "FAILED",
            extractionCompletedAt: new Date(),
          },
        });
      } catch (updateError) {
        logger.error("Failed to update document status", updateError);
      }

      return {
        success: false,
        documentId: input.documentId,
        extractionStatus: "FAILED",
        error: error instanceof Error ? error.message : "OCR processing failed",
      };
    }
  });

export const parseTranscriptInput = z.object({
  documentId: z.string().cuid(),
});

export const parseTranscriptOutput = z.object({
  success: z.boolean(),
  documentId: z.string().cuid(),
  parsedData: z
    .object({
      studentName: z.string(),
      studentId: z.string(),
      gpa: z.number(),
      cumulativeCredits: z.number(),
      institutionName: z.string(),
      terms: z.array(
        z.object({
          name: z.string(),
          year: z.number(),
          courses: z.array(
            z.object({
              code: z.string(),
              name: z.string(),
              credits: z.number(),
              grade: z.string(),
            }),
          ),
        }),
      ),
    })
    .optional(),
  error: z.string().optional(),
});

export const parseTranscript = protectedProcedure
  .input(parseTranscriptInput)
  .output(parseTranscriptOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Parsing transcript", {
      documentId: input.documentId,
      user: ctx.user.id,
    });

    try {
      const document = await prisma.transcriptDocument.findUnique({
        where: { id: input.documentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      const extractionMetadata = document.extractionMetadata as any;
      if (!extractionMetadata) {
        throw new Error("No OCR data available for parsing");
      }

      const parsedData = {
        studentName: extractionMetadata.fields?.studentName || "Unknown",
        studentId: extractionMetadata.fields?.studentId || "Unknown",
        gpa: extractionMetadata.fields?.gpa || 0,
        cumulativeCredits: extractionMetadata.fields?.cumulativeCredits || 0,
        institutionName: extractionMetadata.fields?.institution || "Unknown",
        terms: [
          {
            name: "Fall 2024",
            year: 2024,
            courses: extractionMetadata.fields?.courses || [],
          },
        ],
      };

      return {
        success: true,
        documentId: input.documentId,
        parsedData,
      };
    } catch (error) {
      logger.error("Failed to parse transcript", error);
      return {
        success: false,
        documentId: input.documentId,
        error:
          error instanceof Error ? error.message : "Transcript parsing failed",
      };
    }
  });

export const getDocumentStatusInput = z.object({
  documentId: z.string().cuid(),
});

export const getDocumentStatusOutput = z.object({
  id: z.string().cuid(),
  studentProfileId: z.string().cuid(),
  fileName: z.string(),
  fileType: z.enum(["pdf", "jpeg", "png", "edi"]),
  extractionStatus: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
    "PARTIAL",
    "REQUIRES_REVIEW",
  ]),
  uploadedAt: z.date(),
  processedAt: z.date().nullable(),
  extractionStartedAt: z.date().nullable(),
  extractionCompletedAt: z.date().nullable(),
  extractionMetadata: z.any().nullable(),
});

export const getDocumentStatus = protectedProcedure
  .input(getDocumentStatusInput)
  .output(getDocumentStatusOutput)
  .query(async ({ input, ctx }) => {
    logger.info("Fetching document status", {
      documentId: input.documentId,
      user: ctx.user.id,
    });

    try {
      const document = await prisma.transcriptDocument.findUnique({
        where: { id: input.documentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      return {
        id: document.id,
        studentProfileId: document.studentProfileId,
        fileName: document.fileName,
        fileType: document.fileType as any,
        extractionStatus: document.extractionStatus,
        uploadedAt: document.uploadedAt,
        processedAt: document.processedAt,
        extractionStartedAt: document.extractionStartedAt,
        extractionCompletedAt: document.extractionCompletedAt,
        extractionMetadata: document.extractionMetadata,
      } as any;
    } catch (error) {
      logger.error("Failed to fetch document status", error);
      throw error;
    }
  });

export const validateDocumentInput = z.object({
  fileName: z.string().min(1),
  fileType: z.string(),
  fileSize: z.number().positive(),
});

export const validateDocumentOutput = z.object({
  valid: z.boolean(),
  fileName: z.string(),
  fileType: z.string(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export const validateDocument = protectedProcedure
  .input(validateDocumentInput)
  .output(validateDocumentOutput)
  .query(async ({ input }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const allowedTypes = ["pdf", "jpeg", "png", "edi"];
    const allowedExtensions = {
      pdf: [".pdf"],
      jpeg: [".jpg", ".jpeg"],
      png: [".png"],
      edi: [".edi", ".txt"],
    };

    const fileExtension = input.fileName
      .slice(input.fileName.lastIndexOf("."))
      .toLowerCase();

    const normalizedFileType = input.fileType
      .toLowerCase()
      .replace("image/", "")
      .replace("application/", "");

    if (!allowedTypes.includes(normalizedFileType)) {
      errors.push(
        `Invalid file type: ${input.fileType}. Allowed types: ${allowedTypes.join(", ")}`,
      );
    }

    const maxFileSize = 10 * 1024 * 1024;
    if (input.fileSize > maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of 10MB`);
    }

    const minFileSize = 1024;
    if (input.fileSize < minFileSize) {
      warnings.push(
        `File size is unusually small (${input.fileSize} bytes). Ensure file is not empty.`,
      );
    }

    const expectedExtensions =
      allowedExtensions[normalizedFileType as keyof typeof allowedExtensions];
    if (expectedExtensions && !expectedExtensions.includes(fileExtension)) {
      warnings.push(
        `File extension ${fileExtension} does not match file type ${normalizedFileType}`,
      );
    }

    if (input.fileType.includes("pdf") && !fileExtension.includes("pdf")) {
      warnings.push("PDF files should have .pdf extension");
    }

    return {
      valid: errors.length === 0,
      fileName: input.fileName,
      fileType: input.fileType,
      errors,
      warnings,
    };
  });

export const documentsRouter = router({
  uploadDocument,
  processOcr,
  parseTranscript,
  getDocumentStatus,
  validateDocument,
});
