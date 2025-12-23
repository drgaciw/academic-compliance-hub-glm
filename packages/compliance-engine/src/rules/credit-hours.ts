import type { StudentRecord, EligibilityResult } from "./types";

export class CreditHoursRule {
  static readonly BYLAW_14_5_1 = "14.5.1";
  static readonly RULE_ID = "credit-hours-requirement";
  static readonly RULE_NAME = "NCAA Bylaw 14.5.1 Credit Hours";

  private static readonly NEXT_TERM_MINIMUM = 6;
  private static readonly PRACTICE_COMPETITION_MINIMUM = 12;

  static evaluateNextTermEligibility(
    student: StudentRecord,
  ): EligibilityResult {
    const termCredits = student.termCredits || student.currentCredits;
    const passed = termCredits >= this.NEXT_TERM_MINIMUM;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-next-term`,
      ruleName: "Next-Term Credit Hours",
      bylawReference: this.BYLAW_14_5_1,
      message: passed
        ? `Student enrolled in ${termCredits} credits, meeting the ${this.NEXT_TERM_MINIMUM} credit minimum for next-term eligibility`
        : `Student enrolled in only ${termCredits} credits, failing the ${this.NEXT_TERM_MINIMUM} credit minimum for next-term eligibility`,
      details: {
        currentValue: termCredits,
        requiredValue: this.NEXT_TERM_MINIMUM,
        difference: termCredits - this.NEXT_TERM_MINIMUM,
      },
    };

    if (!passed) {
      const deficit = this.NEXT_TERM_MINIMUM - termCredits;
      result.remediation = [
        `Add ${deficit} additional credit(s) to current term enrollment`,
        `Student will not be eligible for next term unless minimum credits are met`,
        `Contact registrar immediately to adjust course load`,
      ];
    }

    return result;
  }

  static evaluatePracticeCompetition(
    student: StudentRecord,
  ): EligibilityResult {
    const termCredits = student.termCredits || student.currentCredits;
    const passed = termCredits >= this.PRACTICE_COMPETITION_MINIMUM;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-practice`,
      ruleName: "Practice and Competition Credit Hours",
      bylawReference: this.BYLAW_14_5_1,
      message: passed
        ? `Student enrolled in ${termCredits} credits, meeting the ${this.PRACTICE_COMPETITION_MINIMUM} credit minimum for practice/competition`
        : `Student enrolled in only ${termCredits} credits, failing the ${this.PRACTICE_COMPETITION_MINIMUM} credit minimum for practice/competition`,
      details: {
        currentValue: termCredits,
        requiredValue: this.PRACTICE_COMPETITION_MINIMUM,
        difference: termCredits - this.PRACTICE_COMPETITION_MINIMUM,
      },
    };

    if (!passed) {
      const deficit = this.PRACTICE_COMPETITION_MINIMUM - termCredits;
      result.remediation = [
        `Student is ineligible for practice and competition with fewer than ${this.PRACTICE_COMPETITION_MINIMUM} credits`,
        `Add ${deficit} additional credit(s) to current term enrollment immediately`,
        `Head coach must withhold student from practice/competition until requirement is met`,
      ];
    }

    return result;
  }

  static evaluatePerTerm(student: StudentRecord): EligibilityResult {
    const nextTermResult = this.evaluateNextTermEligibility(student);
    const practiceResult = this.evaluatePracticeCompetition(student);

    const passed = nextTermResult.passed && practiceResult.passed;

    return {
      passed,
      ruleId: this.RULE_ID,
      ruleName: this.RULE_NAME,
      bylawReference: this.BYLAW_14_5_1,
      message: passed
        ? `All per-term credit hour requirements met`
        : `Per-term credit hour violations detected`,
      details: {
        currentValue: student.termCredits || student.currentCredits,
        requiredValue: this.PRACTICE_COMPETITION_MINIMUM,
        difference:
          (student.termCredits || student.currentCredits) -
          this.PRACTICE_COMPETITION_MINIMUM,
      },
      remediation: [
        ...(nextTermResult.remediation || []),
        ...(practiceResult.remediation || []),
      ],
    };
  }

  static evaluate(student: StudentRecord): EligibilityResult {
    return this.evaluatePerTerm(student);
  }
}
