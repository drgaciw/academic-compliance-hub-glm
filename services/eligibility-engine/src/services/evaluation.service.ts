import { prisma } from "@aah/database";
import {
  CreditHoursRule,
  GPARequirementsRule,
  ProgressTowardDegreeRule,
  TransferEligibilityRule,
  CoreCoursesRule,
  RuleConfigurationSystem,
} from "@aah/compliance-engine";
import type {
  StudentRecord,
  EligibilityResult,
  RuleEvaluationContext,
} from "@aah/compliance-engine";
import type {
  EvaluationRequest,
  EligibilityViolation,
} from "../types/index.js";

export class EvaluationService {
  static async evaluateStudent(request: EvaluationRequest) {
    const { studentId, season, sport, term } = request;

    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        courses: {
          where: { status: { in: ["COMPLETED"] } },
          include: { course: true },
        },
        transferEvaluations: true,
        user: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const context: RuleEvaluationContext = {
      sport: student.sport,
      season: season,
      term: term,
    };

    const studentRecord: StudentRecord = {
      studentId: student.studentId,
      name: `${student.user.firstName} ${student.user.lastName}`.trim(),
      gpa: student.gpa || 0,
      completedCredits: student.credits,
      currentCredits: 0,
      academicYear: student.year,
      academicStanding: "good",
      transferCredits: student.transferEvaluations.reduce(
        (sum, te) => sum + te.transferableCredits,
        0,
      ),
      cumulativeGPA: student.gpa || 0,
    };

    const ruleConfig = RuleConfigurationSystem.getInstance();
    const results = await ruleConfig.evaluateAllRules(studentRecord, context);

    const allPassed = results.every((r) => r.passed);
    const criticalViolations = results.filter((r) => !r.passed);

    return {
      studentId,
      eligible: allPassed,
      evaluatedAt: new Date().toISOString(),
      evaluationContext: context,
      results,
      violations: criticalViolations.map((v) => ({
        id: `${studentId}-${v.ruleId}`,
        studentId,
        ruleId: v.ruleId,
        ruleName: v.ruleName,
        bylawReference: v.bylawReference,
        severity: this.determineSeverity(v),
        currentValue: v.details.currentValue,
        requiredValue: v.details.requiredValue,
        remediation: v.remediation || [],
        createdAt: new Date().toISOString(),
        status: "active" as const,
      })),
    };
  }

  static async getCurrentEligibility(studentId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        transferEvaluations: true,
        complianceRecords: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const violations = await this.getViolations(studentId);

    return {
      studentId,
      eligible: student.eligibility,
      lastEvaluated: student.updatedAt,
      currentGPA: student.gpa || 0,
      earnedCredits: student.credits,
      transferCredits: student.transferEvaluations.reduce(
        (sum, te) => sum + te.transferableCredits,
        0,
      ),
      totalCredits:
        student.credits +
        student.transferEvaluations.reduce(
          (sum, te) => sum + te.transferableCredits,
          0,
        ),
      complianceRecords: student.complianceRecords,
      violations: violations.filter((v) => v.status === "active"),
    };
  }

  static async listRules() {
    const ruleConfig = RuleConfigurationSystem.getInstance();
    const configs = ruleConfig.getAllConfigs();

    return {
      totalRules: Object.keys(configs).length,
      rules: Object.entries(configs).map(([ruleId, config]) => ({
        ruleId,
        version: config.version,
        enabled: config.enabled,
        parameters: config.parameters,
      })),
    };
  }

  static async getViolations(
    studentId: string,
  ): Promise<EligibilityViolation[]> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        transferEvaluations: true,
        courses: {
          where: { status: "COMPLETED" },
          include: { course: true },
        },
        user: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const studentRecord: StudentRecord = {
      studentId: student.studentId,
      name: `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(),
      gpa: student.gpa || 0,
      completedCredits: student.credits,
      currentCredits: 0,
      academicYear: student.year,
      academicStanding: "good",
      transferCredits: student.transferEvaluations.reduce(
        (sum, te) => sum + te.transferableCredits,
        0,
      ),
      cumulativeGPA: student.gpa || 0,
    };

    const ruleConfig = RuleConfigurationSystem.getInstance();
    const results = await ruleConfig.evaluateAllRules(studentRecord);

    return results
      .filter((r) => !r.passed)
      .map((v) => ({
        id: `${studentId}-${v.ruleId}`,
        studentId,
        ruleId: v.ruleId,
        ruleName: v.ruleName,
        bylawReference: v.bylawReference,
        severity: this.determineSeverity(v),
        currentValue: v.details.currentValue,
        requiredValue: v.details.requiredValue,
        remediation: v.remediation || [],
        createdAt: new Date().toISOString(),
        status: "active",
      }));
  }

  private static determineSeverity(
    result: EligibilityResult,
  ): "critical" | "major" | "minor" {
    const difference = Math.abs(result.details.difference);
    if (difference > 1.0) return "critical";
    if (difference > 0.5) return "major";
    return "minor";
  }
}
