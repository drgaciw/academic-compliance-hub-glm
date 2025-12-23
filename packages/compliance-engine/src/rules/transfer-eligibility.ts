import type { StudentRecord, EligibilityResult } from "./types";

export class TransferEligibilityRule {
  static readonly BYLAW_14_5_4 = "14.5.4";
  static readonly RULE_ID = "transfer-eligibility";
  static readonly RULE_NAME = "NCAA Bylaw 14.5.4 Transfer Eligibility";

  private static readonly TRANSFER_GPA_THRESHOLD = 2.0;
  private static readonly MIN_RESIDENCY_CREDITS = 12;
  private static readonly ACCEPTABLE_GRADE_THRESHOLD = 2.0;

  static evaluateCreditAcceptance(
    student: StudentRecord,
    transferCredits: number,
  ): EligibilityResult {
    const acceptableTransferCredits = student.transferCredits || 0;
    const passed = acceptableTransferCredits >= transferCredits;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-credit-acceptance`,
      ruleName: "Transfer Credit Acceptance",
      bylawReference: this.BYLAW_14_5_4,
      message: passed
        ? `${acceptableTransferCredits} transfer credits accepted, meeting requirement`
        : `Only ${acceptableTransferCredits} of ${transferCredits} transfer credits accepted`,
      details: {
        currentValue: acceptableTransferCredits,
        requiredValue: transferCredits,
        difference: acceptableTransferCredits - transferCredits,
      },
    };

    if (!passed) {
      const deficit = transferCredits - acceptableTransferCredits;
      result.remediation = [
        `${deficit} transfer credits not accepted toward degree requirements`,
        `Verify course equivalencies with academic advisor`,
        `Submit course descriptions and syllabi for additional equivalency review`,
        `Consider taking equivalent courses at current institution`,
      ];
    }

    return result;
  }

  static evaluateCourseEquivalency(
    student: StudentRecord,
    equivalencyCount: number,
  ): EligibilityResult {
    const requiredEquivalencies = Math.min(12, student.degreeCredits || 120);
    const passed = equivalencyCount >= requiredEquivalencies;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-course-equivalency`,
      ruleName: "Course Equivalency",
      bylawReference: this.BYLAW_14_5_4,
      message: passed
        ? `${equivalencyCount} transfer courses with accepted equivalencies`
        : `Only ${equivalencyCount} of ${requiredEquivalencies} required equivalencies met`,
      details: {
        currentValue: equivalencyCount,
        requiredValue: requiredEquivalencies,
        difference: equivalencyCount - requiredEquivalencies,
      },
    };

    if (!passed) {
      const deficit = requiredEquivalencies - equivalencyCount;
      result.remediation = [
        `Establish equivalency for ${deficit} additional transfer courses`,
        `Provide official course descriptions and syllabi`,
        `Work with department chairs to evaluate course content`,
        `Submit articulation agreements from previous institution`,
      ];
    }

    return result;
  }

  static evaluateTransferGPA(student: StudentRecord): EligibilityResult {
    const transferGPA = student.transferGPA ?? student.gpa;
    const passed = transferGPA >= this.TRANSFER_GPA_THRESHOLD;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-transfer-gpa`,
      ruleName: "Transfer GPA",
      bylawReference: this.BYLAW_14_5_4,
      message: passed
        ? `Transfer GPA of ${transferGPA.toFixed(2)} meets ${this.TRANSFER_GPA_THRESHOLD} threshold`
        : `Transfer GPA of ${transferGPA.toFixed(2)} below ${this.TRANSFER_GPA_THRESHOLD} threshold`,
      details: {
        currentValue: transferGPA,
        requiredValue: this.TRANSFER_GPA_THRESHOLD,
        difference: transferGPA - this.TRANSFER_GPA_THRESHOLD,
      },
    };

    if (!passed) {
      const deficit = this.TRANSFER_GPA_THRESHOLD - transferGPA;
      result.remediation = [
        `Transfer GPA deficiency of ${deficit.toFixed(2)} points`,
        `Verify all transfer grades were accurately recorded`,
        `Request grade corrections if errors identified`,
        `Take additional courses at current institution to improve overall GPA`,
      ];
    }

    return result;
  }

  static evaluateResidency(student: StudentRecord): EligibilityResult {
    const residencyCredits = student.residencyCredits || student.currentCredits;
    const passed = residencyCredits >= this.MIN_RESIDENCY_CREDITS;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-residency`,
      ruleName: "Residency Requirement",
      bylawReference: this.BYLAW_14_5_4,
      message: passed
        ? `${residencyCredits} residency credits meet ${this.MIN_RESIDENCY_CREDITS} credit requirement`
        : `Only ${residencyCredits} residency credits, below ${this.MIN_RESIDENCY_CREDITS} credit requirement`,
      details: {
        currentValue: residencyCredits,
        requiredValue: this.MIN_RESIDENCY_CREDITS,
        difference: residencyCredits - this.MIN_RESIDENCY_CREDITS,
      },
    };

    if (!passed) {
      const deficit = this.MIN_RESIDENCY_CREDITS - residencyCredits;
      result.remediation = [
        `Complete ${deficit} additional residency credits at current institution`,
        `Residency must be established before eligibility for competition`,
        `Enroll in required number of credits each term at current institution`,
        `Track residency progress to ensure timely completion`,
      ];
    }

    return result;
  }

  static evaluate(student: StudentRecord): EligibilityResult {
    const transferGPAResult = this.evaluateTransferGPA(student);
    const residencyResult = this.evaluateResidency(student);

    const passed = transferGPAResult.passed && residencyResult.passed;

    return {
      passed,
      ruleId: this.RULE_ID,
      ruleName: this.RULE_NAME,
      bylawReference: this.BYLAW_14_5_4,
      message: passed
        ? `All transfer eligibility requirements met`
        : `Transfer eligibility violations detected`,
      details: {
        currentValue: student.transferCredits || 0,
        requiredValue: this.MIN_RESIDENCY_CREDITS,
        difference: (student.transferCredits || 0) - this.MIN_RESIDENCY_CREDITS,
      },
      remediation: [
        ...(transferGPAResult.remediation || []),
        ...(residencyResult.remediation || []),
      ],
    };
  }
}
