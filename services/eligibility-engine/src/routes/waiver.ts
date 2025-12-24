import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { successResponse, errorResponse } from "@aah/api-utils";
import { WaiverService } from "../services";
import type { WaiverRequestInput, WaiverStatusUpdate } from "../types";

const app = new Hono();

const waiverRequestSchema = z.object({
  studentId: z.string(),
  waiverType: z.enum([
    "INITIAL_ELIGIBILITY",
    "PROGRESS_TOWARD_DEGREE",
    "CREDIT_HOUR_REQUIREMENTS",
    "GPA_REQUIREMENTS",
  ]),
  scenario: z.enum([
    "MEDICAL_HARDSHIP",
    "MILITARY_SERVICE",
    "RELIGIOUS_ACCOMMODATION",
    "LEARNING_DISABILITY",
    "NATURAL_DISASTER",
    "NCAA_EXTENUATING_CIRCUMSTANCES",
    "FAMILY_EMERGENCY",
    "FINANCIAL_HARDSHIP",
  ]),
  ruleId: z.string().optional(),
  violationId: z.string().optional(),
  justification: z.string().min(50),
  documents: z
    .array(
      z.object({
        documentType: z.string(),
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number(),
      }),
    )
    .optional(),
});

const waiverUpdateSchema = z.object({
  studentId: z.string(),
  waiverType: z.string(),
  scenario: z.string(),
  ruleId: z.string().optional(),
  violationId: z.string().optional(),
  justification: z.string().min(50),
  documents: z
    .array(
      z.object({
        documentType: z.string(),
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number(),
      }),
    )
    .optional(),
});

const waiverReviewSchema = z.object({
  status: z.enum(["APPROVED", "DENIED", "UNDER_REVIEW", "PENDING_SUBMISSION"]),
  reviewedBy: z.string(),
  reviewDecision: z.string().optional(),
  reviewJustification: z.string().optional(),
});

const documentUploadSchema = z.object({
  documentType: z.string(),
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileSize: z.number(),
  uploadedBy: z.string(),
});

const documentReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewedBy: z.string(),
  reviewNotes: z.string().optional(),
});

const ncaaResponseSchema = z.object({
  ncaaReferenceNumber: z.string().optional(),
  responseDate: z.string().optional(),
  response: z.string(),
  notes: z.string().optional(),
});

app.post(
  "/request-waiver",
  zValidator("json", waiverRequestSchema),
  async (c) => {
    const data = c.req.valid("json") as WaiverRequestInput;
    try {
      const result = await WaiverService.createWaiverRequest(data);
      return c.json(successResponse(result), 201);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Waiver request creation failed";
      return c.json(errorResponse("WAIVER_CREATION_FAILED", message), 500);
    }
  },
);

app.get("/waivers/:studentId", async (c) => {
  const studentId = c.req.param("studentId");
  try {
    const result = await WaiverService.getWaiverRequests(studentId);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get waiver requests";
    return c.json(errorResponse("WAIVERS_FETCH_FAILED", message), 500);
  }
});

app.get("/waivers/detail/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await WaiverService.getWaiverById(id);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get waiver request";
    return c.json(errorResponse("WAIVER_FETCH_FAILED", message), 500);
  }
});

app.put("/waivers/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const result = await WaiverService.updateWaiver(id, body);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Waiver update failed";
    return c.json(errorResponse("WAIVER_UPDATE_FAILED", message), 500);
  }
});

app.delete("/waivers/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await WaiverService.deleteWaiver(id);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Waiver deletion failed";
    return c.json(errorResponse("WAIVER_DELETION_FAILED", message), 500);
  }
});

app.post("/waivers/:id/submit", async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const submittedBy = body.submittedBy || "system";
    const result = await WaiverService.submitWaiver(id, submittedBy);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Waiver submission failed";
    return c.json(errorResponse("WAIVER_SUBMISSION_FAILED", message), 500);
  }
});

app.get("/waivers/:id/status", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await WaiverService.getWaiverStatus(id);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get waiver status";
    return c.json(errorResponse("WAIVER_STATUS_FETCH_FAILED", message), 500);
  }
});

app.post(
  "/waivers/:id/review",
  zValidator("json", waiverReviewSchema),
  async (c) => {
    const id = c.req.param("id");
    try {
      const data = c.req.valid("json") as WaiverStatusUpdate & {
        reviewedBy: string;
      };
      const result = await WaiverService.reviewWaiver(
        id,
        data,
        data.reviewedBy,
        "Compliance Officer",
      );
      return c.json(successResponse(result));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Waiver review failed";
      return c.json(errorResponse("WAIVER_REVIEW_FAILED", message), 500);
    }
  },
);

app.post(
  "/waivers/:id/ncaa-response",
  zValidator("json", ncaaResponseSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    try {
      const result = await WaiverService.recordNCAAResponse(id, {
        ncaaReferenceNumber: data.ncaaReferenceNumber,
        responseDate: data.responseDate
          ? new Date(data.responseDate)
          : undefined,
        response: data.response,
        notes: data.notes,
      });
      return c.json(successResponse(result));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "NCAA response recording failed";
      return c.json(errorResponse("NCAA_RESPONSE_FAILED", message), 500);
    }
  },
);

app.post(
  "/waivers/:id/documents",
  zValidator("json", documentUploadSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    try {
      const result = await WaiverService.uploadDocument(id, data);
      return c.json(successResponse(result), 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Document upload failed";
      return c.json(errorResponse("DOCUMENT_UPLOAD_FAILED", message), 500);
    }
  },
);

app.put(
  "/documents/:id/review",
  zValidator("json", documentReviewSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    try {
      const result = await WaiverService.reviewDocument(id, data);
      return c.json(successResponse(result));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Document review failed";
      return c.json(errorResponse("DOCUMENT_REVIEW_FAILED", message), 500);
    }
  },
);

app.get("/waivers/:id/audit-log", async (c) => {
  const id = c.req.param("id");
  try {
    const result = await WaiverService.getAuditLogs(id);
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get audit logs";
    return c.json(errorResponse("AUDIT_LOG_FETCH_FAILED", message), 500);
  }
});

app.get("/waivers/admin/pending", async (c) => {
  try {
    const result = await WaiverService.getPendingApprovals();
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get pending approvals";
    return c.json(
      errorResponse("PENDING_APPROVALS_FETCH_FAILED", message),
      500,
    );
  }
});

app.get("/waivers/admin/statistics", async (c) => {
  try {
    const result = await WaiverService.getWaiverStatistics();
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get statistics";
    return c.json(errorResponse("STATISTICS_FETCH_FAILED", message), 500);
  }
});

app.get("/waivers/admin/scenarios", async (c) => {
  try {
    const { WaiverDetectionEngine } =
      await import("../services/detection/index.js");
    const engine = new WaiverDetectionEngine();
    const result = engine.getAllScenarios();
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get scenarios";
    return c.json(errorResponse("SCENARIOS_FETCH_FAILED", message), 500);
  }
});

app.get("/waivers/documents/required/:waiverType/:scenario", async (c) => {
  const waiverType = c.req.param("waiverType");
  const scenario = c.req.param("scenario");
  try {
    const result = await WaiverService.getRequiredDocuments(
      waiverType,
      scenario,
    );
    return c.json(successResponse(result));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get required documents";
    return c.json(
      errorResponse("REQUIRED_DOCUMENTS_FETCH_FAILED", message),
      500,
    );
  }
});

export default app;
