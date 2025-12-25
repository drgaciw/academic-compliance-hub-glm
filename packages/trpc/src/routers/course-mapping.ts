import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { logger } from "../middleware";
import { prisma } from "@aah/database";

const getCourseEquivalencyInput = z.object({
  sourceInstitutionId: z.string().cuid(),
  sourceCourseCode: z.string(),
  targetInstitutionId: z.string().cuid().optional(),
});

export const getCourseEquivalency = protectedProcedure
  .input(getCourseEquivalencyInput)
  .output(
    z.object({
      mapping: z
        .object({
          id: z.string(),
          sourceInstitution: z.object({
            id: z.string(),
            name: z.string(),
          }),
          targetInstitution: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .nullable(),
          sourceCourseCode: z.string(),
          sourceCourseTitle: z.string(),
          sourceCredits: z.number(),
          sourceSubjectArea: z.string(),
          targetCourseCode: z.string().nullable(),
          targetCourseTitle: z.string().nullable(),
          targetCredits: z.number().nullable(),
          targetSubjectArea: z.string().nullable(),
          isEquivalent: z.boolean(),
          confidenceScore: z.number(),
          verificationStatus: z.string(),
        })
        .nullable(),
      similarMappings: z.array(
        z.object({
          id: z.string(),
          sourceCourseCode: z.string(),
          sourceCourseTitle: z.string(),
          targetCourseCode: z.string().nullable(),
          targetCourseTitle: z.string().nullable(),
          similarity: z.number(),
        }),
      ),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Fetching course equivalency", {
      sourceInstitutionId: input.sourceInstitutionId,
      sourceCourseCode: input.sourceCourseCode,
      user: ctx.user.id,
    });

    try {
      const mapping = await prisma.courseMapping.findFirst({
        where: {
          sourceInstitutionId: input.sourceInstitutionId,
          sourceCourseCode: {
            equals: input.sourceCourseCode,
            mode: "insensitive",
          },
          ...(input.targetInstitutionId && {
            targetInstitutionId: input.targetInstitutionId,
          }),
        },
        include: {
          sourceInstitution: true,
          targetInstitution: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const similarMappings = await prisma.courseMapping.findMany({
        where: {
          sourceInstitutionId: input.sourceInstitutionId,
          sourceCourseCode: {
            contains: input.sourceCourseCode.slice(0, -2),
            mode: "insensitive",
          },
          id: { not: mapping?.id || "" },
        },
        take: 5,
      });

      return {
        mapping,
        similarMappings: similarMappings.map((m) => ({
          id: m.id,
          sourceCourseCode: m.sourceCourseCode,
          sourceCourseTitle: m.sourceCourseTitle,
          targetCourseCode: m.targetCourseCode,
          targetCourseTitle: m.targetCourseTitle,
          similarity: m.confidenceScore,
        })),
      };
    } catch (error) {
      logger.error("Failed to fetch course equivalency", error);
      throw error;
    }
  });

const searchCoursesInput = z.object({
  query: z.string().min(1),
  sourceInstitutionId: z.string().cuid().optional(),
  targetInstitutionId: z.string().cuid().optional(),
  subjectArea: z.string().optional(),
  minConfidence: z.number().min(0).max(1).optional().default(0.5),
  limit: z.number().min(1).max(100).optional().default(20),
});

export const searchCourses = protectedProcedure
  .input(searchCoursesInput)
  .output(
    z.object({
      results: z.array(
        z.object({
          id: z.string(),
          sourceInstitution: z.object({
            id: z.string(),
            name: z.string(),
          }),
          targetInstitution: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .nullable(),
          sourceCourseCode: z.string(),
          sourceCourseTitle: z.string(),
          targetCourseCode: z.string().nullable(),
          targetCourseTitle: z.string().nullable(),
          isEquivalent: z.boolean(),
          confidenceScore: z.number(),
          verificationStatus: z.string(),
        }),
      ),
      total: z.number(),
      query: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    logger.info("Searching courses", {
      query: input.query,
      user: ctx.user.id,
    });

    try {
      const where: any = {
        OR: [
          {
            sourceCourseCode: {
              contains: input.query,
              mode: "insensitive",
            },
          },
          {
            sourceCourseTitle: {
              contains: input.query,
              mode: "insensitive",
            },
          },
          {
            targetCourseCode: {
              contains: input.query,
              mode: "insensitive",
            },
          },
          {
            targetCourseTitle: {
              contains: input.query,
              mode: "insensitive",
            },
          },
        ],
        confidenceScore: { gte: input.minConfidence },
      };

      if (input.sourceInstitutionId) {
        where.sourceInstitutionId = input.sourceInstitutionId;
      }

      if (input.targetInstitutionId) {
        where.targetInstitutionId = input.targetInstitutionId;
      }

      if (input.subjectArea) {
        where.OR = [
          ...where.OR,
          { sourceSubjectArea: input.subjectArea },
          { targetSubjectArea: input.subjectArea },
        ];
      }

      const [results, total] = await Promise.all([
        prisma.courseMapping.findMany({
          where,
          take: input.limit,
          include: {
            sourceInstitution: true,
            targetInstitution: true,
          },
          orderBy: { confidenceScore: "desc" },
        }),
        prisma.courseMapping.count({ where }),
      ]);

      return {
        results,
        total,
        query: input.query,
      };
    } catch (error) {
      logger.error("Failed to search courses", error);
      throw error;
    }
  });

const requestEquivalencyReviewInput = z.object({
  transferEvaluationId: z.string().cuid(),
  sourceInstitutionId: z.string().cuid(),
  sourceCourseCode: z.string(),
  sourceCourseTitle: z.string(),
  sourceCredits: z.number().int().min(0),
  sourceSubjectArea: z.string(),
  targetInstitutionId: z.string().cuid().optional(),
  targetCourseCode: z.string().optional(),
  targetCourseTitle: z.string().optional(),
  targetCredits: z.number().int().min(0).optional(),
  targetSubjectArea: z.string().optional(),
  notes: z.string().optional(),
});

export const requestEquivalencyReview = protectedProcedure
  .input(requestEquivalencyReviewInput)
  .output(
    z.object({
      mappingId: z.string(),
      status: z.string(),
      message: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Requesting equivalency review", {
      sourceCourseCode: input.sourceCourseCode,
      user: ctx.user.id,
    });

    try {
      const transferEvaluation = await prisma.transferEvaluation.findUnique({
        where: { id: input.transferEvaluationId },
      });

      if (!transferEvaluation) {
        throw new Error("Transfer evaluation not found");
      }

      const sourceInstitution = await prisma.institution.findUnique({
        where: { id: input.sourceInstitutionId },
      });

      if (!sourceInstitution) {
        throw new Error("Source institution not found");
      }

      const subjectAreaValues = [
        "ENGLISH",
        "MATH",
        "NATURAL_SCIENCE",
        "SOCIAL_SCIENCE",
        "HUMANITIES",
        "FINE_ARTS",
        "PHYSICAL_EDUCATION",
        "FOREIGN_LANGUAGE",
        "COMPOSITION",
        "SPEECH",
        "PHILOSOPHY",
        "PSYCHOLOGY",
        "SOCIOLOGY",
        "POLITICAL_SCIENCE",
        "ECONOMICS",
        "HISTORY",
        "GEOGRAPHY",
        "COMPUTER_SCIENCE",
        "INFORMATION_TECHNOLOGY",
        "BUSINESS",
        "ACCOUNTING",
        "MARKETING",
        "MANAGEMENT",
        "FINANCE",
      ] as const;

      const validSourceSubjectArea = subjectAreaValues.includes(
        input.sourceSubjectArea as any,
      )
        ? input.sourceSubjectArea
        : "GENERAL";

      const mapping = await prisma.courseMapping.create({
        data: {
          transferEvaluationId: input.transferEvaluationId,
          sourceInstitutionId: input.sourceInstitutionId,
          targetInstitutionId: input.targetInstitutionId,
          sourceCourseCode: input.sourceCourseCode,
          sourceCourseTitle: input.sourceCourseTitle,
          sourceCredits: input.sourceCredits,
          sourceSubjectArea: validSourceSubjectArea as any,
          targetCourseCode: input.targetCourseCode,
          targetCourseTitle: input.targetCourseTitle,
          targetCredits: input.targetCredits,
          targetSubjectArea: input.targetSubjectArea as any,
          isEquivalent: false,
          confidenceScore: 0,
          verificationStatus: "MANUAL_REVIEW" as any,
          verificationNotes: input.notes,
        },
      });

      return {
        mappingId: mapping.id,
        status: "submitted",
        message: "Equivalency review requested successfully",
      };
    } catch (error) {
      logger.error("Failed to request equivalency review", error);
      throw error;
    }
  });

const bulkImportInput = z.object({
  mappings: z.array(
    z.object({
      transferEvaluationId: z.string().cuid(),
      sourceInstitutionId: z.string().cuid(),
      sourceCourseCode: z.string(),
      sourceCourseTitle: z.string(),
      sourceCredits: z.number().int().min(0),
      sourceSubjectArea: z.string(),
      targetInstitutionId: z.string().cuid().optional(),
      targetCourseCode: z.string().optional(),
      targetCourseTitle: z.string().optional(),
      targetCredits: z.number().int().min(0).optional(),
      targetSubjectArea: z.string().optional(),
      isEquivalent: z.boolean().optional(),
      confidenceScore: z.number().optional(),
    }),
  ),
});

export const bulkImportMappings = adminProcedure
  .input(bulkImportInput)
  .output(
    z.object({
      imported: z.number(),
      failed: z.number(),
      results: z.array(
        z.object({
          id: z.string(),
          sourceCourseCode: z.string(),
          status: z.string(),
        }),
      ),
      errors: z.array(
        z.object({
          index: z.number(),
          sourceCourseCode: z.string(),
          error: z.string(),
        }),
      ),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    logger.info("Bulk importing course mappings", {
      count: input.mappings.length,
      user: ctx.user.id,
    });

    try {
      const subjectAreaValues = [
        "ENGLISH",
        "MATH",
        "NATURAL_SCIENCE",
        "SOCIAL_SCIENCE",
        "HUMANITIES",
        "FINE_ARTS",
        "PHYSICAL_EDUCATION",
        "FOREIGN_LANGUAGE",
        "COMPOSITION",
        "SPEECH",
        "PHILOSOPHY",
        "PSYCHOLOGY",
        "SOCIOLOGY",
        "POLITICAL_SCIENCE",
        "ECONOMICS",
        "HISTORY",
        "GEOGRAPHY",
        "COMPUTER_SCIENCE",
        "INFORMATION_TECHNOLOGY",
        "BUSINESS",
        "ACCOUNTING",
        "MARKETING",
        "MANAGEMENT",
        "FINANCE",
      ] as const;

      const results = [];
      const errors = [];

      for (let i = 0; i < input.mappings.length; i++) {
        const mappingData = input.mappings[i];

        if (!mappingData) continue;

        try {
          const transferEvaluation = await prisma.transferEvaluation.findUnique(
            {
              where: { id: mappingData.transferEvaluationId },
            },
          );

          if (!transferEvaluation) {
            errors.push({
              index: i,
              sourceCourseCode: mappingData.sourceCourseCode,
              error: "Transfer evaluation not found",
            });
            continue;
          }

          const sourceInstitution = await prisma.institution.findUnique({
            where: { id: mappingData.sourceInstitutionId },
          });

          if (!sourceInstitution) {
            errors.push({
              index: i,
              sourceCourseCode: mappingData.sourceCourseCode,
              error: "Source institution not found",
            });
            continue;
          }

          const validSourceSubjectArea = subjectAreaValues.includes(
            mappingData.sourceSubjectArea as any,
          )
            ? mappingData.sourceSubjectArea
            : "GENERAL";

          const mapping = await prisma.courseMapping.create({
            data: {
              transferEvaluationId: mappingData.transferEvaluationId,
              sourceInstitutionId: mappingData.sourceInstitutionId,
              targetInstitutionId: mappingData.targetInstitutionId,
              sourceCourseCode: mappingData.sourceCourseCode,
              sourceCourseTitle: mappingData.sourceCourseTitle,
              sourceCredits: mappingData.sourceCredits,
              sourceSubjectArea: validSourceSubjectArea as any,
              targetCourseCode: mappingData.targetCourseCode,
              targetCourseTitle: mappingData.targetCourseTitle,
              targetCredits: mappingData.targetCredits,
              targetSubjectArea: mappingData.targetSubjectArea as any,
              isEquivalent: mappingData.isEquivalent ?? false,
              confidenceScore: mappingData.confidenceScore ?? 0,
              verificationStatus: "PENDING" as any,
            },
          });

          results.push({
            id: mapping.id,
            sourceCourseCode: mapping.sourceCourseCode,
            status: "imported",
          });
        } catch (error) {
          errors.push({
            index: i,
            sourceCourseCode: mappingData.sourceCourseCode,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return {
        imported: results.length,
        failed: errors.length,
        results,
        errors,
      };
    } catch (error) {
      logger.error("Failed to bulk import course mappings", error);
      throw error;
    }
  });

export const courseMappingRouter = router({
  getCourseEquivalency,
  searchCourses,
  requestEquivalencyReview,
  bulkImportMappings,
});
