import { describe, it, expect } from "@jest/globals";
import { ProgressTowardDegreeRule } from "../src/rules/progress-toward-degree";
import type { StudentRecord } from "../src/rules/types";

describe("ProgressTowardDegreeRule - Bylaw 14.5.3", () => {
  const DEFAULT_DEGREE_CREDITS = 120;

  describe("Boundary Tests - Exact Threshold Percentages", () => {
    it("should pass for year 1 student with exactly 40% completion", () => {
      const student: StudentRecord = {
        studentId: "001",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 42,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = ProgressTowardDegreeRule.evaluate(student, DEFAULT_DEGREE_CREDITS);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(0.4);
      expect(result.details.requiredValue).toBe(0.4);
      expect(result.bylawReference).toBe("14.5.3");
    });

    it("should pass for year 4 student with exactly 75% completion", () => {
      const student: StudentRecord = {
        studentId: "002",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 84,
        currentCredits: 6,
        academicYear: 4,
        academicStanding: "good",
      };
      const result = ProgressTowardDegreeRule.evaluate(student, DEFAULT_DEGREE_CREDITS);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(0.75);
      expect(result.details.requiredValue).toBe(0.75);
    });
  });

  describe("Below Threshold Tests", () => {
    it("should fail for year 1 student with 39% completion", () => {
      const student: StudentRecord = {
        studentId: "003",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 41,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = ProgressTowardDegreeRule.evaluate(student, DEFAULT_DEGREE_CREDITS);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBeCloseTo(0.392, 3);
      expect(result.details.requiredValue).toBe(0.4);
      expect(result.remediation).toBeDefined();
    });
  });

  describe("Violation Detection", () => {
    it("should detect violation and include bylaw reference 14.5.3", () => {
      const student: StudentRecord = {
        studentId: "004",
        name: "Test Student",
        gpa: 2.0,
        completedCredits: 35,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "warning",
      };
      const result = ProgressTowardDegreeRule.evaluate(student, DEFAULT_DEGREE_CREDITS);

      expect(result.passed).toBe(false);
      expect(result.bylawReference).toBe("14.5.3");
      expect(result.ruleId).toBe("progress-toward-degree");
    });
  });

  describe("Mock Data Testing", () => {
    const perfectStudent: StudentRecord = {
      studentId: "PERFECT-001",
      name: "Perfect Student",
      gpa: 4.0,
      completedCredits: 114,
      currentCredits: 6,
      academicYear: 4,
      academicStanding: "good",
    };

    const failingStudent: StudentRecord = {
      studentId: "FAIL-001",
      name: "Failing Student",
      gpa: 1.5,
      completedCredits: 30,
      currentCredits: 0,
      academicYear: 1,
      academicStanding: "suspension",
    };

    it("perfect student should pass PTD requirements", () => {
      const result = ProgressTowardDegreeRule.evaluate(perfectStudent, DEFAULT_DEGREE_CREDITS);
      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(1.0);
    });

    it("failing student should fail PTD requirements", () => {
      const result = ProgressTowardDegreeRule.evaluate(failingStudent, DEFAULT_DEGREE_CREDITS);
      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(0.25);
    });
  });
});
