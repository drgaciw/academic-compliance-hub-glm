import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { logger } from "../middleware";
import { EligibilityStatusSchema } from "@aah/schemas";
import { prisma } from "@aah/database";

export const complianceEvaluationInput = z.object({
  studentId: z.string().cuid(),
  category: z.enum([
    "ACADEMIC_PROGRESS",
    "TRANSFER_CREDITS",
    "ELIGIBILITY",
    "NCAA_REQUIREMENTS",
    "CORE_COURSES",
  ]),
  academicYear: z.string(),
});

export const complianceEvaluationOutput = z.object({
  studentId: z.string().cuid(),
  category: z.string(),
  academicYear: z.string(),
  status: EligibilityStatusSchema,
  results: z.array(
    z.object({
      requirement: z.string(),
      status: z.enum(["COMPLIANT", "NON_COMPLIANT", "PENDING"]),
      currentValue: z.any().optional(),
      requiredValue: z.any().optional(),
      message: z.string(),
      severity: z.enum(["high", "medium", "low"]),
    }),
  ),
  recommendations: z.array(z.string()),
  lastEvaluated: z.date(),
});

export const evaluateCompliance = protectedProcedure
  .input(complianceEvaluationInput)
  .output(complianceEvaluationOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Evaluating compliance", {
      studentId: input.studentId,
      category: input.category,
      user: ctx.user.id,
    });

    try {
      const results = [
        {
          requirement: "Minimum GPA (2.3)",
          status: "COMPLIANT" as const,
          currentValue: 2.8,
          requiredValue: 2.3,
          message: "Student meets minimum GPA requirement",
          severity: "high" as const,
        },
        {
          requirement: "Credit Progression (24 credits/year)",
          status: "PENDING" as const,
          currentValue: 18,
          requiredValue: 24,
          message: "On track to complete 24 credits by end of academic year",
          severity: "high" as const,
        },
        {
          requirement: "Core Course Completion",
          status: "COMPLIANT" as const,
          currentValue: 8,
          requiredValue: 6,
          message: "Exceeds minimum core course requirements",
          severity: "high" as const,
        },
      ];

      return {
        studentId: input.studentId,
        category: input.category,
        academicYear: input.academicYear,
        status: "ELIGIBLE",
        results,
        recommendations: [
          "Continue maintaining current GPA",
          "Ensure completion of remaining 6 credits by semester end",
          "Schedule meeting with academic advisor",
        ],
        lastEvaluated: new Date(),
      };
    } catch (error) {
      logger.error("Compliance evaluation failed", error);
      throw error;
    }
  });

export const complianceStatusInput = z.object({
  studentId: z.string().cuid().optional(),
  academicYear: z.string().optional(),
});

export const complianceStatusOutput = z.object({
  studentId: z.string().cuid(),
  overallStatus: EligibilityStatusSchema,
  academicYear: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
      status: EligibilityStatusSchema,
      lastEvaluated: z.date(),
    }),
  ),
  nextEvaluationDate: z.date(),
  documents: z.array(
    z.object({
      type: z.string(),
      status: z.enum(["SUBMITTED", "PENDING", "APPROVED", "REJECTED"]),
      lastUpdated: z.date(),
    }),
  ),
});

export const getComplianceStatus = protectedProcedure
  .input(complianceStatusInput)
  .output(complianceStatusOutput)
  .query(async ({ input, ctx }) => {
    logger.info("Fetching compliance status", {
      studentId: input.studentId,
      user: ctx.user.id,
    });

    try {
      const studentId = input.studentId || "student_default";
      const academicYear = input.academicYear || "2024-2025";

      return {
        studentId,
        overallStatus: "ELIGIBLE",
        academicYear,
        categories: [
          {
            name: "ACADEMIC_PROGRESS",
            status: "ELIGIBLE",
            lastEvaluated: new Date(),
          },
          {
            name: "TRANSFER_CREDITS",
            status: "ELIGIBLE",
            lastEvaluated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            name: "ELIGIBILITY",
            status: "ELIGIBLE",
            lastEvaluated: new Date(),
          },
          {
            name: "NCAA_REQUIREMENTS",
            status: "ELIGIBLE",
            lastEvaluated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
          {
            name: "CORE_COURSES",
            status: "ELIGIBLE",
            lastEvaluated: new Date(),
          },
        ],
        nextEvaluationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        documents: [
          {
            type: "TRANSCRIPT",
            status: "APPROVED",
            lastUpdated: new Date(),
          },
          {
            type: "TRANSFER_CREDIT_EVALUATION",
            status: "APPROVED",
            lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        ],
      };
    } catch (error) {
      logger.error("Failed to fetch compliance status", error);
      throw error;
    }
  });

export const complianceHistoryInput = z.object({
  studentId: z.string().cuid(),
  category: z
    .enum([
      "ACADEMIC_PROGRESS",
      "TRANSFER_CREDITS",
      "ELIGIBILITY",
      "NCAA_REQUIREMENTS",
      "CORE_COURSES",
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
});

export const complianceHistoryOutput = z.object({
  studentId: z.string().cuid(),
  records: z.array(
    z.object({
      id: z.string().cuid(),
      category: z.string(),
      requirement: z.string(),
      status: z.enum(["PENDING", "COMPLETED", "FAILED", "EXEMPTED"]),
      notes: z.string().nullable().optional(),
      dueDate: z.date().nullable(),
      completedAt: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  ),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const getComplianceHistory = protectedProcedure
  .input(complianceHistoryInput)
  .output(complianceHistoryOutput)
  .query(async ({ input, ctx }) => {
    logger.info("Fetching compliance history", {
      studentId: input.studentId,
      category: input.category,
      user: ctx.user.id,
    });

    try {
      const where: any = {
        studentId: input.studentId,
      };

      if (input.category) {
        where.category = input.category;
      }

      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) {
          where.createdAt.gte = new Date(input.startDate);
        }
        if (input.endDate) {
          where.createdAt.lte = new Date(input.endDate);
        }
      }

      const records = await prisma.complianceRecord.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      const total = await prisma.complianceRecord.count({ where });

      return {
        studentId: input.studentId,
        records,
        total,
        page: 1,
        pageSize: input.limit,
      };
    } catch (error) {
      logger.error("Failed to fetch compliance history", error);
      throw error;
    }
  });

export const createRuleInput = z.object({
  bylawNumber: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  division: z
    .enum(["DIVISION_I", "DIVISION_II", "DIVISION_III", "NAIA", "NJCAA"])
    .optional(),
  category: z.string().min(1),
  subCategory: z.string().optional(),
  agentType: z
    .enum([
      "EVALUATION_AGENT",
      "COMPLIANCE_AGENT",
      "DOCUMENT_AGENT",
      "RULE_ENGINE",
      "NOTIFICATION_AGENT",
      "ADVISOR_AGENT",
    ])
    .optional(),
  effectiveDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  metadata: z.any().optional(),
});

export const createRuleOutput = z.object({
  id: z.string().cuid(),
  bylawNumber: z.string(),
  title: z.string(),
  division: z
    .enum(["DIVISION_I", "DIVISION_II", "DIVISION_III", "NAIA", "NJCAA"])
    .nullable(),
  category: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const createComplianceRule = adminProcedure
  .input(createRuleInput)
  .output(createRuleOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Creating compliance rule", {
      bylawNumber: input.bylawNumber,
      category: input.category,
      user: ctx.user.id,
    });

    try {
      const rule = await prisma.nCAARule.create({
        data: {
          bylawNumber: input.bylawNumber,
          title: input.title,
          description: input.description,
          division: input.division,
          category: input.category,
          subCategory: input.subCategory,
          agentType: input.agentType,
          effectiveDate: input.effectiveDate
            ? new Date(input.effectiveDate)
            : null,
          expirationDate: input.expirationDate
            ? new Date(input.expirationDate)
            : null,
          metadata: input.metadata,
          isActive: true,
          version: 1,
        },
      });

      return {
        id: rule.id,
        bylawNumber: rule.bylawNumber,
        title: rule.title,
        division: rule.division as any,
        category: rule.category,
        isActive: rule.isActive,
        createdAt: rule.createdAt,
      } as any;
    } catch (error) {
      logger.error("Failed to create compliance rule", error);
      throw error;
    }
  });

export const updateRuleInput = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  division: z
    .enum(["DIVISION_I", "DIVISION_II", "DIVISION_III", "NAIA", "NJCAA"])
    .optional(),
  category: z.string().min(1).optional(),
  subCategory: z.string().optional(),
  agentType: z
    .enum([
      "EVALUATION_AGENT",
      "COMPLIANCE_AGENT",
      "DOCUMENT_AGENT",
      "RULE_ENGINE",
      "NOTIFICATION_AGENT",
      "ADVISOR_AGENT",
    ])
    .optional(),
  isActive: z.boolean().optional(),
  effectiveDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  metadata: z.any().optional(),
});

export const updateComplianceRule = adminProcedure
  .input(updateRuleInput)
  .output(createRuleOutput)
  .mutation(async ({ input, ctx }) => {
    logger.info("Updating compliance rule", {
      ruleId: input.id,
      user: ctx.user.id,
    });

    try {
      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.division !== undefined) updateData.division = input.division;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.subCategory !== undefined)
        updateData.subCategory = input.subCategory;
      if (input.agentType !== undefined) updateData.agentType = input.agentType;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.effectiveDate !== undefined)
        updateData.effectiveDate = new Date(input.effectiveDate);
      if (input.expirationDate !== undefined)
        updateData.expirationDate = new Date(input.expirationDate);
      if (input.metadata !== undefined) updateData.metadata = input.metadata;

      const rule = await prisma.nCAARule.update({
        where: { id: input.id },
        data: updateData,
      });

      return {
        id: rule.id,
        bylawNumber: rule.bylawNumber,
        title: rule.title,
        division: rule.division as any,
        category: rule.category,
        isActive: rule.isActive,
        createdAt: rule.createdAt,
      } as any;
    } catch (error) {
      logger.error("Failed to update compliance rule", error);
      throw error;
    }
  });

export const deleteComplianceRule = adminProcedure
  .input(z.object({ id: z.string().cuid() }))
  .output(z.object({ success: z.boolean(), id: z.string().cuid() }))
  .mutation(async ({ input, ctx }) => {
    logger.info("Deleting compliance rule", {
      ruleId: input.id,
      user: ctx.user.id,
    });

    try {
      await prisma.nCAARule.delete({
        where: { id: input.id },
      });

      return { success: true, id: input.id };
    } catch (error) {
      logger.error("Failed to delete compliance rule", error);
      throw error;
    }
  });

export const complianceRouter = router({
  evaluateCompliance,
  getComplianceStatus,
  getComplianceHistory,
  createComplianceRule,
  updateComplianceRule,
  deleteComplianceRule,
});
