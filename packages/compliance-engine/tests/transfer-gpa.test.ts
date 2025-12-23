import { describe, it, expect } from "@jest/globals";
import {
  TransferGPACalculator,
  type TransferCourse,
} from "../src/gpa/transfer-gpa";
import type { CourseGradeInfo } from "../src/gpa/cumulative-gpa";

describe("Transfer GPA Calculator", () => {
  const sampleTransferCourses: TransferCourse[] = [
    {
      courseId: "COMM101",
      credits: 3,
      grade: 4.0,
      institutionId: "COLL1",
      institutionName: "Community College 1",
      accepted: true,
    },
    {
      courseId: "HIST201",
      credits: 3,
      grade: 3.5,
      institutionId: "COLL1",
      institutionName: "Community College 1",
      accepted: true,
    },
    {
      courseId: "ENG201",
      credits: 3,
      grade: 2.5,
      institutionId: "COLL2",
      institutionName: "Community College 2",
      accepted: false,
    },
    {
      courseId: "MATH150",
      credits: 4,
      grade: 3.7,
      institutionId: "COLL2",
      institutionName: "Community College 2",
      accepted: true,
      transferCredits: 3,
    },
  ];

  const sampleInstitutionalCourses: CourseGradeInfo[] = [
    { courseId: "MATH101", credits: 4, grade: 3.8 },
    { courseId: "ENGL101", credits: 3, grade: 3.5 },
    { courseId: "CHEM101", credits: 4, grade: 3.2 },
  ];

  describe("Calculate Transfer GPA", () => {
    it("should calculate transfer GPA for accepted courses only", () => {
      const result = TransferGPACalculator.calculateTransferGPA(
        sampleTransferCourses,
      );

      expect(result.gpa).toBeCloseTo(3.73, 2);
      expect(result.acceptedCredits).toBe(9);
      expect(result.attemptedCredits).toBe(3);
      expect(result.coursesIncluded).toBe(3);
    });

    it("should include unaccepted courses when specified", () => {
      const result = TransferGPACalculator.calculateTransferGPA(
        sampleTransferCourses,
        { includeUnaccepted: true },
      );

      expect(result.coursesIncluded).toBe(4);
    });

    it("should use transfer credits when specified", () => {
      const result = TransferGPACalculator.calculateTransferGPA(
        sampleTransferCourses,
        { useTransferCredits: true },
      );

      expect(result.acceptedCredits).toBe(8);
    });
  });

  describe("Calculate Combined GPA", () => {
    it("should calculate combined GPA without override", () => {
      const result = TransferGPACalculator.calculateCombinedGPA(
        sampleInstitutionalCourses,
        sampleTransferCourses,
      );

      expect(result.institutionalGPA).toBeCloseTo(3.5, 2);
      expect(result.institutionalCredits).toBe(11);
      expect(result.transferGPA).toBeCloseTo(3.73, 2);
      expect(result.acceptedTransferCredits).toBe(9);
      expect(result.combinedGPA).toBeCloseTo(3.6, 2);
      expect(result.combinedCredits).toBe(20);
      expect(result.overrideApplied).toBe(false);
    });

    it("should apply institutional GPA override", () => {
      const result = TransferGPACalculator.calculateCombinedGPA(
        sampleInstitutionalCourses,
        sampleTransferCourses,
        [],
        { overrideInstitutionalGPA: true, overrideValue: 3.8 },
      );

      expect(result.institutionalGPA).toBe(3.8);
      expect(result.overrideApplied).toBe(true);
      expect(result.overrideValue).toBe(3.8);
    });
  });

  describe("Calculate Institutional GPA", () => {
    it("should calculate institutional GPA", () => {
      const result = TransferGPACalculator.calculateInstitutionalGPA(
        sampleInstitutionalCourses,
      );

      expect(result.gpa).toBeCloseTo(3.5, 2);
      expect(result.credits).toBe(11);
      expect(result.coursesEvaluated).toBe(3);
    });

    it("should handle empty institutional courses", () => {
      const result = TransferGPACalculator.calculateInstitutionalGPA([]);

      expect(result.gpa).toBe(0.0);
      expect(result.credits).toBe(0);
      expect(result.coursesEvaluated).toBe(0);
    });
  });

  describe("Filter Transfer Courses by Institution", () => {
    it("should filter courses by institution ID", () => {
      const filtered = TransferGPACalculator.filterTransferCoursesByInstitution(
        sampleTransferCourses,
        "COLL1",
      );

      expect(filtered.length).toBe(2);
      expect(filtered.every((c) => c.institutionId === "COLL1")).toBe(true);
    });
  });

  describe("Get Transfer Credit Summary", () => {
    it("should provide transfer credit summary", () => {
      const summary = TransferGPACalculator.getTransferCreditSummary(
        sampleTransferCourses,
      );

      expect(summary.totalCourses).toBe(4);
      expect(summary.acceptedCourses).toBe(3);
      expect(summary.rejectedCourses).toBe(1);
      expect(summary.acceptedCredits).toBe(9);
      expect(summary.rejectedCredits).toBe(3);
      expect(summary.acceptanceRate).toBe(0.75);
    });

    it("should handle empty transfer courses", () => {
      const summary = TransferGPACalculator.getTransferCreditSummary([]);

      expect(summary.totalCourses).toBe(0);
      expect(summary.acceptedCourses).toBe(0);
      expect(summary.rejectedCourses).toBe(0);
      expect(summary.acceptanceRate).toBe(0);
    });
  });

  describe("Apply Override Rule", () => {
    it("should apply replace override", () => {
      const rule = {
        overrideType: "replace" as const,
        overrideValue: 3.5,
      };

      const result = TransferGPACalculator.applyOverrideRule(3.0, rule);

      expect(result.newGPA).toBe(3.5);
      expect(result.ruleApplied).toBe(true);
      expect(result.reason).toContain("replaced");
    });

    it("should apply ignore override", () => {
      const rule = {
        overrideType: "ignore" as const,
      };

      const result = TransferGPACalculator.applyOverrideRule(3.5, rule);

      expect(result.newGPA).toBe(0.0);
      expect(result.ruleApplied).toBe(true);
      expect(result.reason).toContain("ignored");
    });

    it("should apply minimum override when below minimum", () => {
      const rule = {
        overrideType: "minimum" as const,
        overrideValue: 3.0,
      };

      const result = TransferGPACalculator.applyOverrideRule(2.5, rule);

      expect(result.newGPA).toBe(3.0);
      expect(result.ruleApplied).toBe(true);
      expect(result.reason).toContain("raised to minimum");
    });

    it("should not apply minimum override when above minimum", () => {
      const rule = {
        overrideType: "minimum" as const,
        overrideValue: 3.0,
      };

      const result = TransferGPACalculator.applyOverrideRule(3.5, rule);

      expect(result.newGPA).toBe(3.5);
      expect(result.ruleApplied).toBe(false);
      expect(result.reason).toContain("above minimum");
    });
  });
});
