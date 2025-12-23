import { describe, it, expect } from "@jest/globals";
import { TransferEligibilityRule } from "../src/rules/transfer-eligibility";
import type { StudentRecord } from "../src/rules/types";

describe("TransferEligibilityRule - Bylaw 14.5.4", () => {
  describe("Boundary Tests - Exact Threshold Values", () => {
    it("should pass with exactly 2.0 GPA, 60 transfer credits, and 12 current credits", () => {
      const student: StudentRecord = {
        studentId: "001",
        name: "Test Student",
        gpa: 2.0,
        completedCredits: 60,
        currentCredits: 12,
        academicYear: 2,
        academicStanding: "good",
        transferCredits: 60,
      };
      const result = TransferEligibilityRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(2.0);
      expect(result.details.requiredValue).toBe(2.0);
      expect(result.bylawReference).toBe("14.5.4");
    });
  });

  describe("Below Threshold Tests - GPA", () => {
    it("should fail for GPA of 1.99 (0.01 below 2.0)", () => {
      const student: StudentRecord = {
        studentId: "002",
        name: "Test Student",
        gpa: 1.99,
        completedCredits: 30,
        currentCredits: 12,
        academicYear: 2,
        academicStanding: "good",
        transferCredits: 30,
      };
      const result = TransferEligibilityRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(1.99);
      expect(result.details.requiredValue).toBe(2.0);
      expect(result.remediation).toBeDefined();
    });
  });

  describe("Multiple Violations", () => {
    it("should fail for both low GPA and excess transfer credits", () => {
      const student: StudentRecord = {
        studentId: "003",
        name: "Test Student",
        gpa: 1.8,
        completedCredits: 70,
        currentCredits: 12,
        academicYear: 3,
        academicStanding: "probation",
        transferCredits: 70,
      };
      const result = TransferEligibilityRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.message).toContain("GPA of 1.80");
      expect(result.message).toContain("70 transfer credits");
    });
  });

  describe("Mock Data Testing", () => {
    const perfectStudent: StudentRecord = {
      studentId: "PERFECT-001",
      name: "Perfect Student",
      gpa: 4.0,
      completedCredits: 54,
      currentCredits: 12,
      academicYear: 2,
      academicStanding: "good",
      transferCredits: 30,
    };

    const failingStudent: StudentRecord = {
      studentId: "FAIL-001",
      name: "Failing Student",
      gpa: 1.5,
      completedCredits: 70,
      currentCredits: 10,
      academicYear: 3,
      academicStanding: "suspension",
      transferCredits: 70,
    };

    it("perfect student should pass transfer eligibility", () => {
      const result = TransferEligibilityRule.evaluate(perfectStudent);
      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(4.0);
    });

    it("failing student should fail transfer eligibility", () => {
      const result = TransferEligibilityRule.evaluate(failingStudent);
      expect(result.passed).toBe(false);
      expect(result.message).toContain("GPA of 1.50");
      expect(result.message).toContain("70 transfer credits");
      expect(result.message).toContain("Only 10 credits");
    });
  });
});
