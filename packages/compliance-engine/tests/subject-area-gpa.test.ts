import { describe, it, expect } from "@jest/globals";
import {
  SubjectAreaGPACalculator,
  type CourseWithSubject,
} from "../src/gpa/subject-area-gpa";

describe("Subject-Area GPA Calculator", () => {
  const sampleCourses: CourseWithSubject[] = [
    {
      courseId: "MATH101",
      credits: 3,
      grade: 4.0,
      subjectCode: "MATH",
      subjectName: "Mathematics",
      isCore: true,
    },
    {
      courseId: "MATH201",
      credits: 3,
      grade: 3.7,
      subjectCode: "MATH",
      subjectName: "Mathematics",
      isCore: true,
    },
    {
      courseId: "ENGL101",
      credits: 3,
      grade: 3.3,
      subjectCode: "ENGL",
      subjectName: "English",
      isCore: true,
    },
    {
      courseId: "ENGL201",
      credits: 3,
      grade: 3.0,
      subjectCode: "ENGL",
      subjectName: "English",
      isCore: false,
    },
    {
      courseId: "PHYS101",
      credits: 4,
      grade: 2.7,
      subjectCode: "PHYS",
      subjectName: "Physics",
      isCore: true,
    },
  ];

  describe("Calculate Subject GPA", () => {
    it("should calculate GPA for a specific subject", () => {
      const result = SubjectAreaGPACalculator.calculateSubjectGPA(
        sampleCourses,
        "MATH",
      );

      expect(result.subjectCode).toBe("MATH");
      expect(result.subjectName).toBe("Mathematics");
      expect(result.gpa).toBe(3.85);
      expect(result.totalCredits).toBe(6);
      expect(result.coursesEvaluated).toBe(2);
    });

    it("should handle empty courses for a subject", () => {
      const result = SubjectAreaGPACalculator.calculateSubjectGPA(
        sampleCourses,
        "CHEM",
      );

      expect(result.subjectCode).toBe("CHEM");
      expect(result.gpa).toBe(0.0);
      expect(result.totalCredits).toBe(0);
      expect(result.coursesEvaluated).toBe(0);
    });

    it("should filter only core courses when specified", () => {
      const result = SubjectAreaGPACalculator.calculateSubjectGPA(
        sampleCourses,
        "ENGL",
        { includeCore: true, includeElectives: false },
      );

      expect(result.gpa).toBe(3.3);
      expect(result.totalCredits).toBe(3);
    });

    it("should filter only elective courses when specified", () => {
      const result = SubjectAreaGPACalculator.calculateSubjectGPA(
        sampleCourses,
        "ENGL",
        { includeCore: false, includeElectives: true },
      );

      expect(result.gpa).toBe(3.0);
      expect(result.totalCredits).toBe(3);
    });
  });

  describe("Calculate All Subjects", () => {
    it("should calculate GPA for all subjects", () => {
      const results =
        SubjectAreaGPACalculator.calculateAllSubjects(sampleCourses);

      expect(results.length).toBe(3);
      expect(results[0].subjectCode).toBe("ENGL");
      expect(results[1].subjectCode).toBe("MATH");
      expect(results[2].subjectCode).toBe("PHYS");
    });

    it("should apply minimum requirements", () => {
      const minimumRequirements = {
        MATH: 3.5,
        ENGL: 3.0,
        PHYS: 2.5,
      };

      const results = SubjectAreaGPACalculator.calculateAllSubjects(
        sampleCourses,
        minimumRequirements,
      );

      const mathResult = results.find((r) => r.subjectCode === "MATH");
      if (mathResult) {
        expect(mathResult.minimumRequired).toBe(3.5);
        expect(mathResult.meetsMinimum).toBe(true);
      }

      const physResult = results.find((r) => r.subjectCode === "PHYS");
      if (physResult) {
        expect(physResult.minimumRequired).toBe(2.5);
        expect(physResult.meetsMinimum).toBe(true);
      }
    });
  });

  describe("Validate Subject GPA", () => {
    it("should validate subject GPA meets minimum", () => {
      const result = SubjectAreaGPACalculator.validateSubjectGPA(
        sampleCourses,
        "MATH",
        3.5,
      );

      expect(result.currentGPA).toBe(3.85);
      expect(result.minimumRequired).toBe(3.5);
      expect(result.passes).toBe(true);
      expect(result.difference).toBe(0.35);
      expect(result.remediationNeeded).toBe(false);
    });

    it("should validate subject GPA below minimum", () => {
      const result = SubjectAreaGPACalculator.validateSubjectGPA(
        sampleCourses,
        "PHYS",
        3.0,
      );

      expect(result.currentGPA).toBe(2.7);
      expect(result.minimumRequired).toBe(3.0);
      expect(result.passes).toBe(false);
      expect(result.difference).toBe(-0.3);
      expect(result.remediationNeeded).toBe(true);
    });
  });

  describe("Validate All Subjects", () => {
    it("should validate all subjects with minimum requirements", () => {
      const minimumRequirements = {
        MATH: 3.5,
        ENGL: 3.0,
        PHYS: 3.0,
      };

      const results = SubjectAreaGPACalculator.validateAllSubjects(
        sampleCourses,
        minimumRequirements,
      );

      expect(results.length).toBe(3);
      expect(results[0]?.passes).toBe(true);
      expect(results[1]?.passes).toBe(true);
      expect(results[2]?.passes).toBe(false);
    });
  });

  describe("Filter Courses by Subject", () => {
    it("should filter courses by subject codes", () => {
      const filtered = SubjectAreaGPACalculator.filterCoursesBySubject(
        sampleCourses,
        ["MATH", "PHYS"],
      );

      expect(filtered.length).toBe(3);
      expect(
        filtered.every(
          (c) => c.subjectCode === "MATH" || c.subjectCode === "PHYS",
        ),
      ).toBe(true);
    });
  });

  describe("Get Subject Credits", () => {
    it("should return subject credit breakdown", () => {
      const result = SubjectAreaGPACalculator.getSubjectCredits(
        sampleCourses,
        "MATH",
      );

      expect(result.totalCredits).toBe(6);
      expect(result.earnedCredits).toBe(6);
      expect(result.coreCredits).toBe(6);
      expect(result.electiveCredits).toBe(0);
    });

    it("should return correct breakdown for mixed core/elective", () => {
      const result = SubjectAreaGPACalculator.getSubjectCredits(
        sampleCourses,
        "ENGL",
      );

      expect(result.totalCredits).toBe(6);
      expect(result.earnedCredits).toBe(6);
      expect(result.coreCredits).toBe(3);
      expect(result.electiveCredits).toBe(3);
    });
  });
});
