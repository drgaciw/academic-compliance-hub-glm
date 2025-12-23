import { describe, it, expect } from "@jest/globals";
import { GPARequirementsRule } from "../src/rules/gpa-requirements";
import type { StudentRecord } from "../src/rules/types";

describe("GPARequirementsRule - Bylaw 14.5.2", () => {
  describe("Boundary Tests - Exact Threshold Values", () => {
    it("should pass for year 1 student with exactly 1.8 GPA", () => {
      const student: StudentRecord = {
        studentId: "001",
        name: "Test Student",
        gpa: 1.8,
        completedCredits: 12,
        currentCredits: 3,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = GPARequirementsRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(1.8);
      expect(result.details.requiredValue).toBe(1.8);
      expect(result.bylawReference).toBe("14.5.2");
    });

    it("should pass for year 3+ student with exactly 2.0 GPA", () => {
      const student: StudentRecord = {
        studentId: "002",
        name: "Test Student",
        gpa: 2.0,
        completedCredits: 48,
        currentCredits: 6,
        academicYear: 3,
        academicStanding: "good",
      };
      const result = GPARequirementsRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(2.0);
      expect(result.details.requiredValue).toBe(2.0);
    });
  });

  describe("Below Threshold Tests", () => {
    it("should fail for year 1 student with 1.79 GPA", () => {
      const student: StudentRecord = {
        studentId: "003",
        name: "Test Student",
        gpa: 1.79,
        completedCredits: 12,
        currentCredits: 3,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = GPARequirementsRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(1.79);
      expect(result.details.requiredValue).toBe(1.8);
      expect(result.remediation).toBeDefined();
    });

    it("should fail for year 3+ student with 1.99 GPA", () => {
      const student: StudentRecord = {
        studentId: "004",
        name: "Test Student",
        gpa: 1.99,
        completedCredits: 48,
        currentCredits: 6,
        academicYear: 3,
        academicStanding: "probation",
      };
      const result = GPARequirementsRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(1.99);
      expect(result.details.requiredValue).toBe(2.0);
    });
  });

  describe("Violation Detection", () => {
    it("should detect violation and include bylaw reference 14.5.2", () => {
      const student: StudentRecord = {
        studentId: "005",
        name: "Test Student",
        gpa: 1.7,
        completedCredits: 12,
        currentCredits: 3,
        academicYear: 1,
        academicStanding: "warning",
      };
      const result = GPARequirementsRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.bylawReference).toBe("14.5.2");
      expect(result.ruleId).toBe("gpa-requirement");
    });
  });

  describe("Mock Data Testing", () => {
    const perfectStudent: StudentRecord = {
      studentId: "PERFECT-001",
      name: "Perfect Student",
      gpa: 4.0,
      completedCredits: 90,
      currentCredits: 12,
      academicYear: 4,
      academicStanding: "good",
    };

    const failingStudent: StudentRecord = {
      studentId: "FAIL-001",
      name: "Failing Student",
      gpa: 1.0,
      completedCredits: 30,
      currentCredits: 6,
      academicYear: 2,
      academicStanding: "suspension",
    };

    it("perfect student should pass GPA requirements", () => {
      const result = GPARequirementsRule.evaluate(perfectStudent);
      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(4.0);
    });

    it("failing student should fail GPA requirements", () => {
      const result = GPARequirementsRule.evaluate(failingStudent);
      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(1.0);
    });
  });
});
