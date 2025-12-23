import { describe, it, expect } from "@jest/globals";
import { CreditHoursRule } from "../src/rules/credit-hours";
import type { StudentRecord } from "../src/rules/types";

describe("CreditHoursRule - Bylaw 14.5.1", () => {
  describe("Boundary Tests - Exact Threshold Values", () => {
    it("should pass for year 1 student with exactly 6 credits", () => {
      const student: StudentRecord = {
        studentId: "001",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 3,
        currentCredits: 3,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(6);
      expect(result.details.requiredValue).toBe(6);
      expect(result.details.difference).toBe(0);
      expect(result.bylawReference).toBe("14.5.1");
      expect(result.remediation).toBeUndefined();
    });

    it("should pass for year 2 student with exactly 24 credits", () => {
      const student: StudentRecord = {
        studentId: "002",
        name: "Test Student",
        gpa: 2.5,
        completedCredits: 18,
        currentCredits: 6,
        academicYear: 2,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(24);
      expect(result.details.requiredValue).toBe(24);
    });

    it("should pass for year 3 student with exactly 48 credits", () => {
      const student: StudentRecord = {
        studentId: "003",
        name: "Test Student",
        gpa: 2.8,
        completedCredits: 42,
        currentCredits: 6,
        academicYear: 3,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(48);
    });

    it("should pass for year 4 student with exactly 72 credits", () => {
      const student: StudentRecord = {
        studentId: "004",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 66,
        currentCredits: 6,
        academicYear: 4,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(72);
    });
  });

  describe("Below Threshold Tests", () => {
    it("should fail for year 1 student with 5 credits", () => {
      const student: StudentRecord = {
        studentId: "005",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 2,
        currentCredits: 3,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(5);
      expect(result.details.requiredValue).toBe(6);
      expect(result.details.difference).toBe(-1);
      expect(result.remediation).toBeDefined();
    });

    it("should fail for year 4 student with 71 credits", () => {
      const student: StudentRecord = {
        studentId: "006",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 65,
        currentCredits: 6,
        academicYear: 4,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(71);
      expect(result.details.requiredValue).toBe(72);
    });
  });

  describe("Violation Detection", () => {
    it("should detect violation and include bylaw reference 14.5.1", () => {
      const student: StudentRecord = {
        studentId: "007",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 2,
        currentCredits: 2,
        academicYear: 1,
        academicStanding: "good",
      };
      const result = CreditHoursRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.bylawReference).toBe("14.5.1");
      expect(result.ruleId).toBe("credit-hours-requirement");
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
      gpa: 1.5,
      completedCredits: 0,
      currentCredits: 3,
      academicYear: 1,
      academicStanding: "suspension",
    };

    it("perfect student should pass credit requirements", () => {
      const result = CreditHoursRule.evaluate(perfectStudent);
      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(102);
    });

    it("failing student should fail credit requirements", () => {
      const result = CreditHoursRule.evaluate(failingStudent);
      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(3);
    });
  });
});
