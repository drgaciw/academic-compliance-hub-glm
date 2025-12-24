import { prisma } from "@aah/database";
import {
  TransferEligibilityRule,
  RuleConfigurationSystem,
} from "@aah/compliance-engine";
import type { StudentRecord } from "@aah/compliance-engine";

export interface TransferCreditEvaluation {
  evaluationId: string;
  studentId: string;
  sourceInstitution: string;
  totalCredits: number;
  transferableCredits: number;
  nonTransferableCredits: number;
  gpa: number;
  courseMappings: Array<{
    sourceCourseCode: string;
    sourceCourseTitle: string;
    sourceCredits: number;
    targetCourseCode?: string;
    targetCourseTitle?: string;
    targetCredits?: number;
    isEquivalent: boolean;
    reason?: string;
  }>;
  eligibilityStatus: "eligible" | "ineligible" | "conditional";
  warnings: string[];
}

export class TransferService {
  static async evaluateTransferCredits(
    studentId: string,
  ): Promise<TransferCreditEvaluation> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        user: true,
        transferEvaluations: {
          include: {
            sourceInstitution: true,
            courseMappings: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const latestEvaluation = student.transferEvaluations[0];
    if (!latestEvaluation) {
      return {
        evaluationId: "",
        studentId,
        sourceInstitution: "N/A",
        totalCredits: 0,
        transferableCredits: 0,
        nonTransferableCredits: 0,
        gpa: 0,
        courseMappings: [],
        eligibilityStatus: "ineligible",
        warnings: ["No transfer evaluation found"],
      };
    }

    const courseMappings = latestEvaluation.courseMappings.map((cm) => ({
      sourceCourseCode: cm.sourceCourseCode,
      sourceCourseTitle: cm.sourceCourseTitle,
      sourceCredits: cm.sourceCredits,
      targetCourseCode: cm.targetCourseCode || undefined,
      targetCourseTitle: cm.targetCourseTitle || undefined,
      targetCredits: cm.targetCredits || undefined,
      isEquivalent: cm.isEquivalent,
      reason: cm.exceptionReason || undefined,
    }));

    const warnings: string[] = [];
    const transferableCredits = courseMappings
      .filter((cm) => cm.isEquivalent)
      .reduce((sum, cm) => sum + (cm.targetCredits ?? cm.sourceCredits), 0);

    if (transferableCredits === 0) {
      warnings.push("No transferable credits found");
    }

    if (latestEvaluation.gpa && latestEvaluation.gpa < 2.0) {
      warnings.push("Transfer GPA below minimum requirement");
    }

    const studentRecord: StudentRecord = {
      studentId: student.studentId,
      name: `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(),
      gpa: latestEvaluation.gpa || 0,
      completedCredits: student.credits,
      currentCredits: 0,
      academicYear: student.year,
      academicStanding: "good",
      transferCredits: transferableCredits,
    };

    const ruleConfig = RuleConfigurationSystem.getInstance();
    const ruleResult = await ruleConfig.evaluateRule(
      "transfer-eligibility",
      studentRecord,
    );

    const eligibilityStatus = ruleResult.passed ? "eligible" : "ineligible";

    return {
      evaluationId: latestEvaluation.id,
      studentId,
      sourceInstitution: latestEvaluation.sourceInstitution.name,
      totalCredits: latestEvaluation.totalCredits,
      transferableCredits,
      nonTransferableCredits:
        latestEvaluation.totalCredits - transferableCredits,
      gpa: latestEvaluation.gpa || 0,
      courseMappings,
      eligibilityStatus,
      warnings,
    };
  }

  static async getTransferSummary(studentId: string) {
    const evaluation = await this.evaluateTransferCredits(studentId);

    return {
      summary: {
        totalInstitutions: 1,
        totalCreditsEvaluated: evaluation.totalCredits,
        totalTransferableCredits: evaluation.transferableCredits,
        averageTransferGPA: evaluation.gpa,
      },
      byInstitution: [
        {
          institution: evaluation.sourceInstitution,
          credits: evaluation.totalCredits,
          transferable: evaluation.transferableCredits,
          gpa: evaluation.gpa,
        },
      ],
      bySubject: this.groupCoursesBySubject(evaluation.courseMappings),
    };
  }

  static async validateTransferCourse(
    studentId: string,
    sourceCourseCode: string,
    sourceInstitutionCode: string,
  ) {
    const institution = await prisma.institution.findUnique({
      where: { code: sourceInstitutionCode },
    });

    if (!institution) {
      throw new Error("Institution not found");
    }

    const evaluation = await this.evaluateTransferCredits(studentId);
    const courseMapping = evaluation.courseMappings.find(
      (cm) => cm.sourceCourseCode === sourceCourseCode,
    );

    if (!courseMapping) {
      return {
        valid: false,
        message: "Course not found in transfer evaluation",
      };
    }

    return {
      valid: courseMapping.isEquivalent,
      transferable: courseMapping.isEquivalent,
      targetCourse: courseMapping.targetCourseCode,
      targetCredits: courseMapping.targetCredits,
      reason: courseMapping.reason,
    };
  }

  private static groupCoursesBySubject(courseMappings: any[]) {
    const grouped: Record<string, { count: number; credits: number }> = {};

    for (const mapping of courseMappings) {
      const subject = mapping.targetCourseCode?.split(" ")[0] || "GEN";
      grouped[subject] = grouped[subject] || { count: 0, credits: 0 };
      grouped[subject].count++;
      grouped[subject].credits += mapping.sourceCredits;
    }

    return Object.entries(grouped).map(([subject, data]) => ({
      subject,
      courseCount: data.count,
      credits: data.credits,
    }));
  }
}
