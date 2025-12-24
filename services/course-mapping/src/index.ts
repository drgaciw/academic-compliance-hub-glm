/**
 * @aah/service-course-mapping
 * Course mapping microservice for transfer credit evaluation
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "@aah/api-utils";
import { prisma } from "@aah/database";
import {
  generateSingleEmbedding,
  generateEmbeddings,
  vectorSearch,
  cosineSimilarity,
} from "@aah/course-mapping";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => {
  return c.json(successResponse({ status: "ok", service: "course-mapping" }));
});

const createMappingSchema = z.object({
  transferEvaluationId: z.string(),
  sourceInstitutionId: z.string(),
  targetInstitutionId: z.string().optional(),
  sourceCourseCode: z.string(),
  sourceCourseTitle: z.string(),
  sourceCredits: z.number().int().min(0),
  sourceSubjectArea: z.enum([
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
  ]),
  targetCourseCode: z.string().optional(),
  targetCourseTitle: z.string().optional(),
  targetCredits: z.number().int().min(0).optional(),
  targetSubjectArea: z
    .enum([
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
    ])
    .optional(),
  isEquivalent: z.boolean().optional().default(false),
  confidenceScore: z.number().min(0).max(1).optional().default(0.0),
  verificationStatus: z
    .enum([
      "PENDING",
      "APPROVED",
      "REJECTED",
      "MANUAL_REVIEW",
      "AUTO_APPROVED",
      "EXEMPTION_GRANTED",
    ])
    .optional()
    .default("PENDING"),
  verificationNotes: z.string().optional(),
  ruleApplied: z.string().optional(),
  exceptionReason: z.string().optional(),
});

const updateMappingSchema = createMappingSchema.partial();

const batchImportSchema = z.object({
  mappings: z.array(
    z.object({
      transferEvaluationId: z.string(),
      sourceInstitutionId: z.string(),
      sourceCourseCode: z.string(),
      sourceCourseTitle: z.string(),
      sourceCredits: z.number().int().min(0),
      sourceSubjectArea: z.string(),
      targetCourseCode: z.string().optional(),
      targetCourseTitle: z.string().optional(),
      targetCredits: z.number().int().min(0).optional(),
      targetSubjectArea: z.string().optional(),
      isEquivalent: z.boolean().optional().default(false),
    }),
  ),
});

const verifyMappingSchema = z.object({
  verificationStatus: z.enum([
    "APPROVED",
    "REJECTED",
    "MANUAL_REVIEW",
    "AUTO_APPROVED",
    "EXEMPTION_GRANTED",
  ]),
  verificationNotes: z.string().optional(),
});

const approveBatchSchema = z.object({
  mappingIds: z.array(z.string()),
  verificationNotes: z.string().optional(),
});

app.post(
  "/api/course-mappings",
  zValidator("json", createMappingSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");

      const transferEvaluation = await prisma.transferEvaluation.findUnique({
        where: { id: data.transferEvaluationId },
      });

      if (!transferEvaluation) {
        return c.json(
          errorResponse("NOT_FOUND", "Transfer evaluation not found", {
            transferEvaluationId: data.transferEvaluationId,
          }),
          404,
        );
      }

      const sourceInstitution = await prisma.institution.findUnique({
        where: { id: data.sourceInstitutionId },
      });

      if (!sourceInstitution) {
        return c.json(
          errorResponse("NOT_FOUND", "Source institution not found", {
            sourceInstitutionId: data.sourceInstitutionId,
          }),
          404,
        );
      }

      if (data.targetInstitutionId) {
        const targetInstitution = await prisma.institution.findUnique({
          where: { id: data.targetInstitutionId },
        });

        if (!targetInstitution) {
          return c.json(
            errorResponse("NOT_FOUND", "Target institution not found", {
              targetInstitutionId: data.targetInstitutionId,
            }),
            404,
          );
        }
      }

      const mapping = await prisma.courseMapping.create({
        data,
      });

      return c.json(successResponse(mapping), 201);
    } catch (error) {
      console.error("Error creating mapping:", error);
      return c.json(
        errorResponse(
          "INTERNAL_ERROR",
          "Failed to create course mapping",
          error instanceof Error ? error.message : String(error),
        ),
        500,
      );
    }
  },
);

app.get("/api/course-mappings/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const mapping = await prisma.courseMapping.findUnique({
      where: { id },
      include: {
        transferEvaluation: true,
        sourceInstitution: true,
        targetInstitution: true,
      },
    });

    if (!mapping) {
      return c.json(
        errorResponse("NOT_FOUND", "Course mapping not found", { id }),
        404,
      );
    }

    return c.json(successResponse(mapping));
  } catch (error) {
    console.error("Error fetching mapping:", error);
    return c.json(
      errorResponse(
        "INTERNAL_ERROR",
        "Failed to fetch course mapping",
        error instanceof Error ? error.message : String(error),
      ),
      500,
    );
  }
});

app.put(
  "/api/course-mappings/:id",
  zValidator("json", updateMappingSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const existingMapping = await prisma.courseMapping.findUnique({
        where: { id },
      });

      if (!existingMapping) {
        return c.json(
          errorResponse("NOT_FOUND", "Course mapping not found", { id }),
          404,
        );
      }

      const mapping = await prisma.courseMapping.update({
        where: { id },
        data,
      });

      return c.json(successResponse(mapping));
    } catch (error) {
      console.error("Error updating mapping:", error);
      return c.json(
        errorResponse(
          "INTERNAL_ERROR",
          "Failed to update course mapping",
          error instanceof Error ? error.message : String(error),
        ),
        500,
      );
    }
  },
);

app.delete("/api/course-mappings/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const existingMapping = await prisma.courseMapping.findUnique({
      where: { id },
    });

    if (!existingMapping) {
      return c.json(
        errorResponse("NOT_FOUND", "Course mapping not found", { id }),
        404,
      );
    }

    await prisma.courseMapping.delete({
      where: { id },
    });

    return c.json(successResponse({ id, deleted: true }));
  } catch (error) {
    console.error("Error deleting mapping:", error);
    return c.json(
      errorResponse(
        "INTERNAL_ERROR",
        "Failed to delete course mapping",
        error instanceof Error ? error.message : String(error),
      ),
      500,
    );
  }
});

app.post(
  "/api/course-mappings/batch-import",
  zValidator("json", batchImportSchema),
  async (c) => {
    try {
      const { mappings } = c.req.valid("json");

      const results = [];
      const errors = [];

      for (const mappingData of mappings) {
        try {
          const transferEvaluation = await prisma.transferEvaluation.findUnique(
            {
              where: { id: mappingData.transferEvaluationId },
            },
          );

          if (!transferEvaluation) {
            errors.push({
              mapping: mappingData,
              error: "Transfer evaluation not found",
            });
            continue;
          }

          const sourceInstitution = await prisma.institution.findUnique({
            where: { id: mappingData.sourceInstitutionId },
          });

          if (!sourceInstitution) {
            errors.push({
              mapping: mappingData,
              error: "Source institution not found",
            });
            continue;
          }

          const mapping = await prisma.courseMapping.create({
            data: {
              ...mappingData,
              sourceSubjectArea: mappingData.sourceSubjectArea as any,
              targetSubjectArea: mappingData.targetSubjectArea as any,
            },
          });

          results.push(mapping);
        } catch (error) {
          errors.push({
            mapping: mappingData,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return c.json(
        successResponse({
          imported: results.length,
          failed: errors.length,
          results,
          errors,
        }),
        201,
      );
    } catch (error) {
      console.error("Error in batch import:", error);
      return c.json(
        errorResponse(
          "INTERNAL_ERROR",
          "Failed to import course mappings",
          error instanceof Error ? error.message : String(error),
        ),
        500,
      );
    }
  },
);

app.get("/api/course-mappings/search", async (c) => {
  try {
    const sourceCode = c.req.query("sourceCode");
    const sourceTitle = c.req.query("sourceTitle");
    const sourceInstitutionId = c.req.query("sourceInstitutionId");
    const targetInstitutionId = c.req.query("targetInstitutionId");
    const verificationStatus = c.req.query("verificationStatus");
    const page = parseInt(c.req.query("page") || "1");
    const pageSize = parseInt(c.req.query("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (sourceCode) {
      where.sourceCourseCode = {
        contains: sourceCode,
        mode: "insensitive",
      };
    }

    if (sourceTitle) {
      where.sourceCourseTitle = {
        contains: sourceTitle,
        mode: "insensitive",
      };
    }

    if (sourceInstitutionId) {
      where.sourceInstitutionId = sourceInstitutionId;
    }

    if (targetInstitutionId) {
      where.targetInstitutionId = targetInstitutionId;
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    const [mappings, total] = await Promise.all([
      prisma.courseMapping.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          sourceInstitution: true,
          targetInstitution: true,
        },
      }),
      prisma.courseMapping.count({ where }),
    ]);

    return c.json(paginatedResponse(mappings, page, pageSize, total));
  } catch (error) {
    console.error("Error searching mappings:", error);
    return c.json(
      errorResponse(
        "INTERNAL_ERROR",
        "Failed to search course mappings",
        error instanceof Error ? error.message : String(error),
      ),
      500,
    );
  }
});

app.get("/api/course-mappings/similar/:text", async (c) => {
  try {
    const text = c.req.param("text");
    const limit = parseInt(c.req.query("limit") || "10");
    const threshold = parseFloat(c.req.query("threshold") || "0.7");
    const sourceInstitutionId = c.req.query("sourceInstitutionId");

    if (!text || text.trim().length === 0) {
      return c.json(
        errorResponse("BAD_REQUEST", "Search text is required"),
        400,
      );
    }

    const queryEmbedding = await generateSingleEmbedding(text);

    const allMappings = await prisma.courseMapping.findMany({
      where: sourceInstitutionId ? { sourceInstitutionId } : undefined,
      include: {
        sourceInstitution: true,
        targetInstitution: true,
      },
    });

    const results = allMappings
      .map((mapping) => {
        const searchText =
          `${mapping.sourceCourseCode} ${mapping.sourceCourseTitle} ${mapping.targetCourseCode || ""} ${mapping.targetCourseTitle || ""}`.trim();

        return {
          mapping,
          searchText,
        };
      })
      .filter(({ searchText }) => searchText.length > 0);

    const similarities = await Promise.all(
      results.map(async ({ mapping, searchText }) => {
        try {
          const docEmbedding = await generateSingleEmbedding(searchText);
          const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
          return { mapping, similarity };
        } catch {
          return { mapping, similarity: 0 };
        }
      }),
    );

    const filtered = similarities
      .filter((item) => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return c.json(
      successResponse({
        results: filtered.map((item) => ({
          ...item.mapping,
          similarity: item.similarity,
        })),
        query: text,
        count: filtered.length,
      }),
    );
  } catch (error) {
    console.error("Error in similarity search:", error);
    return c.json(
      errorResponse(
        "INTERNAL_ERROR",
        "Failed to perform similarity search",
        error instanceof Error ? error.message : String(error),
      ),
      500,
    );
  }
});

app.post(
  "/api/course-mappings/verify/:id",
  zValidator("json", verifyMappingSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const { verificationStatus, verificationNotes } = c.req.valid("json");

      const existingMapping = await prisma.courseMapping.findUnique({
        where: { id },
      });

      if (!existingMapping) {
        return c.json(
          errorResponse("NOT_FOUND", "Course mapping not found", { id }),
          404,
        );
      }

      const mapping = await prisma.courseMapping.update({
        where: { id },
        data: {
          verificationStatus: verificationStatus as any,
          verificationNotes,
        },
      });

      return c.json(successResponse(mapping));
    } catch (error) {
      console.error("Error verifying mapping:", error);
      return c.json(
        errorResponse(
          "INTERNAL_ERROR",
          "Failed to verify course mapping",
          error instanceof Error ? error.message : String(error),
        ),
        500,
      );
    }
  },
);

app.get("/api/course-mappings/institutions/:id", async (c) => {
  try {
    const institutionId = c.req.param("id");
    const role = c.req.query("role") || "source";

    const where: any = {};
    if (role === "source") {
      where.sourceInstitutionId = institutionId;
    } else if (role === "target") {
      where.targetInstitutionId = institutionId;
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return c.json(
        errorResponse("NOT_FOUND", "Institution not found", {
          id: institutionId,
        }),
        404,
      );
    }

    const mappings = await prisma.courseMapping.findMany({
      where,
      include: {
        transferEvaluation: true,
        sourceInstitution: true,
        targetInstitution: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      total: mappings.length,
      byStatus: {
        PENDING: mappings.filter((m) => m.verificationStatus === "PENDING")
          .length,
        APPROVED: mappings.filter((m) => m.verificationStatus === "APPROVED")
          .length,
        REJECTED: mappings.filter((m) => m.verificationStatus === "REJECTED")
          .length,
        MANUAL_REVIEW: mappings.filter(
          (m) => m.verificationStatus === "MANUAL_REVIEW",
        ).length,
        AUTO_APPROVED: mappings.filter(
          (m) => m.verificationStatus === "AUTO_APPROVED",
        ).length,
        EXEMPTION_GRANTED: mappings.filter(
          (m) => m.verificationStatus === "EXEMPTION_GRANTED",
        ).length,
      },
      byEquivalence: {
        equivalent: mappings.filter((m) => m.isEquivalent).length,
        notEquivalent: mappings.filter((m) => !m.isEquivalent).length,
      },
      avgConfidence:
        mappings.length > 0
          ? mappings.reduce((sum, m) => sum + m.confidenceScore, 0) /
            mappings.length
          : 0,
    };

    return c.json(
      successResponse({
        institution,
        role,
        summary,
        mappings,
      }),
    );
  } catch (error) {
    console.error("Error fetching institution mappings:", error);
    return c.json(
      errorResponse(
        "INTERNAL_ERROR",
        "Failed to fetch institution mappings",
        error instanceof Error ? error.message : String(error),
      ),
      500,
    );
  }
});

app.post(
  "/api/course-mappings/approve-batch",
  zValidator("json", approveBatchSchema),
  async (c) => {
    try {
      const { mappingIds, verificationNotes } = c.req.valid("json");

      const mappings = await prisma.courseMapping.findMany({
        where: { id: { in: mappingIds } },
      });

      if (mappings.length !== mappingIds.length) {
        return c.json(
          errorResponse("NOT_FOUND", "Some mappings were not found", {
            requested: mappingIds.length,
            found: mappings.length,
            missing: mappingIds.filter(
              (id) => !mappings.find((m) => m.id === id),
            ),
          }),
          404,
        );
      }

      const results = await prisma.courseMapping.updateMany({
        where: { id: { in: mappingIds } },
        data: {
          verificationStatus: "APPROVED",
          verificationNotes,
        },
      });

      const updatedMappings = await prisma.courseMapping.findMany({
        where: { id: { in: mappingIds } },
      });

      return c.json(
        successResponse({
          approved: results.count,
          mappings: updatedMappings,
        }),
      );
    } catch (error) {
      console.error("Error batch approving mappings:", error);
      return c.json(
        errorResponse(
          "INTERNAL_ERROR",
          "Failed to batch approve mappings",
          error instanceof Error ? error.message : String(error),
        ),
        500,
      );
    }
  },
);

app.get("/api/course-mappings/:id/confidence", async (c) => {
  try {
    const id = c.req.param("id");

    const mapping = await prisma.courseMapping.findUnique({
      where: { id },
      include: {
        sourceInstitution: true,
        targetInstitution: true,
      },
    });

    if (!mapping) {
      return c.json(
        errorResponse("NOT_FOUND", "Course mapping not found", { id }),
        404,
      );
    }

    const sourceText = `${mapping.sourceCourseCode} ${mapping.sourceCourseTitle} ${mapping.sourceCredits} credits ${mapping.sourceSubjectArea}`;
    const targetText = mapping.targetCourseCode
      ? `${mapping.targetCourseCode} ${mapping.targetCourseTitle} ${mapping.targetCredits} credits ${mapping.targetSubjectArea}`
      : "";

    let semanticSimilarity = 0;
    let subjectAreaMatch =
      mapping.sourceSubjectArea === mapping.targetSubjectArea ? 1 : 0;
    let creditsMatch = mapping.sourceCredits === mapping.targetCredits ? 1 : 0;

    try {
      if (targetText) {
        const sourceEmbedding = await generateSingleEmbedding(sourceText);
        const targetEmbedding = await generateSingleEmbedding(targetText);
        semanticSimilarity = cosineSimilarity(sourceEmbedding, targetEmbedding);
      }
    } catch (error) {
      console.error("Error calculating semantic similarity:", error);
    }

    const confidenceScores = {
      semanticSimilarity,
      subjectAreaMatch,
      creditsMatch,
      overall: mapping.confidenceScore,
    };

    const calculatedScore =
      semanticSimilarity * 0.5 + subjectAreaMatch * 0.3 + creditsMatch * 0.2;

    return c.json(
      successResponse({
        mapping,
        confidenceScores,
        calculatedScore,
      }),
    );
  } catch (error) {
    console.error("Error calculating confidence:", error);
    return c.json(
      errorResponse(
        "INTERNAL_ERROR",
        "Failed to calculate confidence score",
        error instanceof Error ? error.message : String(error),
      ),
      500,
    );
  }
});

export default app;
