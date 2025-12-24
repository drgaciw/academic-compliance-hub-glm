import { prisma } from "@aah/database";
import type { StudentRecord, EligibilityResult } from "../types/index.js";
import {
  WaiverDetectionEngine,
  WaiverDocumentationGenerator,
} from "./detection/index.js";

export interface WaiverDetectionResult {
  requiresWaiver: boolean;
  waiverType: string | null;
  scenario: string | null;
  violation: EligibilityResult | null;
  justification: string;
  suggestedWaiver: WaiverRecommendation | null;
}

export interface WaiverRecommendation {
  waiverType: string;
  scenario: string;
  ruleId: string;
  violationId: string;
  justification: string;
  requiredDocuments: string[];
  estimatedSuccessRate: number;
  recommendedApproach: string;
}

export interface WaiverRequestInput {
  studentId: string;
  waiverType: string;
  scenario: string;
  ruleId?: string;
  violationId?: string;
  justification: string;
  documents?: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
}

export interface WaiverStatusUpdate {
  status: string;
  reviewedBy?: string;
  reviewDecision?: string;
  reviewJustification?: string;
}

export class WaiverService {
  private detectionEngine: WaiverDetectionEngine;
  private documentationGenerator: WaiverDocumentationGenerator;

  constructor() {
    this.detectionEngine = new WaiverDetectionEngine();
    this.documentationGenerator = new WaiverDocumentationGenerator();
  }

  static async createWaiverRequest(input: WaiverRequestInput) {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId: input.studentId },
      include: { user: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const waiverRequest = await prisma.waiverRequest.create({
      data: {
        studentProfileId: student.id,
        waiverType: input.waiverType as any,
        scenario: input.scenario as any,
        status: "PENDING_DOCUMENTATION",
        ruleId: input.ruleId,
        violationId: input.violationId,
        justification: input.justification,
        createdBy: student.user.id,
        waiverDocuments: input.documents
          ? {
              create: input.documents.map((doc) => ({
                documentType: doc.documentType,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                fileSize: doc.fileSize,
                status: "UPLOADED",
                uploadedAt: new Date(),
                uploadedBy: student.user.id,
              })),
            }
          : undefined,
      },
      include: {
        waiverDocuments: true,
      },
    });

    await this.logWaiverAction(
      waiverRequest.id,
      "CREATE",
      student.user.id,
      student.user.email || student.user.firstName || "Unknown",
      {
        input,
      },
    );

    return waiverRequest;
  }

  static async getWaiverRequests(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const waivers = await prisma.waiverRequest.findMany({
      where: { studentProfileId: student.id },
      include: {
        waiverDocuments: true,
        auditLogs: {
          orderBy: { timestamp: "desc" },
          take: 5,
        },
      },
      orderBy: { createdDate: "desc" },
    });

    return waivers;
  }

  static async getWaiverById(waiverId: string) {
    const waiver = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
      include: {
        studentProfile: {
          include: { user: true },
        },
        waiverDocuments: true,
        auditLogs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!waiver) {
      throw new Error("Waiver request not found");
    }

    return waiver;
  }

  static async updateWaiver(
    waiverId: string,
    updates: Partial<WaiverRequestInput>,
  ) {
    const existing = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
      include: { studentProfile: { include: { user: true } } },
    });

    if (!existing) {
      throw new Error("Waiver request not found");
    }

    const updated = await prisma.waiverRequest.update({
      where: { id: waiverId },
      data: {
        justification: updates.justification,
        ruleId: updates.ruleId,
        violationId: updates.violationId,
      },
    });

    await this.logWaiverAction(
      waiverId,
      "UPDATE",
      existing.studentProfile.user.id,
      existing.studentProfile.user.email || "Unknown",
      {
        updates,
      },
    );

    return updated;
  }

  static async deleteWaiver(waiverId: string) {
    const existing = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
      include: { studentProfile: { include: { user: true } } },
    });

    if (!existing) {
      throw new Error("Waiver request not found");
    }

    await prisma.waiverRequest.delete({
      where: { id: waiverId },
    });

    await this.logWaiverAction(
      waiverId,
      "DELETE",
      existing.studentProfile.user.id,
      existing.studentProfile.user.email || "Unknown",
      {},
    );

    return { message: "Waiver request deleted successfully" };
  }

  static async submitWaiver(waiverId: string, submittedBy: string) {
    const existing = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
      include: {
        waiverDocuments: true,
        studentProfile: { include: { user: true } },
      },
    });

    if (!existing) {
      throw new Error("Waiver request not found");
    }

    const requiredDocs =
      new WaiverDocumentationGenerator().getRequiredDocuments(
        existing.waiverType,
        existing.scenario,
      );

    const pendingDocs = existing.waiverDocuments.filter(
      (doc: any) =>
        doc.status !== "APPROVED" && requiredDocs.includes(doc.documentType),
    );

    if (pendingDocs.length > 0) {
      throw new Error(
        `Cannot submit waiver. ${pendingDocs.length} required documents are pending approval.`,
      );
    }

    const updated = await prisma.waiverRequest.update({
      where: { id: waiverId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        submittedBy,
      },
    });

    await this.logWaiverAction(waiverId, "SUBMIT", submittedBy, "System", {
      previousStatus: existing.status,
      newStatus: "SUBMITTED",
    });

    return updated;
  }

  static async getWaiverStatus(waiverId: string) {
    const waiver = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
      include: {
        waiverDocuments: true,
        auditLogs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
    });

    if (!waiver) {
      throw new Error("Waiver request not found");
    }

    const requiredDocs =
      new WaiverDocumentationGenerator().getRequiredDocuments(
        waiver.waiverType,
        waiver.scenario,
      );

    const documentStatus = requiredDocs.map((docType: string) => {
      const doc = waiver.waiverDocuments.find(
        (d: any) => d.documentType === docType,
      );
      return {
        documentType: docType,
        status: doc?.status || "REQUIRED",
        fileName: doc?.fileName,
        uploadedAt: doc?.uploadedAt,
        expirationDate: doc?.expirationDate,
      };
    });

    return {
      ...waiver,
      documentStatus,
      isComplete: documentStatus.every((d) => d.status === "APPROVED"),
    };
  }

  static async reviewWaiver(
    waiverId: string,
    review: WaiverStatusUpdate,
    reviewerId: string,
    reviewerName: string,
  ) {
    const existing = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
    });

    if (!existing) {
      throw new Error("Waiver request not found");
    }

    const updated = await prisma.waiverRequest.update({
      where: { id: waiverId },
      data: {
        status: review.status as any,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        reviewDecision: review.reviewDecision,
        reviewJustification: review.reviewJustification,
      },
    });

    await this.logWaiverAction(waiverId, "REVIEW", reviewerId, reviewerName, {
      previousStatus: existing.status,
      newStatus: review.status,
      reviewDecision: review.reviewDecision,
    });

    return updated;
  }

  static async recordNCAAResponse(
    waiverId: string,
    ncaaResponse: {
      ncaaReferenceNumber?: string;
      responseDate?: Date;
      response: string;
      notes?: string;
    },
  ) {
    const updated = await prisma.waiverRequest.update({
      where: { id: waiverId },
      data: {
        ncaaReferenceNumber: ncaaResponse.ncaaReferenceNumber,
        ncaaResponseDate: ncaaResponse.responseDate || new Date(),
        ncaaResponse: ncaaResponse.response,
        ncaaResponseNotes: ncaaResponse.notes,
        status: ncaaResponse.response.toLowerCase().includes("approved")
          ? "APPROVED"
          : "DENIED",
      },
    });

    await this.logWaiverAction(
      waiverId,
      "NCAA_RESPONSE",
      "SYSTEM",
      "NCAA",
      ncaaResponse,
    );

    return updated;
  }

  static async detectWaiverNeeds(
    studentRecord: StudentRecord,
    violations: EligibilityResult[],
  ): Promise<WaiverDetectionResult[]> {
    const engine = new WaiverDetectionEngine();
    return engine.detectWaivers(studentRecord, violations);
  }

  static async getRequiredDocuments(
    waiverType: string,
    scenario: string,
  ): Promise<
    Array<{
      documentType: string;
      description: string;
      required: boolean;
      expirationPolicy?: string;
    }>
  > {
    const generator = new WaiverDocumentationGenerator();
    const docs = generator.getRequiredDocuments(waiverType, scenario);

    return docs.map((docType) => ({
      documentType: docType,
      description: generator.getDocumentDescription(docType),
      required: true,
      expirationPolicy: generator.getExpirationPolicy(docType, scenario),
    }));
  }

  static async uploadDocument(
    waiverId: string,
    document: {
      documentType: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      uploadedBy: string;
    },
  ) {
    const waiver = await prisma.waiverRequest.findUnique({
      where: { id: waiverId },
    });

    if (!waiver) {
      throw new Error("Waiver request not found");
    }

    const uploadedDoc = await prisma.waiverDocument.create({
      data: {
        waiverRequestId: waiverId,
        documentType: document.documentType,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize,
        status: "UPLOADED",
        uploadedAt: new Date(),
        uploadedBy: document.uploadedBy,
      },
    });

    await this.logWaiverAction(
      waiverId,
      "DOCUMENT_UPLOAD",
      document.uploadedBy,
      "User",
      {
        documentId: uploadedDoc.id,
        documentType: document.documentType,
      },
    );

    return uploadedDoc;
  }

  static async reviewDocument(
    documentId: string,
    review: {
      status: "APPROVED" | "REJECTED";
      reviewedBy: string;
      reviewNotes?: string;
    },
  ) {
    const doc = await prisma.waiverDocument.findUnique({
      where: { id: documentId },
      include: { waiverRequest: true },
    });

    if (!doc) {
      throw new Error("Document not found");
    }

    const updated = await prisma.waiverDocument.update({
      where: { id: documentId },
      data: {
        status: review.status,
        reviewedAt: new Date(),
        reviewedBy: review.reviewedBy,
        reviewNotes: review.reviewNotes,
      },
    });

    await this.logWaiverAction(
      doc.waiverRequestId,
      "DOCUMENT_REVIEW",
      review.reviewedBy,
      "Compliance Officer",
      {
        documentId,
        previousStatus: doc.status,
        newStatus: review.status,
        reviewNotes: review.reviewNotes,
      },
    );

    return updated;
  }

  static async getPendingApprovals() {
    const pending = await prisma.waiverRequest.findMany({
      where: {
        status: {
          in: ["PENDING_SUBMISSION", "UNDER_REVIEW"],
        },
      },
      include: {
        studentProfile: {
          include: { user: true },
        },
        waiverDocuments: true,
      },
      orderBy: { createdDate: "asc" },
    });

    return pending.filter((w: any) =>
      w.waiverDocuments.every((d: any) => d.status === "APPROVED"),
    );
  }

  static async getWaiverStatistics() {
    const [total, byStatus, byType, byScenario] = await Promise.all([
      prisma.waiverRequest.count(),
      prisma.waiverRequest.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.waiverRequest.groupBy({
        by: ["waiverType"],
        _count: true,
      }),
      prisma.waiverRequest.groupBy({
        by: ["scenario"],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc: any, item: any) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byType: byType.reduce(
        (acc: any, item: any) => {
          acc[item.waiverType] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byScenario: byScenario.reduce(
        (acc: any, item: any) => {
          acc[item.scenario] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  private static async logWaiverAction(
    waiverRequestId: string,
    action: string,
    actorId: string,
    actorName: string,
    data: Record<string, unknown>,
  ) {
    await prisma.waiverAuditLog.create({
      data: {
        waiverRequestId,
        action,
        actorId,
        actorName,
        inputData: data as any,
        timestamp: new Date(),
      },
    });
  }

  static async getAuditLogs(waiverId: string) {
    return prisma.waiverAuditLog.findMany({
      where: { waiverRequestId: waiverId },
      orderBy: { timestamp: "desc" },
    });
  }
}
