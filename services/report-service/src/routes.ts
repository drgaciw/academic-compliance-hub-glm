import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { successResponse, errorResponse } from "@aah/api-utils";
import {
  EligibilityReportSchema,
  TransferCreditReportSchema,
  BatchReportRequestSchema,
  SignatureDataSchema,
  ReportTemplateSchema,
  ReportStatus,
  ReportType,
  ReportFormat,
  ReportJob,
} from "./types";
import {
  addReportJob,
  getReportJob,
  deleteReportJob,
  getQueueStats,
} from "./queue";
import { startReportWorker } from "./worker";
import { prisma } from "@aah/database";
import * as fs from "fs/promises";
import * as path from "path";
import Papa from "papaparse";
import { WebSocketServer, WebSocket } from "ws";

const app = new Hono();
const activeConnections = new Map<string, Set<WebSocket>>();

function broadcastToClient(clientId: string, message: any): void {
  const connections = activeConnections.get(clientId);
  if (connections) {
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

function toPrismaReportType(type: ReportType): string {
  const map: Record<ReportType, string> = {
    eligibility: "ELIGIBILITY",
    "transfer-credit": "TRANSFER_CREDIT",
    compliance: "COMPLIANCE",
    progress: "PROGRESS",
    custom: "CUSTOM",
  };
  return map[type];
}

function toPrismaReportFormat(format: ReportFormat): string {
  const map: Record<ReportFormat, string> = {
    pdf: "PDF",
    csv: "CSV",
    json: "JSON",
  };
  return map[format];
}

function toPrismaReportStatus(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
  };
  return map[status];
}

app.get("/health", (c) => {
  return c.json(successResponse({ status: "ok", service: "report-service" }));
});

app.post(
  "/api/reports/eligibility",
  zValidator("json", EligibilityReportSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const reportId = crypto.randomUUID();

      await prisma.reportMetadata.create({
        data: {
          id: reportId,
          type: "ELIGIBILITY",
          format: "PDF",
          status: "PENDING",
          userId: c.req.header("x-user-id"),
          studentProfileId: data.studentId,
          progress: 0,
          metadata: JSON.stringify(data),
        },
      });

      const job = await addReportJob({
        type: ReportType.ELIGIBILITY,
        format: ReportFormat.PDF,
        status: ReportStatus.PENDING,
        data,
        userId: c.req.header("x-user-id"),
        studentId: data.studentId,
      });

      broadcastToClient(job.userId || "anonymous", {
        type: "report_update",
        jobId: job.id,
        status: job.status,
      });

      return c.json(
        successResponse({
          reportId: job.id,
          status: "pending",
          message: "Report generation started",
        }),
        202,
      );
    } catch (error) {
      return c.json(
        errorResponse(
          "REPORT_GENERATION_FAILED",
          error instanceof Error ? error.message : "Failed to generate report",
        ),
        500,
      );
    }
  },
);

app.post(
  "/api/reports/transfer-credit",
  zValidator("json", TransferCreditReportSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const reportId = crypto.randomUUID();

      await prisma.reportMetadata.create({
        data: {
          id: reportId,
          type: "TRANSFER_CREDIT",
          format: "PDF",
          status: "PENDING",
          userId: c.req.header("x-user-id"),
          studentProfileId: data.studentId,
          progress: 0,
          metadata: JSON.stringify(data),
        },
      });

      const job = await addReportJob({
        type: ReportType.TRANSFER_CREDIT,
        format: ReportFormat.PDF,
        status: ReportStatus.PENDING,
        data,
        userId: c.req.header("x-user-id"),
        studentId: data.studentId,
      });

      return c.json(
        successResponse({
          reportId: job.id,
          status: "pending",
          message: "Transfer credit report generation started",
        }),
        202,
      );
    } catch (error) {
      return c.json(
        errorResponse(
          "TRANSFER_CREDIT_REPORT_FAILED",
          error instanceof Error
            ? error.message
            : "Failed to generate transfer credit report",
        ),
        500,
      );
    }
  },
);

app.post(
  "/api/reports/batch",
  zValidator("json", BatchReportRequestSchema),
  async (c) => {
    try {
      const {
        reportType,
        studentIds,
        format = ReportFormat.PDF,
        templateId,
      } = c.req.valid("json");
      const userId = c.req.header("x-user-id");

      const reports = [];
      const batchId = crypto.randomUUID();

      for (const studentId of studentIds) {
        const reportId = crypto.randomUUID();

        await prisma.reportMetadata.create({
          data: {
            id: reportId,
            type: toPrismaReportType(reportType) as any,
            format: toPrismaReportFormat(format) as any,
            status: "PENDING",
            userId,
            studentProfileId: studentId,
            templateId,
            progress: 0,
            metadata: JSON.stringify({ batchId }),
          },
        });

        const job = await addReportJob({
          type: reportType,
          format: format,
          status: ReportStatus.PENDING,
          data: { studentId, reportType },
          userId,
          studentId,
          templateId,
        } as any);

        reports.push({
          reportId: job.id,
          studentId,
          status: "pending",
        });
      }

      return c.json(
        successResponse({
          batchId,
          reports,
          total: reports.length,
          message: "Batch report generation started",
        }),
        202,
      );
    } catch (error) {
      return c.json(
        errorResponse(
          "BATCH_REPORT_FAILED",
          error instanceof Error
            ? error.message
            : "Failed to generate batch reports",
        ),
        500,
      );
    }
  },
);

app.get("/api/reports/templates", async (c) => {
  try {
    const templates = await prisma.reportTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return c.json(successResponse(templates));
  } catch (error) {
    return c.json(
      errorResponse(
        "TEMPLATES_FETCH_FAILED",
        error instanceof Error ? error.message : "Failed to fetch templates",
      ),
      500,
    );
  }
});

app.post(
  "/api/reports/templates",
  zValidator("json", ReportTemplateSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const userId = c.req.header("x-user-id");

      const template = await prisma.reportTemplate.create({
        data: {
          name: data.name,
          description: data.description,
          type: toPrismaReportType(data.type) as any,
          customTemplate: data.customTemplate,
          signatureFields: data.signatureFields as any,
          createdBy: userId,
        },
      });

      return c.json(successResponse(template), 201);
    } catch (error) {
      return c.json(
        errorResponse(
          "TEMPLATE_CREATION_FAILED",
          error instanceof Error ? error.message : "Failed to create template",
        ),
        500,
      );
    }
  },
);

app.get("/api/reports/:id", async (c) => {
  try {
    const reportId = c.req.param("id");

    const report = await prisma.reportMetadata.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return c.json(errorResponse("NOT_FOUND", "Report not found"), 404);
    }

    const job = await getReportJob(reportId);

    const response = {
      id: report.id,
      type: report.type,
      format: report.format,
      status: job?.status || report.status,
      studentId: report.studentProfileId,
      templateId: report.templateId,
      fileName: report.fileName,
      fileSize: report.fileSize,
      progress: job?.progress || report.progress,
      createdAt: report.createdAt,
      completedAt: report.completedAt,
      expiresAt: report.expiresAt,
      signedAt: report.signedAt,
      error: report.error,
    };

    return c.json(successResponse(response));
  } catch (error) {
    return c.json(
      errorResponse(
        "REPORT_FETCH_FAILED",
        error instanceof Error ? error.message : "Failed to fetch report",
      ),
      500,
    );
  }
});

app.get("/api/reports/:id/download", async (c) => {
  try {
    const reportId = c.req.param("id");

    const report = await prisma.reportMetadata.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return c.json(errorResponse("NOT_FOUND", "Report not found"), 404);
    }

    if (report.status !== "COMPLETED") {
      return c.json(
        errorResponse("REPORT_NOT_READY", "Report is not ready for download"),
        400,
      );
    }

    if (report.filePath) {
      try {
        const fileBuffer = await fs.readFile(report.filePath);
        return c.newResponse(fileBuffer.buffer as ArrayBuffer, 200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${report.fileName}"`,
          "Content-Length": fileBuffer.length.toString(),
        });
      } catch {
        return c.json(
          errorResponse("FILE_NOT_FOUND", "Report file not found"),
          404,
        );
      }
    }

    return c.json(
      errorResponse("NO_FILE", "No file available for download"),
      404,
    );
  } catch (error) {
    return c.json(
      errorResponse(
        "DOWNLOAD_FAILED",
        error instanceof Error ? error.message : "Failed to download report",
      ),
      500,
    );
  }
});

app.post(
  "/api/reports/:id/sign",
  zValidator("json", SignatureDataSchema),
  async (c) => {
    try {
      const reportId = c.req.param("id");
      const signatureData = c.req.valid("json");

      const report = await prisma.reportMetadata.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return c.json(errorResponse("NOT_FOUND", "Report not found"), 404);
      }

      if (report.status !== "COMPLETED") {
        return c.json(
          errorResponse(
            "REPORT_NOT_READY",
            "Report must be completed before signing",
          ),
          400,
        );
      }

      if (report.signedAt) {
        return c.json(
          errorResponse("ALREADY_SIGNED", "Report is already signed"),
          400,
        );
      }

      const queue = (await import("./queue")).getReportQueue();

      const signatureJob = await queue.add("sign-report", {
        reportId,
        signatureData,
      } as any);

      await prisma.reportMetadata.update({
        where: { id: reportId },
        data: {
          status: "PROCESSING",
        },
      });

      return c.json(
        successResponse({
          reportId,
          signatureJobId: String(signatureJob.id),
          status: "signing",
          message: "Digital signature process started",
        }),
        202,
      );
    } catch (error) {
      return c.json(
        errorResponse(
          "SIGNATURE_FAILED",
          error instanceof Error ? error.message : "Failed to apply signature",
        ),
        500,
      );
    }
  },
);

app.delete("/api/reports/:id", async (c) => {
  try {
    const reportId = c.req.param("id");

    const report = await prisma.reportMetadata.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return c.json(errorResponse("NOT_FOUND", "Report not found"), 404);
    }

    await deleteReportJob(reportId);

    if (report.filePath) {
      await fs.unlink(report.filePath).catch(() => {});
    }

    await prisma.reportMetadata.delete({
      where: { id: reportId },
    });

    return c.json(successResponse({ message: "Report deleted successfully" }));
  } catch (error) {
    return c.json(
      errorResponse(
        "DELETE_FAILED",
        error instanceof Error ? error.message : "Failed to delete report",
      ),
      500,
    );
  }
});

app.get("/api/reports/export/csv", async (c) => {
  try {
    const { type, status, startDate, endDate } = c.req.query();

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const reports = await prisma.reportMetadata.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const csvData = reports.map((report) => ({
      id: report.id,
      type: report.type,
      format: report.format,
      status: report.status,
      studentId: report.studentProfileId,
      templateId: report.templateId,
      fileName: report.fileName,
      fileSize: report.fileSize,
      progress: report.progress,
      createdAt: report.createdAt.toISOString(),
      completedAt: report.completedAt?.toISOString(),
      expiresAt: report.expiresAt?.toISOString(),
      signedAt: report.signedAt?.toISOString(),
      error: report.error,
    }));

    const csv = Papa.unparse(csvData);

    return c.newResponse(csv, 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="reports-export.csv"',
    });
  } catch (error) {
    return c.json(
      errorResponse(
        "CSV_EXPORT_FAILED",
        error instanceof Error ? error.message : "Failed to export CSV",
      ),
      500,
    );
  }
});

app.get("/api/reports/export/json", async (c) => {
  try {
    const {
      type,
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = c.req.query();

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
      prisma.reportMetadata.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.reportMetadata.count({ where }),
    ]);

    const jsonData = reports.map((report) => ({
      id: report.id,
      type: report.type,
      format: report.format,
      status: report.status,
      studentId: report.studentProfileId,
      templateId: report.templateId,
      fileName: report.fileName,
      fileSize: report.fileSize,
      progress: report.progress,
      createdAt: report.createdAt.toISOString(),
      completedAt: report.completedAt?.toISOString(),
      expiresAt: report.expiresAt?.toISOString(),
      signedAt: report.signedAt?.toISOString(),
      error: report.error,
    }));

    return c.json(
      successResponse({
        items: jsonData,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total,
        },
      }),
    );
  } catch (error) {
    return c.json(
      errorResponse(
        "JSON_EXPORT_FAILED",
        error instanceof Error ? error.message : "Failed to export JSON",
      ),
      500,
    );
  }
});

app.get("/api/reports/stats/queue", async (c) => {
  try {
    const stats = await getQueueStats();

    return c.json(successResponse(stats));
  } catch (error) {
    return c.json(
      errorResponse(
        "QUEUE_STATS_FAILED",
        error instanceof Error ? error.message : "Failed to get queue stats",
      ),
      500,
    );
  }
});

app.post("/api/reports/worker/start", (c) => {
  startReportWorker();
  return c.json(successResponse({ message: "Worker started" }));
});

export default app;
