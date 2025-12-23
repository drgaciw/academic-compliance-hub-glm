import type { CourseGradeInfo } from "./cumulative-gpa";

export interface TransferCourse extends CourseGradeInfo {
  institutionId: string;
  institutionName?: string;
  transferId?: string;
  accepted: boolean;
  transferCredits?: number;
}

export interface TransferGPACalculationResult {
  institutionalGPA: number;
  institutionalCredits: number;
  transferGPA: number;
  acceptedTransferCredits: number;
  attemptedTransferCredits: number;
  combinedGPA: number;
  combinedCredits: number;
  overrideApplied: boolean;
  overrideValue: number | undefined;
}

export interface TransferOverrideRule {
  institutionId?: string;
  applyToAll?: boolean;
  overrideType: "replace" | "ignore" | "minimum";
  overrideValue?: number;
}

export class TransferGPACalculator {
  static calculateTransferGPA(
    transferCourses: TransferCourse[],
    options?: {
      includeUnaccepted?: boolean;
      useTransferCredits?: boolean;
    },
  ): {
    gpa: number;
    totalCredits: number;
    acceptedCredits: number;
    attemptedCredits: number;
    coursesIncluded: number;
    qualityPoints: number;
  } {
    const includeUnaccepted = options?.includeUnaccepted ?? false;
    const useTransferCredits = options?.useTransferCredits ?? false;

    let filteredCourses = transferCourses.filter((course) => {
      if (!includeUnaccepted && !course.accepted) return false;
      return true;
    });

    let totalCredits = 0;
    let acceptedCredits = 0;
    let attemptedCredits = 0;
    let qualityPoints = 0;

    for (const course of filteredCourses) {
      const creditsToUse =
        useTransferCredits && course.transferCredits
          ? course.transferCredits
          : course.credits;

      if (course.accepted) {
        totalCredits += creditsToUse;
        acceptedCredits += creditsToUse;
        qualityPoints += course.grade * creditsToUse;
      } else {
        attemptedCredits += creditsToUse;
      }
    }

    const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0.0;

    return {
      gpa: parseFloat(gpa.toFixed(2)),
      totalCredits,
      acceptedCredits,
      attemptedCredits,
      coursesIncluded: filteredCourses.length,
      qualityPoints: parseFloat(qualityPoints.toFixed(2)),
    };
  }

  static calculateCombinedGPA(
    institutionalCourses: CourseGradeInfo[],
    transferCourses: TransferCourse[],
    overrideRules?: TransferOverrideRule[],
    options?: {
      overrideInstitutionalGPA?: boolean;
      overrideValue?: number;
    },
  ): TransferGPACalculationResult {
    const institutionalResult =
      this.calculateInstitutionalGPA(institutionalCourses);
    const transferResult = this.calculateTransferGPA(transferCourses);

    let finalInstitutionalGPA = institutionalResult.gpa;

    let overrideApplied = false;
    let overrideValue: number | undefined;

    if (
      options?.overrideInstitutionalGPA &&
      options.overrideValue !== undefined
    ) {
      finalInstitutionalGPA = options.overrideValue;
      overrideApplied = true;
      overrideValue = options.overrideValue;
    } else if (overrideRules && overrideRules.length > 0) {
      for (const rule of overrideRules) {
        if (rule.applyToAll) {
          if (
            rule.overrideType === "replace" &&
            rule.overrideValue !== undefined
          ) {
            finalInstitutionalGPA = rule.overrideValue;
            overrideApplied = true;
            overrideValue = rule.overrideValue;
          } else if (rule.overrideType === "ignore") {
            finalInstitutionalGPA = 0.0;
            overrideApplied = true;
            overrideValue = 0.0;
          }
        }
      }
    }

    const combinedQualityPoints =
      institutionalResult.qualityPoints + transferResult.qualityPoints;
    const combinedCredits =
      institutionalResult.credits + transferResult.totalCredits;

    const combinedGPA =
      combinedCredits > 0 ? combinedQualityPoints / combinedCredits : 0.0;

    return {
      institutionalGPA: finalInstitutionalGPA,
      institutionalCredits: institutionalResult.credits,
      transferGPA: transferResult.gpa,
      acceptedTransferCredits: transferResult.acceptedCredits,
      attemptedTransferCredits: transferResult.attemptedCredits,
      combinedGPA: parseFloat(combinedGPA.toFixed(2)),
      combinedCredits,
      overrideApplied,
      overrideValue,
    };
  }

  static calculateInstitutionalGPA(courses: CourseGradeInfo[]): {
    gpa: number;
    credits: number;
    qualityPoints: number;
    coursesEvaluated: number;
  } {
    if (courses.length === 0) {
      return {
        gpa: 0.0,
        credits: 0,
        qualityPoints: 0,
        coursesEvaluated: 0,
      };
    }

    let credits = 0;
    let qualityPoints = 0;

    for (const course of courses) {
      credits += course.credits;
      qualityPoints += course.grade * course.credits;
    }

    const gpa = credits > 0 ? qualityPoints / credits : 0.0;

    return {
      gpa: parseFloat(gpa.toFixed(2)),
      credits,
      qualityPoints: parseFloat(qualityPoints.toFixed(2)),
      coursesEvaluated: courses.length,
    };
  }

  static filterTransferCoursesByInstitution(
    courses: TransferCourse[],
    institutionId: string,
  ): TransferCourse[] {
    return courses.filter((course) => course.institutionId === institutionId);
  }

  static getTransferCreditSummary(courses: TransferCourse[]): {
    totalCourses: number;
    acceptedCourses: number;
    rejectedCourses: number;
    acceptedCredits: number;
    rejectedCredits: number;
    acceptanceRate: number;
  } {
    const acceptedCourses = courses.filter((c) => c.accepted);
    const rejectedCourses = courses.filter((c) => !c.accepted);

    const acceptedCredits = acceptedCourses.reduce(
      (sum, c) => sum + (c.transferCredits ?? c.credits),
      0,
    );
    const rejectedCredits = rejectedCourses.reduce(
      (sum, c) => sum + c.credits,
      0,
    );

    const acceptanceRate =
      courses.length > 0 ? acceptedCourses.length / courses.length : 0;

    return {
      totalCourses: courses.length,
      acceptedCourses: acceptedCourses.length,
      rejectedCourses: rejectedCourses.length,
      acceptedCredits,
      rejectedCredits,
      acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
    };
  }

  static applyOverrideRule(
    currentGPA: number,
    rule: TransferOverrideRule,
  ): {
    newGPA: number;
    ruleApplied: boolean;
    reason: string;
  } {
    let newGPA = currentGPA;
    let ruleApplied = false;
    let reason = "No override applied";

    if (rule.overrideType === "replace" && rule.overrideValue !== undefined) {
      newGPA = rule.overrideValue;
      ruleApplied = true;
      reason = `GPA replaced with override value: ${rule.overrideValue}`;
    } else if (rule.overrideType === "ignore") {
      newGPA = 0.0;
      ruleApplied = true;
      reason = "Institutional GPA ignored (set to 0.0)";
    } else if (
      rule.overrideType === "minimum" &&
      rule.overrideValue !== undefined
    ) {
      newGPA = Math.max(currentGPA, rule.overrideValue);
      ruleApplied = currentGPA < rule.overrideValue;
      reason = ruleApplied
        ? `GPA raised to minimum: ${rule.overrideValue}`
        : `GPA above minimum: ${rule.overrideValue}`;
    }

    return {
      newGPA: parseFloat(newGPA.toFixed(2)),
      ruleApplied,
      reason,
    };
  }
}
