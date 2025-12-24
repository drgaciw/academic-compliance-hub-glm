import { prisma } from "@aah/database";
import type { OverrideRequest } from "../types/index.js";

export interface OverrideRecord {
  id: string;
  studentId: string;
  ruleId: string;
  override: boolean;
  justification: string;
  approvedBy: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
}

export class OverrideService {
  static async createOverride(
    request: OverrideRequest,
  ): Promise<OverrideRecord> {
    const {
      studentId,
      ruleId,
      override,
      justification,
      approvedBy,
      effectiveUntil,
    } = request;

    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const complianceRecord = await prisma.complianceRecord.create({
      data: {
        studentId: student.id,
        category: "OVERRIDE",
        requirement: ruleId,
        status: override ? "EXEMPTED" : "PENDING",
        notes: justification,
        completedAt: new Date(),
      },
    });

    const overrideRecord: OverrideRecord = {
      id: complianceRecord.id,
      studentId,
      ruleId,
      override,
      justification,
      approvedBy: approvedBy || "system",
      effectiveFrom: new Date().toISOString(),
      effectiveUntil,
      status: "active",
      createdAt: complianceRecord.createdAt.toISOString(),
    };

    if (override) {
      await prisma.studentProfile.update({
        where: { studentId },
        data: {
          eligibility: true,
        },
      });
    }

    return overrideRecord;
  }

  static async getActiveOverrides(
    studentId: string,
  ): Promise<OverrideRecord[]> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        complianceRecords: {
          where: {
            category: "OVERRIDE",
            status: "EXEMPTED",
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return student.complianceRecords.map((record) => ({
      id: record.id,
      studentId,
      ruleId: record.requirement,
      override: true,
      justification: record.notes || "",
      approvedBy: "system",
      effectiveFrom: record.createdAt.toISOString(),
      status: "active",
      createdAt: record.createdAt.toISOString(),
    }));
  }

  static async revokeOverride(
    studentId: string,
    ruleId: string,
  ): Promise<OverrideRecord> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const complianceRecord = await prisma.complianceRecord.findFirst({
      where: {
        studentId: student.id,
        category: "OVERRIDE",
        requirement: ruleId,
        status: "EXEMPTED",
      },
    });

    if (!complianceRecord) {
      throw new Error("Override not found");
    }

    const updatedRecord = await prisma.complianceRecord.update({
      where: { id: complianceRecord.id },
      data: {
        status: "FAILED",
        notes: `Revoked on ${new Date().toISOString()}`,
      },
    });

    return {
      id: updatedRecord.id,
      studentId,
      ruleId,
      override: false,
      justification: updatedRecord.notes || "Revoked",
      approvedBy: "system",
      effectiveFrom: updatedRecord.createdAt.toISOString(),
      status: "revoked",
      createdAt: updatedRecord.createdAt.toISOString(),
    };
  }

  static async getOverrideHistory(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        complianceRecords: {
          where: { category: "OVERRIDE" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return {
      studentId,
      totalOverrides: student.complianceRecords.length,
      activeOverrides: student.complianceRecords.filter(
        (r) => r.status === "EXEMPTED",
      ).length,
      history: student.complianceRecords.map((record) => ({
        id: record.id,
        ruleId: record.requirement,
        status: record.status,
        justification: record.notes,
        createdAt: record.createdAt.toISOString(),
        completedAt: record.completedAt?.toISOString(),
      })),
    };
  }
}
