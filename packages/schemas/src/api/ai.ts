import { z } from "zod";
import { ResponseSchema } from "../base";

export const CourseRecommendationInputSchema = z.object({
  completedCourses: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      credits: z.number(),
      grade: z.string(),
    }),
  ),
  currentGPA: z.number().min(0).max(4),
  totalCredits: z.number().min(0),
  targetGPA: z.number().min(0).max(4).optional(),
  requiredCredits: z.number().min(0),
  concentration: z.string().optional(),
  electivePreferences: z.array(z.string()).optional(),
});

export type CourseRecommendationInput = z.infer<
  typeof CourseRecommendationInputSchema
>;

export const CourseRecommendationSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  credits: z.number(),
  reason: z.string(),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  fulfillsRequirement: z.boolean(),
});

export type CourseRecommendation = z.infer<typeof CourseRecommendationSchema>;

export const AcademicPlanSchema = z.object({
  priorityCourses: z.array(z.string()),
  supportNeeded: z.array(z.string()),
  schedulingNotes: z.array(z.string()),
});

export type AcademicPlan = z.infer<typeof AcademicPlanSchema>;

export const CourseRecommendationResponseSchema = ResponseSchema(
  z.object({
    insights: z.array(z.string()),
    recommendations: z.array(CourseRecommendationSchema),
    academicPlan: AcademicPlanSchema,
  }),
);

export type CourseRecommendationResponse = z.infer<
  typeof CourseRecommendationResponseSchema
>;

export const ComplianceAnalysisInputSchema = z.object({
  studentId: z.string(),
  sport: z.string(),
  division: z.enum(["I", "II", "III"]),
  enrollmentData: z.object({
    creditsEnrolled: z.number(),
    creditsCompleted: z.number(),
    term: z.string(),
  }),
  courseHistory: z.array(
    z.object({
      code: z.string(),
      credits: z.number(),
      grade: z.string(),
      term: z.string(),
    }),
  ),
});

export type ComplianceAnalysisInput = z.infer<
  typeof ComplianceAnalysisInputSchema
>;

export const ComplianceConcernSchema = z.object({
  category: z.enum(["credits", "gpa", "progress", "documentation"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
  recommendation: z.string(),
});

export type ComplianceConcern = z.infer<typeof ComplianceConcernSchema>;

export const ComplianceRecommendationSchema = z.object({
  action: z.string(),
  priority: z.enum(["immediate", "high", "medium", "low"]),
  deadline: z.string().optional(),
});

export type ComplianceRecommendation = z.infer<
  typeof ComplianceRecommendationSchema
>;

export const ComplianceAnalysisResponseSchema = ResponseSchema(
  z.object({
    status: z.enum(["COMPLIANT", "AT_RISK", "NON_COMPLIANT"]),
    concerns: z.array(ComplianceConcernSchema),
    recommendations: z.array(ComplianceRecommendationSchema),
    eligibilityDetails: z.object({
      creditHourProgress: z.string(),
      gpaRequirement: z.string(),
      satisfactoryProgress: z.string(),
    }),
  }),
);

export type ComplianceAnalysisResponse = z.infer<
  typeof ComplianceAnalysisResponseSchema
>;

export const TransferCreditInputSchema = z.object({
  sourceInstitution: z.string(),
  sourceCourses: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      credits: z.number(),
      description: z.string(),
    }),
  ),
  destinationInstitution: z.string(),
  targetProgram: z.string(),
});

export type TransferCreditInput = z.infer<typeof TransferCreditInputSchema>;

export const TransferCreditEvaluationSchema = z.object({
  sourceCourse: z.object({
    code: z.string(),
    name: z.string(),
    credits: z.number(),
  }),
  transferCredits: z.enum(["full", "partial", "none"]),
  equivalency: z.string().optional(),
  generalEducation: z.boolean(),
  majorRequirement: z.boolean(),
  notes: z.string().optional(),
});

export type TransferCreditEvaluation = z.infer<
  typeof TransferCreditEvaluationSchema
>;

export const TransferCreditResponseSchema = ResponseSchema(
  z.object({
    evaluations: z.array(TransferCreditEvaluationSchema),
    summary: z.object({
      totalTransferableCredits: z.number(),
      remainingCredits: z.number(),
      estimatedGraduationImpact: z.string(),
    }),
    needsReview: z.array(z.string()),
  }),
);

export type TransferCreditResponse = z.infer<
  typeof TransferCreditResponseSchema
>;

export const AcademicPerformanceInputSchema = z.object({
  gpa: z.number().min(0).max(4),
  credits: z.number().min(0),
  semester: z.string(),
  courses: z.array(
    z.object({
      grade: z.string(),
      credits: z.number(),
      name: z.string(),
    }),
  ),
});

export type AcademicPerformanceInput = z.infer<
  typeof AcademicPerformanceInputSchema
>;

export const AcademicInsightSchema = z.object({
  category: z.enum(["strength", "concern", "trend"]),
  description: z.string(),
  recommendation: z.string().optional(),
});

export type AcademicInsight = z.infer<typeof AcademicInsightSchema>;

export const AcademicPerformanceResponseSchema = ResponseSchema(
  z.object({
    insights: z.array(AcademicInsightSchema),
    recommendations: z.array(z.string()),
    strategies: z.array(z.string()),
  }),
);

export type AcademicPerformanceResponse = z.infer<
  typeof AcademicPerformanceResponseSchema
>;

export const AIEndpointErrorSchema = z.object({
  code: z.enum([
    "RATE_LIMIT_EXCEEDED",
    "INVALID_INPUT",
    "AI_MODEL_ERROR",
    "PROCESSING_ERROR",
    "TIMEOUT",
  ]),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export type AIEndpointError = z.infer<typeof AIEndpointErrorSchema>;

export const AIErrorResponseSchema = z.object({
  success: z.literal(false),
  error: AIEndpointErrorSchema,
});

export type AIErrorResponse = z.infer<typeof AIErrorResponseSchema>;
