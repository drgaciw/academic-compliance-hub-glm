import { describe, it, expect } from "@jest/globals";
import { GPACalculator, type CourseGrade } from "../src/rules/gpa-calculator";
import type { StudentRecord } from "../src/rules/types";
import type { GPACalculationResult } from "../src/rules/gpa-calculator";

describe("Letter to Numeric Grade Conversion", () => {
  it("should convert 'A' to 4.0", () => {
    expect(GPACalculator.letterToNumeric("A")).toBe(4.0);
  });

  it("should convert 'B' to 3.0", () => {
    expect(GPACalculator.letterToNumeric("B")).toBe(3.0);
  });

  it("should convert 'C' to 2.0", () => {
    expect(GPACalculator.letterToNumeric("C")).toBe(2.0);
  });

  it("should convert 'F' to 0.0", () => {
    expect(GPACalculator.letterToNumeric("F")).toBe(0.0);
  });

  it("should handle lowercase letter grades", () => {
    expect(GPACalculator.letterToNumeric("a")).toBe(4.0);
    expect(GPACalculator.letterToNumeric("b")).toBe(3.0);
  });

  it("should return 0.0 for invalid letter grades", () => {
    expect(GPACalculator.letterToNumeric("E")).toBe(0.0);
    expect(GPACalculator.letterToNumeric("X")).toBe(0.0);
  });
});

describe("GPA Calculation from Numeric Grades", () => {
  it("should calculate GPA for empty course list", () => {
    const courses: CourseGrade[] = [];
    const result = GPACalculator.calculate(courses);

    expect(result.gpa).toBe(0.0);
    expect(result.qualityPoints).toBe(0.0);
    expect(result.totalCredits).toBe(0);
    expect(result.coursesEvaluated).toBe(0);
  });

  it("should calculate GPA for single course", () => {
    const courses: CourseGrade[] = [
      { courseId: "MATH101", credits: 3, grade: 4.0 },
    ];
    const result = GPACalculator.calculate(courses);

    expect(result.gpa).toBe(4.0);
    expect(result.qualityPoints).toBe(12.0);
    expect(result.totalCredits).toBe(3);
  });

  it("should calculate GPA for multiple courses with varying grades", () => {
    const courses: CourseGrade[] = [
      { courseId: "MATH101", credits: 3, grade: 4.0 },
      { courseId: "ENGL101", credits: 3, grade: 3.0 },
      { courseId: "HIST101", credits: 3, grade: 2.0 },
    ];
    const result = GPACalculator.calculate(courses);

    expect(result.gpa).toBe(3.0);
    expect(result.qualityPoints).toBe(27.0);
    expect(result.totalCredits).toBe(9);
  });

  it("should handle failing grades correctly", () => {
    const courses: CourseGrade[] = [
      { courseId: "MATH101", credits: 3, grade: 0.0 },
      { courseId: "ENGL101", credits: 3, grade: 4.0 },
      { courseId: "HIST101", credits: 3, grade: 3.0 },
    ];
    const result = GPACalculator.calculate(courses);

    expect(result.gpa).toBeCloseTo(2.333, 3);
    expect(result.qualityPoints).toBe(21.0);
  });
});

describe("GPA Calculation from Letter Grades", () => {
  it("should calculate GPA from letter grades", () => {
    const letterCourses = [
      { courseId: "MATH101", credits: 3, grade: "A" },
      { courseId: "ENGL101", credits: 3, grade: "B" },
      { courseId: "HIST101", credits: 3, grade: "C" },
    ];
    const result = GPACalculator.calculateFromLetterGrades(letterCourses);

    expect(result.gpa).toBe(3.0);
    expect(result.qualityPoints).toBe(27.0);
  });

  it("should handle F grades correctly", () => {
    const letterCourses = [
      { courseId: "MATH101", credits: 3, grade: "A" },
      { courseId: "ENGL101", credits: 3, grade: "F" },
      { courseId: "HIST101", credits: 3, grade: "B" },
    ];
    const result = GPACalculator.calculateFromLetterGrades(letterCourses);

    const expectedGPA = (3 * 4.0 + 3 * 0.0 + 3 * 3.0) / 9;
    expect(result.gpa).toBeCloseTo(expectedGPA, 3);
  });
});

describe("GPA Update Calculation", () => {
  it("should update GPA correctly with existing credits", () => {
    const currentGPA = 3.5;
    const currentCredits = 30;
    const newCourses: CourseGrade[] = [
      { courseId: "MATH201", credits: 3, grade: 4.0 },
      { courseId: "ENGL201", credits: 3, grade: 3.0 },
    ];
    const newGPA = GPACalculator.updateGPA(
      currentGPA,
      currentCredits,
      newCourses,
    );

    const currentQualityPoints = currentGPA * currentCredits;
    const newQualityPoints = 3 * 4.0 + 3 * 3.0;
    const expectedGPA =
      (currentQualityPoints + newQualityPoints) / (currentCredits + 6);
    expect(newGPA).toBeCloseTo(expectedGPA, 3);
  });

  it("should handle improvement in GPA", () => {
    const currentGPA = 2.5;
    const currentCredits = 30;
    const newCourses: CourseGrade[] = [
      { courseId: "MATH201", credits: 3, grade: 4.0 },
      { courseId: "ENGL201", credits: 3, grade: 4.0 },
    ];
    const newGPA = GPACalculator.updateGPA(
      currentGPA,
      currentCredits,
      newCourses,
    );

    expect(newGPA).toBeGreaterThan(currentGPA);
  });
});

describe("GPA Prediction", () => {
  it("should predict needed GPA to achieve target", () => {
    const currentGPA = 2.5;
    const currentCredits = 30;
    const targetGPA = 3.0;
    const remainingCredits = 30;

    const prediction = GPACalculator.predictGPA(
      currentGPA,
      currentCredits,
      targetGPA,
      remainingCredits,
    );

    expect(prediction.neededGPA).toBeCloseTo(3.5, 3);
    expect(prediction.achievable).toBe(false);
  });

  it("should identify unachievable target GPA", () => {
    const currentGPA = 2.0;
    const currentCredits = 90;
    const targetGPA = 3.5;
    const remainingCredits = 30;

    const prediction = GPACalculator.predictGPA(
      currentGPA,
      currentCredits,
      targetGPA,
      remainingCredits,
    );

    expect(prediction.neededGPA).toBeGreaterThan(4.0);
    expect(prediction.achievable).toBe(false);
  });
});

describe("Mock Data Testing - Student Scenarios", () => {
  const perfectStudentCourses: CourseGrade[] = [
    { courseId: "MATH101", credits: 4, grade: 4.0 },
    { courseId: "ENGL101", credits: 3, grade: 4.0 },
    { courseId: "PHYS101", credits: 4, grade: 4.0 },
    { courseId: "CHEM101", credits: 4, grade: 4.0 },
    { courseId: "HIST101", credits: 3, grade: 4.0 },
  ];

  const failingStudentCourses: CourseGrade[] = [
    { courseId: "MATH101", credits: 4, grade: 0.0 },
    { courseId: "ENGL101", credits: 3, grade: 1.0 },
    { courseId: "PHYS101", credits: 4, grade: 0.0 },
    { courseId: "CHEM101", credits: 4, grade: 1.0 },
    { courseId: "HIST101", credits: 3, grade: 1.0 },
  ];

  it("perfect student should have 4.0 GPA", () => {
    const result = GPACalculator.calculate(perfectStudentCourses);
    expect(result.gpa).toBe(4.0);
    expect(result.totalCredits).toBe(18);
    expect(result.qualityPoints).toBe(72.0);
  });

  it("failing student should have low GPA", () => {
    const result = GPACalculator.calculate(failingStudentCourses);
    expect(result.gpa).toBeCloseTo(0.556, 3);
    expect(result.totalCredits).toBe(18);
  });

  it("should predict needed GPA for failing student to reach 2.0", () => {
    const currentGPA = GPACalculator.calculate(failingStudentCourses).gpa;
    const currentCredits = 18;
    const targetGPA = 2.0;
    const remainingCredits = 12;

    const prediction = GPACalculator.predictGPA(
      currentGPA,
      currentCredits,
      targetGPA,
      remainingCredits,
    );
    expect(prediction.achievable).toBe(false);
    expect(prediction.neededGPA).toBeGreaterThan(4.0);
  });
});
