import { describe, it, expect } from "@jest/globals";
import { CoreCoursesRule } from "../src/rules/core-courses";
import type { StudentRecord } from "../src/rules/types";

describe("CoreCoursesRule - Bylaw 14.3", () => {
  describe("Boundary Tests - Exact Threshold Values", () => {
    it("should pass with exactly 16 core course credits", () => {
      const student: StudentRecord = {
        studentId: "001",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 30,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "good",
        coreCourseCredits: 16,
      };
      const result = CoreCoursesRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(16);
      expect(result.details.requiredValue).toBe(16);
      expect(result.bylawReference).toBe("14.3");
    });

    it("should pass with 20 core course credits", () => {
      const student: StudentRecord = {
        studentId: "002",
        name: "Test Student",
        gpa: 3.5,
        completedCredits: 45,
        currentCredits: 6,
        academicYear: 2,
        academicStanding: "good",
        coreCourseCredits: 20,
      };
      const result = CoreCoursesRule.evaluate(student);

      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(20);
    });
  });

  describe("Below Threshold Tests", () => {
    it("should fail with 15 core course credits", () => {
      const student: StudentRecord = {
        studentId: "003",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 30,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "good",
        coreCourseCredits: 15,
      };
      const result = CoreCoursesRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(15);
      expect(result.details.requiredValue).toBe(16);
      expect(result.remediation).toBeDefined();
    });

    it("should fail with 0 core course credits", () => {
      const student: StudentRecord = {
        studentId: "004",
        name: "Test Student",
        gpa: 2.0,
        completedCredits: 30,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "probation",
        coreCourseCredits: 0,
      };
      const result = CoreCoursesRule.evaluate(student);

      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(0);
      expect(result.details.requiredValue).toBe(16);
    });
  });

  describe("Core Course Categories", () => {
    it("should pass with all required categories at threshold", () => {
      const student: StudentRecord = {
        studentId: "005",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 30,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "good",
        coreCourseCredits: 16,
      };
      const coreCategories = {
        ENGLISH: 4,
        MATH: 3,
        SCIENCE: 2,
        SOCIAL_STUDIES: 2,
        ADDITIONAL: 5,
      };
      const result = CoreCoursesRule.evaluateCoreCategories(student, coreCategories);

      expect(result.passed).toBe(true);
      expect(result.message).toContain("All core course category requirements are met");
    });

    it("should fail when English category is below requirement", () => {
      const student: StudentRecord = {
        studentId: "006",
        name: "Test Student",
        gpa: 3.0,
        completedCredits: 30,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "good",
        coreCourseCredits: 15,
      };
      const coreCategories = {
        ENGLISH: 3,
        MATH: 3,
        SCIENCE: 2,
        SOCIAL_STUDIES: 2,
        ADDITIONAL: 5,
      };
      const result = CoreCoursesRule.evaluateCoreCategories(student, coreCategories);

      expect(result.passed).toBe(false);
      expect(result.message).toContain("english: 3/4 credits");
      expect(result.remediation).toBeDefined();
    });

    it("should fail with multiple category violations", () => {
      const student: StudentRecord = {
        studentId: "007",
        name: "Test Student",
        gpa: 2.5,
        completedCredits: 30,
        currentCredits: 6,
        academicYear: 1,
        academicStanding: "warning",
        coreCourseCredits: 12,
      };
      const coreCategories = {
        ENGLISH: 3,
        MATH: 2,
        SCIENCE: 1,
        SOCIAL_STUDIES: 2,
        ADDITIONAL: 4,
      };
      const result = CoreCoursesRule.evaluateCoreCategories(student, coreCategories);

      expect(result.passed).toBe(false);
      expect(result.remediation?.length).toBe(4);
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
      coreCourseCredits: 24,
    };

    const failingStudent: StudentRecord = {
      studentId: "FAIL-001",
      name: "Failing Student",
      gpa: 1.5,
      completedCredits: 30,
      currentCredits: 6,
      academicYear: 1,
      academicStanding: "suspension",
      coreCourseCredits: 8,
    };

    it("perfect student should pass core course requirements", () => {
      const result = CoreCoursesRule.evaluate(perfectStudent);
      expect(result.passed).toBe(true);
      expect(result.details.currentValue).toBe(24);
    });

    it("failing student should fail core course requirements", () => {
      const result = CoreCoursesRule.evaluate(failingStudent);
      expect(result.passed).toBe(false);
      expect(result.details.currentValue).toBe(8);
      expect(result.remediation?.[0]).toContain("8 additional");
    });
  });
});
