import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { successResponse, errorResponse } from "@aah/api-utils";
import {
  EvaluationService,
  GPAService,
  PTDService,
  WhatIfService,
  TransferService,
  OverrideService,
  WaiverService,
} from "../services";
import type {
  EvaluationRequest,
  GPACalculationRequest,
  PTDCalculationRequest,
  WhatIfScenarioRequest,
  OverrideRequest,
} from "../types";
import waiverRoutes from "./waiver.js";

const app = new Hono();

const evaluationSchema = z.object({
  studentId: z.string(),
  season: z.string().optional(),
  sport: z.string().optional(),
  term: z.string().optional(),
});

const gpaSchema = z.object({
  studentId: z.string(),
  courses: z
    .array(
      z.object({
        courseId: z.string(),
        credits: z.number(),
        grade: z.union([z.string(), z.number()]),
        isPassFail: z.boolean().optional(),
      }),
    )
    .optional(),
  includeTransfer: z.boolean().optional(),
  includePassFail: z.boolean().optional(),
});

const ptdSchema = z.object({
  studentId: z.string(),
  degreeProgram: z.string().optional(),
  includeTransferCredits: z.boolean().optional(),
});

const whatIfSchema = z.object({
  studentId: z.string(),
  scenarioName: z.string(),
  assumptions: z.object({
    projectedGrades: z
      .array(
        z.object({
          courseId: z.string(),
          credits: z.number(),
          grade: z.union([z.string(), z.number()]),
          isPassFail: z.boolean().optional(),
        }),
      )
      .optional(),
    additionalCourses: z
      .array(
        z.object({
          courseId: z.string(),
          credits: z.number(),
          grade: z.union([z.string(), z.number()]),
          isPassFail: z.boolean().optional(),
        }),
      )
      .optional(),
    repeatCourses: z.array(z.string()).optional(),
    creditsToComplete: z.number().optional(),
    targetGPA: z.number().optional(),
  }),
});

const overrideSchema = z.object({
  studentId: z.string(),
  ruleId: z.string(),
  override: z.boolean(),
  justification: z.string(),
  approvedBy: z.string().optional(),
  effectiveUntil: z.string().optional(),
});

app.post("/evaluate", zValidator("json", evaluationSchema), async (c) => {
  const data = c.req.valid("json") as EvaluationRequest;
  try {
    const result = await EvaluationService.evaluateStudent(data);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Evaluation failed";
    return c.json(errorResponse("EVALUATION_FAILED", message), 500);
  }
});

app.get("/:studentId", async (c) => {
  const studentId = c.req.param("studentId");
  try {
    const result = await EvaluationService.getCurrentEligibility(studentId);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get eligibility";
    return c.json(errorResponse("ELIGIBILITY_FETCH_FAILED", message), 500);
  }
});

app.post("/gpa", zValidator("json", gpaSchema), async (c) => {
  const data = c.req.valid("json") as GPACalculationRequest;
  try {
    const result = await GPAService.calculateGPA(data);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "GPA calculation failed";
    return c.json(errorResponse("GPA_CALCULATION_FAILED", message), 500);
  }
});

app.post(
  "/progress-toward-degree",
  zValidator("json", ptdSchema),
  async (c) => {
    const data = c.req.valid("json") as PTDCalculationRequest;
    try {
      const result = await PTDService.calculateProgressTowardDegree(data);
      return c.json(successResponse(result));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PTD calculation failed";
      return c.json(errorResponse("PTD_CALCULATION_FAILED", message), 500);
    }
  },
);

app.route("/api/eligibility", waiverRoutes);

export default app;
