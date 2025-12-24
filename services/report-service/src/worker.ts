import Queue, { Job } from "bull";
import { ReportJob, ReportType, ReportStatus, ReportFormat } from "./types";
import {
  generateComplianceReport,
  generateTransferCreditReport,
  generateSignedReport,
  validateReportSignature,
} from "@academic-compliance/report-generation";
import { prisma } from "@aah/database";
import * as fs from "fs/promises";
import * as path from "path";

const REPORTS_DIR =
  process.env.REPORTS_DIR || path.join(process.cwd(), "reports");

export async function processReportJob(job: Job<ReportJob>): Promise<void> {
  const { id, type, format, data, studentId } = job.data;

  try {
    await job.progress(10);

    const reportsDir = path.join(REPORTS_DIR, studentId || "anonymous");
    await fs.mkdir(reportsDir, { recursive: true });

    await job.progress(20);

    let pdfBuffer: Uint8Array;

    switch (type) {
      case ReportType.ELIGIBILITY:
      case ReportType.COMPLIANCE:
        await job.progress(30);
        pdfBuffer = await generateComplianceReport(data);
        break;

      case ReportType.TRANSFER_CREDIT:
        await job.progress(30);
        pdfBuffer = await generateTransferCreditReport(data);
        break;

      case ReportType.PROGRESS:
      case ReportType.CUSTOM:
        await job.progress(30);
        pdfBuffer = await generateComplianceReport(data);
        break;

      default:
        throw new Error(`Unsupported report type: ${type}`);
    }

    await job.progress(60);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${type}-${id.slice(0, 8)}-${timestamp}.pdf`;
    const outputPath = path.join(reportsDir, fileName);

    await fs.writeFile(outputPath, Buffer.from(pdfBuffer));

    await job.progress(80);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const prismaType =
      type === "compliance"
        ? "COMPLIANCE"
        : type === "eligibility"
          ? "ELIGIBILITY"
          : type === "transfer-credit"
            ? "TRANSFER_CREDIT"
            : type === "progress"
              ? "PROGRESS"
              : "CUSTOM";
    const prismaFormat =
      format === "pdf" ? "PDF" : format === "csv" ? "CSV" : "JSON";

    await prisma.$transaction(async (tx) => {
      const report = await tx.reportMetadata.create({
        data: {
          id,
          type: prismaType as any,
          format: prismaFormat as any,
          status: "COMPLETED",
          userId: job.data.userId,
          studentProfileId: job.data.studentId,
          templateId: job.data.templateId,
          filePath: outputPath,
          fileName,
          fileSize: Buffer.byteLength(pdfBuffer),
          progress: 100,
          expiresAt,
          metadata: JSON.stringify({
            data,
            generatedAt: new Date().toISOString(),
          }),
        },
      });

      if (studentId) {
        const profile = await tx.studentProfile.findUnique({
          where: { studentId },
        });

        if (profile) {
          await tx.studentProfile.update({
            where: { id: profile.id },
            data: { updatedAt: new Date() },
          });
        }
      }
    });

    await job.progress(100);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await prisma.reportMetadata
      .update({
        where: { id },
        data: {
          status: "FAILED",
          error: errorMessage,
          metadata: JSON.stringify({
            error: errorMessage,
            failedAt: new Date().toISOString(),
          }),
        },
      })
      .catch(() => {});

    throw error;
  }
}

export async function processSignatureJob(
  job: Job<{ reportId: string; signatureData: any }>,
): Promise<void> {
  const { reportId, signatureData } = job.data;

  try {
    await job.progress(10);

    const report = await prisma.reportMetadata.findUnique({
      where: { id: reportId },
    });

    if (!report || report.status !== "COMPLETED") {
      throw new Error("Report not found or not completed");
    }

    await job.progress(30);

    if (!report.filePath) {
      throw new Error("Report file path not found");
    }

    const pdfBuffer = await fs.readFile(report.filePath);

    await job.progress(50);

    const signatureFields = report.signatureFields;
    const signatureField: any =
      signatureFields &&
      Array.isArray(signatureFields) &&
      signatureFields.length > 0
        ? signatureFields[0]
        : {
            name: "signature",
            label: "Signature",
            x: 14,
            y: 260,
            width: 100,
            height: 20,
            pageNumber: 1,
            required: true,
          };

    const signedBuffer = await generateSignedReport(
      Uint8Array.from(pdfBuffer),
      signatureData,
      signatureField,
    );

    await job.progress(70);

    const signedFileName = `signed-${report.fileName}`;
    const signedFilePath = path.join(
      path.dirname(report.filePath),
      signedFileName,
    );

    await fs.writeFile(signedFilePath, Buffer.from(signedBuffer));

    await job.progress(90);

    await prisma.reportMetadata.update({
      where: { id: reportId },
      data: {
        filePath: signedFilePath,
        fileName: signedFileName,
        signatureData: JSON.stringify(signatureData),
        signedAt: new Date(),
        metadata: JSON.stringify({
          ...(typeof report.metadata === "string"
            ? JSON.parse(report.metadata)
            : report.metadata),
          signedAt: new Date().toISOString(),
        }),
      },
    });

    await job.progress(100);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await prisma.reportMetadata
      .update({
        where: { id: reportId },
        data: {
          error: errorMessage,
        },
      })
      .catch(() => {});

    throw error;
  }
}

export async function processBatchReportsJob(
  job: Job<{ requests: Array<{ studentId: string; data: any }> }>,
): Promise<void> {
  const { requests } = job.data;
  const total = requests.length;

  try {
    const results = [];

    for (let i = 0; i < total; i++) {
      const request = requests[i];
      const progress = Math.round(((i + 1) / total) * 100);

      await job.progress(progress);

      try {
        const reportId = crypto.randomUUID();
        const reportsDir = path.join(REPORTS_DIR, request.studentId);
        await fs.mkdir(reportsDir, { recursive: true });

        const pdfBuffer = await generateComplianceReport(request.data);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `batch-${reportId.slice(0, 8)}-${timestamp}.pdf`;
        const outputPath = path.join(reportsDir, fileName);

        await fs.writeFile(outputPath, Buffer.from(pdfBuffer));

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await prisma.reportMetadata.create({
          data: {
            id: reportId,
            type: "COMPLIANCE",
            format: "PDF",
            status: "COMPLETED",
            studentProfileId: request.studentId,
            filePath: outputPath,
            fileName,
            fileSize: Buffer.byteLength(pdfBuffer),
            progress: 100,
            expiresAt,
          },
        });

        results.push({ success: true, reportId, studentId: request.studentId });
      } catch (error) {
        results.push({
          success: false,
          studentId: request.studentId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    await job.progress(100);
  } catch (error) {
    throw error;
  }
}

export function startReportWorker(): void {
  const queue = Queue(
    "report-generation",
    process.env.REDIS_URL || "redis://localhost:6379",
  );

  queue.process("generate-report", processReportJob);
  queue.process("sign-report", processSignatureJob);
  queue.process("batch-reports", processBatchReportsJob);

  console.log("Report worker started");

  queue.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  queue.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
  });
}

export async function cleanupExpiredJobs(): Promise<number> {
  const now = new Date();

  const expiredReports = await prisma.reportMetadata.findMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  let cleanedCount = 0;

  for (const report of expiredReports) {
    try {
      if (report.filePath) {
        await fs.unlink(report.filePath).catch(() => {});
      }

      await prisma.reportMetadata.delete({
        where: { id: report.id },
      });

      cleanedCount++;
    } catch (error) {
      console.error(`Error cleaning up report ${report.id}:`, error);
    }
  }

  return cleanedCount;
}
