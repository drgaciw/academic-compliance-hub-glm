import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { logger } from "../middleware";
import { prisma } from "@aah/database";

const generateReportInput = z.object({
  type: z.enum([
    "ELIGIBILITY",
    "TRANSFER_CREDIT",
    "COMPLIANCE",
    "PROGRESS",
    "CUSTOM",
  ]),
  format: z.enum(["PDF", "CSV", "JSON"]).default("PDF"),
  studentId: z.string().cuid(),
  templateId: z.string().cuid().optional(),
  metadata: z.record(z.any()).optional(),
});

export const generateReport = protectedProcedure
  .input(generateReportInput)
  .output(
    z.object({
      reportId: z.string(),
      status: z.string(),
      message: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Generating report", {
      type: input.type,
      studentId: input.studentId,
      user: ctx.user.id,
    });

    try {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: input.studentId },
      });

      if (!studentProfile) {
        throw new Error("Student profile not found");
      }

      const reportMetadata = await prisma.reportMetadata.create({
        data: {
          type: input.type as any,
          format: input.format as any,
          status: "PENDING",
          userId: ctx.user.id,
          studentProfileId: input.studentId,
          templateId: input.templateId,
          progress: 0,
          metadata: input.metadata as any,
        },
      });

      return {
        reportId: reportMetadata.id,
        status: "pending",
        message: "Report generation started",
      };
    } catch (error) {
      logger.error("Failed to generate report", error);
      throw error;
    }
  });

const batchGenerateReportInput = z.object({
  type: z.enum([
    "ELIGIBILITY",
    "TRANSFER_CREDIT",
    "COMPLIANCE",
    "PROGRESS",
    "CUSTOM",
  ]),
  format: z.enum(["PDF", "CSV", "JSON"]).default("PDF"),
  studentIds: z.array(z.string().cuid()),
  templateId: z.string().cuid().optional(),
  metadata: z.record(z.any()).optional(),
});

export const batchGenerateReports = protectedProcedure
  .input(batchGenerateReportInput)
  .output(
    z.object({
      batchId: z.string(),
      reports: z.array(
        z.object({
          reportId: z.string(),
          studentId: z.string(),
          status: z.string(),
        }),
      ),
      total: z.number(),
      message: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Batch generating reports", {
      type: input.type,
      studentCount: input.studentIds.length,
      user: ctx.user.id,
    });

    try {
      const batchId = crypto.randomUUID();
      const reports = [];

      for (const studentId of input.studentIds) {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { id: studentId },
        });

        if (!studentProfile) {
          continue;
        }

        const reportMetadata = await prisma.reportMetadata.create({
          data: {
            type: input.type as any,
            format: input.format as any,
            status: "PENDING",
            userId: ctx.user.id,
            studentProfileId: studentId,
            templateId: input.templateId,
            progress: 0,
            metadata: { ...input.metadata, batchId } as any,
          },
        });

        reports.push({
          reportId: reportMetadata.id,
          studentId,
          status: "pending",
        });
      }

      return {
        batchId,
        reports,
        total: reports.length,
        message: "Batch report generation started",
      };
    } catch (error) {
      logger.error("Failed to batch generate reports", error);
      throw error;
    }
  });

const getReportStatusInput = z.object({
  reportId: z.string().cuid(),
});

export const getReportStatus = protectedProcedure
  .input(getReportStatusInput)
  .output(
    z.object({
      id: z.string(),
      type: z.string(),
      format: z.string(),
      status: z.string(),
      progress: z.number(),
      studentId: z.string().nullable(),
      templateId: z.string().nullable(),
      fileName: z.string().nullable(),
      fileSize: z.number().nullable(),
      error: z.string().nullable(),
      createdAt: z.date(),
      completedAt: z.date().nullable(),
      expiresAt: z.date().nullable(),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Fetching report status", {
      reportId: input.reportId,
      user: ctx.user.id,
    });

    try {
      const report = await prisma.reportMetadata.findUnique({
        where: { id: input.reportId },
      });

      if (!report) {
        throw new Error("Report not found");
      }

      if (ctx.user.role !== "ADMIN" && report.userId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return {
        id: report.id,
        type: report.type,
        format: report.format,
        status: report.status,
        progress: report.progress,
        studentId: report.studentProfileId,
        templateId: report.templateId,
        fileName: report.fileName,
        fileSize: report.fileSize,
        error: report.error,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
        expiresAt: report.expiresAt,
      };
    } catch (error) {
      logger.error("Failed to fetch report status", error);
      throw error;
    }
  });

const listReportsInput = z.object({
  type: z
    .enum([
      "ELIGIBILITY",
      "TRANSFER_CREDIT",
      "COMPLIANCE",
      "PROGRESS",
      "CUSTOM",
    ])
    .optional(),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
  studentId: z.string().cuid().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const listReports = protectedProcedure
  .input(listReportsInput)
  .output(
    z.object({
      reports: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          format: z.string(),
          status: z.string(),
          progress: z.number(),
          studentId: z.string().nullable(),
          templateId: z.string().nullable(),
          fileName: z.string().nullable(),
          fileSize: z.number().nullable(),
          createdAt: z.date(),
          completedAt: z.date().nullable(),
        }),
      ),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Listing reports", {
      user: ctx.user.id,
      filters: {
        type: input.type,
        status: input.status,
        studentId: input.studentId,
      },
    });

    try {
      const where: any = {};

      if (ctx.user.role !== "ADMIN") {
        where.OR = [{ userId: ctx.user.id }];
      }

      if (input.type) {
        where.type = input.type;
      }

      if (input.status) {
        where.status = input.status;
      }

      if (input.studentId) {
        if (ctx.user.role !== "ADMIN") {
          throw new Error("Access denied");
        }
        where.studentProfileId = input.studentId;
      }

      const [reports, total] = await Promise.all([
        prisma.reportMetadata.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: "desc" },
        }),
        prisma.reportMetadata.count({ where }),
      ]);

      const mappedReports = reports.map((r) => ({
        id: r.id,
        type: r.type,
        format: r.format,
        status: r.status,
        progress: r.progress,
        studentId: r.studentProfileId,
        templateId: r.templateId,
        fileName: r.fileName,
        fileSize: r.fileSize,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
      }));

      return {
        reports: mappedReports,
        total,
        limit: input.limit,
        offset: input.offset,
        hasMore: input.offset + input.limit < total,
      };
    } catch (error) {
      logger.error("Failed to list reports", error);
      throw error;
    }
  });

const downloadReportInput = z.object({
  reportId: z.string().cuid(),
});

export const downloadReport = protectedProcedure
  .input(downloadReportInput)
  .output(
    z.object({
      id: z.string(),
      type: z.string(),
      format: z.string(),
      status: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      downloadUrl: z.string(),
      expiresAt: z.date().nullable(),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Downloading report", {
      reportId: input.reportId,
      user: ctx.user.id,
    });

    try {
      const report = await prisma.reportMetadata.findUnique({
        where: { id: input.reportId },
      });

      if (!report) {
        throw new Error("Report not found");
      }

      if (report.status !== "COMPLETED") {
        throw new Error("Report is not ready for download");
      }

      if (ctx.user.role !== "ADMIN" && report.userId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      if (report.expiresAt && report.expiresAt < new Date()) {
        throw new Error("Report has expired");
      }

      if (!report.filePath || !report.fileName) {
        throw new Error("Report file not available");
      }

      return {
        id: report.id,
        type: report.type,
        format: report.format,
        status: report.status,
        fileName: report.fileName,
        fileSize: report.fileSize || 0,
        downloadUrl: `/api/reports/${report.id}/download`,
        expiresAt: report.expiresAt,
      };
    } catch (error) {
      logger.error("Failed to get download link", error);
      throw error;
    }
  });

const deleteReportInput = z.object({
  reportId: z.string().cuid(),
});

export const deleteReport = protectedProcedure
  .input(deleteReportInput)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Deleting report", {
      reportId: input.reportId,
      user: ctx.user.id,
    });

    try {
      const report = await prisma.reportMetadata.findUnique({
        where: { id: input.reportId },
      });

      if (!report) {
        throw new Error("Report not found");
      }

      if (ctx.user.role !== "ADMIN" && report.userId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      await prisma.reportMetadata.delete({
        where: { id: input.reportId },
      });

      return {
        success: true,
        message: "Report deleted successfully",
      };
    } catch (error) {
      logger.error("Failed to delete report", error);
      throw error;
    }
  });

const createTemplateInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "ELIGIBILITY",
    "TRANSFER_CREDIT",
    "COMPLIANCE",
    "PROGRESS",
    "CUSTOM",
  ]),
  customTemplate: z.string().optional(),
  signatureFields: z.record(z.any()).optional(),
});

export const createTemplate = adminProcedure
  .input(createTemplateInput)
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      type: z.string(),
      createdAt: z.date(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Creating report template", {
      name: input.name,
      type: input.type,
      user: ctx.user.id,
    });

    try {
      const template = await prisma.reportTemplate.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type as any,
          customTemplate: input.customTemplate,
          signatureFields: input.signatureFields as any,
          createdBy: ctx.user.id,
        },
      });

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        type: template.type,
        createdAt: template.createdAt,
      };
    } catch (error) {
      logger.error("Failed to create template", error);
      throw error;
    }
  });

const listTemplatesInput = z.object({
  type: z
    .enum([
      "ELIGIBILITY",
      "TRANSFER_CREDIT",
      "COMPLIANCE",
      "PROGRESS",
      "CUSTOM",
    ])
    .optional(),
});

export const listTemplates = protectedProcedure
  .input(listTemplatesInput)
  .output(
    z.object({
      templates: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          type: z.string(),
          createdAt: z.date(),
        }),
      ),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Listing report templates", {
      type: input.type,
      user: ctx.user.id,
    });

    try {
      const where: any = {};

      if (input.type) {
        where.type = input.type;
      }

      const templates = await prisma.reportTemplate.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return {
        templates: templates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          type: t.type,
          createdAt: t.createdAt,
        })),
      };
    } catch (error) {
      logger.error("Failed to list templates", error);
      throw error;
    }
  });

export const reportServiceRouter = router({
  generateReport,
  batchGenerateReports,
  getReportStatus,
  listReports,
  downloadReport,
  deleteReport,
  createTemplate,
  listTemplates,
});
