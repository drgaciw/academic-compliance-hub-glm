import type { StudentRecord, EligibilityResult } from "./types";

export class CoreCoursesRule {
  static readonly BYLAW_14_3 = "14.3";
  static readonly RULE_ID = "core-courses";
  static readonly RULE_NAME = "NCAA Bylaw 14.3 Core Courses";

  private static readonly CORE_COURSE_CREDITS = 16;
  private static readonly REQUIRED_CORE_CATEGORIES = {
    ENGLISH: 4,
    MATH: 3,
    SCIENCE: 2,
    SOCIAL_STUDIES: 2,
    ADDITIONAL: 5,
  };

  static evaluateTotalCoreCourses(student: StudentRecord): EligibilityResult {
    const coreCredits = student.coreCourseCredits || 0;
    const passed = coreCredits >= this.CORE_COURSE_CREDITS;

    const result: EligibilityResult = {
      passed,
      ruleId: `${this.RULE_ID}-total`,
      ruleName: "Total Core Courses",
      bylawReference: this.BYLAW_14_3,
      message: passed
        ? `Student has completed ${coreCredits} NCAA core course credits, meeting the ${this.CORE_COURSE_CREDITS} credit requirement`
        : `Student has completed only ${coreCredits} NCAA core course credits, failing to meet the ${this.CORE_COURSE_CREDITS} credit requirement`,
      details: {
        currentValue: coreCredits,
        requiredValue: this.CORE_COURSE_CREDITS,
        difference: coreCredits - this.CORE_COURSE_CREDITS,
      },
    };

    if (!passed) {
      const deficit = this.CORE_COURSE_CREDITS - coreCredits;
      result.remediation = [
        `Complete ${deficit} additional NCAA core course credits`,
        `Ensure core courses are NCAA-approved and properly designated`,
        `Prioritize core course completion in remaining semesters`,
        `Verify core course designations with academic advisor`,
        `Review core course list on NCAA Eligibility Center website`,
        `Consider summer courses to earn core credits faster`,
      ];
    }

    return result;
  }

  static evaluateCoreCategories(student: StudentRecord): EligibilityResult {
    const coreCategories = student.coreCategories || {};
    const violations: string[] = [];
    const remediation: string[] = [];

    for (const [category, required] of Object.entries(
      this.REQUIRED_CORE_CATEGORIES,
    )) {
      const completed = coreCategories[category] || 0;
      if (completed < required) {
        violations.push(
          `${category.toLowerCase().replace("_", " ")}: ${completed}/${required} credits`,
        );
        remediation.push(
          `Complete ${required - completed} additional ${category.toLowerCase().replace("_", " ")} core credits`,
        );
      }
    }

    const passed = violations.length === 0;

    return {
      passed,
      ruleId: `${this.RULE_ID}-categories`,
      ruleName: "Core Course Categories",
      bylawReference: this.BYLAW_14_3,
      message: passed
        ? "All core course category requirements are met"
        : `Core course category violations: ${violations.join("; ")}`,
      details: {
        currentValue: Object.values(coreCategories).reduce((a, b) => a + b, 0),
        requiredValue: this.CORE_COURSE_CREDITS,
        difference:
          Object.values(coreCategories).reduce((a, b) => a + b, 0) -
          this.CORE_COURSE_CREDITS,
      },
      remediation,
    };
  }

  static identifyCoreCourses(student: StudentRecord): string[] {
    const coreCourses = student.coreCourses || [];
    return coreCourses.filter((course) => course.startsWith("CORE-"));
  }

  static evaluate(student: StudentRecord): EligibilityResult {
    const totalResult = this.evaluateTotalCoreCourses(student);
    const categoriesResult = this.evaluateCoreCategories(student);

    const passed = totalResult.passed && categoriesResult.passed;

    return {
      passed,
      ruleId: this.RULE_ID,
      ruleName: this.RULE_NAME,
      bylawReference: this.BYLAW_14_3,
      message: passed
        ? `All core course requirements met`
        : `Core course requirement violations detected`,
      details: {
        currentValue: student.coreCourseCredits || 0,
        requiredValue: this.CORE_COURSE_CREDITS,
        difference: (student.coreCourseCredits || 0) - this.CORE_COURSE_CREDITS,
      },
      remediation: [
        ...(totalResult.remediation || []),
        ...(categoriesResult.remediation || []),
      ],
    };
  }
}
