import { describe, it, expect } from "@jest/globals";
import {
  CumulativeGPACalculator,
  type CourseGradeInfo,
} from "../src/gpa/cumulative-gpa";

describe("Cumulative GPA Calculator", () => {
  describe("Basic GPA Calculation", () => {
    it("should calculate GPA for standard grades", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
        { courseId: "ENGL101", credits: 3, grade: 3.0 },
        { courseId: "HIST101", credits: 3, grade: 2.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses);

      expect(result.gpa).toBe(3.0);
      expect(result.qualityPoints).toBe(27.0);
      expect(result.totalCredits).toBe(9);
      expect(result.coursesEvaluated).toBe(3);
    });

    it("should handle empty course list", () => {
      const courses: CourseGradeInfo[] = [];
      const result = CumulativeGPACalculator.calculate(courses);

      expect(result.gpa).toBe(0.0);
      expect(result.qualityPoints).toBe(0.0);
      expect(result.totalCredits).toBe(0);
      expect(result.coursesEvaluated).toBe(0);
    });

    it("should round to 2 decimal places by default", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
        { courseId: "ENGL101", credits: 2, grade: 3.0 },
        { courseId: "HIST101", credits: 4, grade: 2.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses);
      const expectedGPA = (3 * 4.0 + 2 * 3.0 + 4 * 2.0) / 9;

      expect(result.gpa).toBe(parseFloat(expectedGPA.toFixed(2)));
    });

    it("should support custom rounding places", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
        { courseId: "ENGL101", credits: 3, grade: 3.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses, {
        roundingPlaces: 3,
      });
      expect(result.gpa).toBe(3.5);
    });
  });

  describe("Quality Points Calculation", () => {
    it("should calculate quality points correctly", () => {
      const qualityPoints = CumulativeGPACalculator.calculateQualityPoints(
        4.0,
        3,
      );
      expect(qualityPoints).toBe(12.0);
    });

    it("should calculate quality points for failing grade", () => {
      const qualityPoints = CumulativeGPACalculator.calculateQualityPoints(
        0.0,
        3,
      );
      expect(qualityPoints).toBe(0.0);
    });
  });

  describe("Letter to Numeric Conversion", () => {
    it("should convert A to 4.0", () => {
      const numeric = CumulativeGPACalculator.letterToNumeric("A");
      expect(numeric).toBe(4.0);
    });

    it("should convert B to 3.0", () => {
      const numeric = CumulativeGPACalculator.letterToNumeric("B");
      expect(numeric).toBe(3.0);
    });

    it("should convert C to 2.0", () => {
      const numeric = CumulativeGPACalculator.letterToNumeric("C");
      expect(numeric).toBe(2.0);
    });

    it("should convert D to 1.0", () => {
      const numeric = CumulativeGPACalculator.letterToNumeric("D");
      expect(numeric).toBe(1.0);
    });

    it("should convert F to 0.0", () => {
      const numeric = CumulativeGPACalculator.letterToNumeric("F");
      expect(numeric).toBe(0.0);
    });

    it("should handle lowercase input", () => {
      expect(CumulativeGPACalculator.letterToNumeric("a")).toBe(4.0);
      expect(CumulativeGPACalculator.letterToNumeric("b")).toBe(3.0);
    });

    it("should handle invalid grades", () => {
      expect(CumulativeGPACalculator.letterToNumeric("E")).toBe(0.0);
      expect(CumulativeGPACalculator.letterToNumeric("X")).toBe(0.0);
    });
  });

  describe("Pass/Fail Handling", () => {
    it("should exclude pass/fail courses by default", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
        {
          courseId: "PE101",
          credits: 1,
          grade: 0.0,
          isPassFail: true,
          passed: true,
        },
        { courseId: "ENGL101", credits: 3, grade: 3.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses);

      expect(result.gpa).toBe(3.5);
      expect(result.totalCredits).toBe(6);
      expect(result.details?.passFailCourses).toBe(1);
    });

    it("should include pass/fail courses when specified", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
        {
          courseId: "PE101",
          credits: 1,
          grade: 0.0,
          isPassFail: true,
          passed: true,
        },
        { courseId: "ENGL101", credits: 3, grade: 3.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses, {
        includePassFail: true,
      });

      expect(result.totalCredits).toBe(7);
      expect(result.coursesEvaluated).toBe(3);
    });
  });

  describe("GPA Validation", () => {
    it("should validate GPA meets requirement", () => {
      const result = CumulativeGPACalculator.validateGPA(3.5, 3.0);
      expect(result.meetsRequirement).toBe(true);
      expect(result.difference).toBe(0.5);
    });

    it("should validate GPA below requirement", () => {
      const result = CumulativeGPACalculator.validateGPA(2.8, 3.0);
      expect(result.meetsRequirement).toBe(false);
      expect(result.difference).toBe(-0.2);
    });

    it("should validate GPA with tolerance", () => {
      const result = CumulativeGPACalculator.validateGPA(2.99, 3.0, 0.01);
      expect(result.meetsRequirement).toBe(true);
    });
  });

  describe("GPA Update", () => {
    it("should update GPA with new courses", () => {
      const currentGPA = 3.0;
      const currentCredits = 30;
      const newCourses: CourseGradeInfo[] = [
        { courseId: "MATH201", credits: 3, grade: 4.0 },
        { courseId: "ENGL201", credits: 3, grade: 3.0 },
      ];

      const result = CumulativeGPACalculator.updateGPA(
        currentGPA,
        currentCredits,
        newCourses,
      );

      expect(result.gpa).toBeGreaterThan(currentGPA);
      expect(result.totalCredits).toBe(36);
    });

    it("should handle update with zero current credits", () => {
      const currentGPA = 0.0;
      const currentCredits = 0;
      const newCourses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
      ];

      const result = CumulativeGPACalculator.updateGPA(
        currentGPA,
        currentCredits,
        newCourses,
      );

      expect(result.gpa).toBe(4.0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle all F grades", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 0.0 },
        { courseId: "ENGL101", credits: 3, grade: 0.0 },
        { courseId: "HIST101", credits: 3, grade: 0.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses);

      expect(result.gpa).toBe(0.0);
      expect(result.details?.failedCourses).toBe(3);
    });

    it("should handle all A grades", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 4.0 },
        { courseId: "ENGL101", credits: 3, grade: 4.0 },
        { courseId: "HIST101", credits: 3, grade: 4.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses);

      expect(result.gpa).toBe(4.0);
      expect(result.details?.passedCourses).toBe(3);
    });

    it("should handle D grades (passing)", () => {
      const courses: CourseGradeInfo[] = [
        { courseId: "MATH101", credits: 3, grade: 1.0 },
      ];

      const result = CumulativeGPACalculator.calculate(courses);

      expect(result.gpa).toBe(1.0);
      expect(result.details?.passedCourses).toBe(1);
    });
  });
});
