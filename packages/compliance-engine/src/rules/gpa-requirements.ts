import type { StudentRecord, EligibilityResult } from "./types";

export class GPARequirementsRule {
  static readonly BYLAW_14_5_2 = "14.5.2";
  static readonly RULE_ID = "gpa-requirement";
  static readonly RULE_NAME = "NCAA Bylaw 14.5.2 GPA Requirements";

  private static getMinimumGPA(
    academicYear: number,
    institutionalGPA: number = 2.0,
  ): number {
    if (academicYear < 2) return institutionalGPA * 0.9;
    if (academicYear < 4) return institutionalGPA * 0.9;
    return institutionalGPA;
  }

  static evaluateCumulativeGPA(
    student: StudentRecord,
    institutionalGPA: number = 2.0,
  ): EligibilityResult {
    const minGPA = this.getMinimumGPA(student.academicYear, institutionalGPA);
    const currentGPA = student.cumulativeGPA ?? student.gpa;
    const passed = currentGPA >= minGPA;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-cumulative`,
      ruleName: "Cumulative GPA",
      bylawReference: this.BYLAW_14_5_2,
      message: passed
        ? `Cumulative GPA of ${currentGPA.toFixed(2)} meets the ${minGPA.toFixed(2)} minimum requirement (${student.academicYear >= 4 ? "100%" : "90%"} of institutional)`
        : `Cumulative GPA of ${currentGPA.toFixed(2)} is below the ${minGPA.toFixed(2)} minimum requirement (${student.academicYear >= 4 ? "100%" : "90%"} of institutional)`,
      details: {
        currentValue: currentGPA,
        requiredValue: minGPA,
        difference: currentGPA - minGPA,
      },
    };

    if (!passed) {
      const deficit = minGPA - currentGPA;
      result.remediation = [
        `Cumulative GPA deficiency of ${deficit.toFixed(2)} points`,
        `Improve academic performance in current courses`,
        `Utilize tutoring and academic support services`,
        `Consider retaking courses with low grades for grade replacement`,
        `Meet with academic advisor to develop GPA improvement plan`,
      ];
    }

    return result;
  }

  static evaluateSubjectAreaGPA(
    student: StudentRecord,
    institutionalGPA: number = 2.0,
  ): EligibilityResult {
    const subjectAreaGPAs = student.subjectAreaGPAs || {};
    const minGPA = this.getMinimumGPA(student.academicYear, institutionalGPA);
    const passed = Object.values(subjectAreaGPAs).every((gpa) => gpa >= minGPA);

    const belowThresholdAreas = Object.entries(subjectAreaGPAs)
      .filter(([_, gpa]) => gpa < minGPA)
      .map(([area, gpa]) => `${area}: ${gpa.toFixed(2)}`);

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-subject-area`,
      ruleName: "Subject Area GPA",
      bylawReference: this.BYLAW_14_5_2,
      message: passed
        ? `All subject area GPAs meet the ${minGPA.toFixed(2)} minimum requirement`
        : `Subject area GPA violations: ${belowThresholdAreas.join(", ")}`,
      details: {
        currentValue: Math.min(...Object.values(subjectAreaGPAs), 999),
        requiredValue: minGPA,
        difference: Math.min(...Object.values(subjectAreaGPAs), 999) - minGPA,
      },
    };

    if (!passed) {
      result.remediation = [
        ...belowThresholdAreas.map(
          (area) => `Improve GPA in ${area} to meet minimum threshold`,
        ),
        `Focus academic efforts on subjects with lowest GPA`,
        `Meet with departmental advisors for subject-specific support`,
      ];
    }

    return result;
  }

  static evaluate(
    student: StudentRecord,
    institutionalGPA: number = 2.0,
  ): EligibilityResult {
    const cumulativeResult = this.evaluateCumulativeGPA(
      student,
      institutionalGPA,
    );
    const subjectAreaResult = this.evaluateSubjectAreaGPA(
      student,
      institutionalGPA,
    );

    const passed = cumulativeResult.passed && subjectAreaResult.passed;

    return {
      passed,
      ruleId: this.RULE_ID,
      ruleName: this.RULE_NAME,
      bylawReference: this.BYLAW_14_5_2,
      message: passed
        ? `All GPA requirements met`
        : `GPA requirement violations detected`,
      details: {
        currentValue: student.gpa,
        requiredValue: institutionalGPA,
        difference: student.gpa - institutionalGPA,
      },
      remediation: [
        ...(cumulativeResult.remediation || []),
        ...(subjectAreaResult.remediation || []),
      ],
    };
  }
}
