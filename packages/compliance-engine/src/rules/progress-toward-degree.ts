import {
  StudentRecord,
  EligibilityResult,
  ProgressTowardDegree,
} from "./types";

export class ProgressTowardDegreeRule {
  static readonly BYLAW_14_5_3 = "14.5.3";
  static readonly RULE_ID = "progress-toward-degree";
  static readonly RULE_NAME = "NCAA Bylaw 14.5.3 Progress Toward Degree";

  private static getRequiredPercentage(academicYear: number): number {
    if (academicYear < 2) return 0;
    if (academicYear < 3) return 0.4;
    if (academicYear < 4) return 0.6;
    return 0.8;
  }

  private static calculatePTD(
    student: StudentRecord,
    totalDegreeCredits: number,
  ): ProgressTowardDegree {
    const creditsEarned = student.completedCredits + student.currentCredits;
    const requiredPercentage = this.getRequiredPercentage(student.academicYear);
    const percentageComplete =
      totalDegreeCredits > 0 ? creditsEarned / totalDegreeCredits : 0;

    return {
      percentageComplete,
      requiredPercentage,
      totalDegreeCredits,
      creditsEarned,
    };
  }

  static evaluate(
    student: StudentRecord,
    totalDegreeCredits: number,
  ): EligibilityResult {
    const ptd = this.calculatePTD(student, totalDegreeCredits);

    if (student.academicYear < 2) {
      return {
        passed: true,
        ruleId: this.RULE_ID,
        ruleName: this.RULE_NAME,
        bylawReference: this.BYLAW_14_5_3,
        message: `PTD requirement not applicable for academic year ${student.academicYear}`,
        details: {
          currentValue: 0,
          requiredValue: 0,
          difference: 0,
        },
      };
    }

    const passed = ptd.percentageComplete >= ptd.requiredPercentage;

    const currentPercentage = (ptd.percentageComplete * 100).toFixed(1);
    const requiredPercentage = (ptd.requiredPercentage * 100).toFixed(1);

    const result: EligibilityResult = {
      passed,
      ruleId: this.RULE_ID,
      ruleName: this.RULE_NAME,
      bylawReference: this.BYLAW_14_5_3,
      message: passed
        ? `Student has completed ${currentPercentage}% of degree (${ptd.creditsEarned}/${ptd.totalDegreeCredits} credits), meeting the ${requiredPercentage}% PTD requirement for end of year ${student.academicYear}`
        : `Student has completed only ${currentPercentage}% of degree (${ptd.creditsEarned}/${ptd.totalDegreeCredits} credits), failing to meet the ${requiredPercentage}% PTD requirement for end of year ${student.academicYear}`,
      details: {
        currentValue: ptd.percentageComplete,
        requiredValue: ptd.requiredPercentage,
        difference: ptd.percentageComplete - ptd.requiredPercentage,
      },
    };

    if (!passed) {
      const percentageDeficit =
        (ptd.requiredPercentage - ptd.percentageComplete) * 100;
      const creditDeficit =
        Math.ceil(totalDegreeCredits * ptd.requiredPercentage) -
        ptd.creditsEarned;
      result.remediation = [
        `PTD deficiency: Student is ${percentageDeficit.toFixed(1)}% (${creditDeficit} credits) behind requirement`,
        `Complete ${creditDeficit} additional credits before end of academic year ${student.academicYear}`,
        `Accelerate degree progress by taking additional credits per term`,
        `Consider enrolling in summer courses to earn credits faster`,
        `Verify all transfer credits have been properly applied toward degree requirements`,
        `Review degree audit with academic advisor to optimize credit efficiency`,
        `Student may be ineligible for competition until PTD requirement is met`,
      ];
    }

    return result;
  }

  static calculateDegreeRequirement(
    student: StudentRecord,
    totalDegreeCredits: number,
  ): {
    requiredCredits: number;
    creditsEarned: number;
    creditsRemaining: number;
    onTrack: boolean;
  } {
    const ptd = this.calculatePTD(student, totalDegreeCredits);
    const requiredCredits = Math.ceil(
      totalDegreeCredits * ptd.requiredPercentage,
    );
    const creditsRemaining = Math.max(0, requiredCredits - ptd.creditsEarned);
    const onTrack = ptd.percentageComplete >= ptd.requiredPercentage;

    return {
      requiredCredits,
      creditsEarned: ptd.creditsEarned,
      creditsRemaining,
      onTrack,
    };
  }
}
