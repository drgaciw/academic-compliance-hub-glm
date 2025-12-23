import { describe, it, expect } from "@jest/globals";
import {
  GradeConversionTable,
  type PassFailConfig,
} from "../src/gpa/grade-conversion";

describe("Grade Conversion Table", () => {
  describe("Scale Retrieval", () => {
    it("should get standard scale", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(scale.name).toBe("Standard 4.0 Scale");
      expect(scale.type).toBe("standard");
      expect(scale.entries).toHaveLength(5);
    });

    it("should get plus/minus scale", () => {
      const scale = GradeConversionTable.getScale("plus-minus");

      expect(scale.name).toBe("Plus/Minus 4.0 Scale");
      expect(scale.type).toBe("plus-minus");
      expect(scale.entries.length).toBeGreaterThan(5);
    });

    it("should get percentage scale", () => {
      const scale = GradeConversionTable.getScale("percentage");

      expect(scale.name).toBe("Percentage Scale");
      expect(scale.type).toBe("percentage");
    });
  });

  describe("Letter to Numeric Conversion", () => {
    it("should convert standard grades", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.convertLetterToNumeric("A", scale)).toBe(4.0);
      expect(GradeConversionTable.convertLetterToNumeric("B", scale)).toBe(3.0);
      expect(GradeConversionTable.convertLetterToNumeric("C", scale)).toBe(2.0);
      expect(GradeConversionTable.convertLetterToNumeric("D", scale)).toBe(1.0);
      expect(GradeConversionTable.convertLetterToNumeric("F", scale)).toBe(0.0);
    });

    it("should convert plus/minus grades", () => {
      const scale = GradeConversionTable.getScale("plus-minus");

      expect(GradeConversionTable.convertLetterToNumeric("A", scale)).toBe(4.0);
      expect(GradeConversionTable.convertLetterToNumeric("A-", scale)).toBe(
        3.7,
      );
      expect(GradeConversionTable.convertLetterToNumeric("B+", scale)).toBe(
        3.3,
      );
      expect(GradeConversionTable.convertLetterToNumeric("B", scale)).toBe(3.0);
      expect(GradeConversionTable.convertLetterToNumeric("B-", scale)).toBe(
        2.7,
      );
    });

    it("should handle invalid grades", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.convertLetterToNumeric("E", scale)).toBe(0.0);
      expect(GradeConversionTable.convertLetterToNumeric("X", scale)).toBe(0.0);
    });
  });

  describe("Percentage to Letter Conversion", () => {
    it("should convert percentage to letter grade", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.convertPercentageToLetter(95, scale)).toBe(
        "A",
      );
      expect(GradeConversionTable.convertPercentageToLetter(85, scale)).toBe(
        "B",
      );
      expect(GradeConversionTable.convertPercentageToLetter(75, scale)).toBe(
        "C",
      );
      expect(GradeConversionTable.convertPercentageToLetter(65, scale)).toBe(
        "D",
      );
      expect(GradeConversionTable.convertPercentageToLetter(55, scale)).toBe(
        "F",
      );
    });

    it("should handle boundary percentages", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.convertPercentageToLetter(90, scale)).toBe(
        "A",
      );
      expect(GradeConversionTable.convertPercentageToLetter(89, scale)).toBe(
        "B",
      );
    });

    it("should handle out of range percentages", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.convertPercentageToLetter(110, scale)).toBe(
        "F",
      );
      expect(GradeConversionTable.convertPercentageToLetter(-5, scale)).toBe(
        "F",
      );
    });
  });

  describe("Percentage to Numeric Conversion", () => {
    it("should convert percentage to numeric grade", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.convertPercentageToNumeric(95, scale)).toBe(
        4.0,
      );
      expect(GradeConversionTable.convertPercentageToNumeric(85, scale)).toBe(
        3.0,
      );
      expect(GradeConversionTable.convertPercentageToNumeric(75, scale)).toBe(
        2.0,
      );
    });
  });

  describe("Custom Scale Creation", () => {
    it("should create custom scale", () => {
      const customScale = GradeConversionTable.createCustomScale(
        "Custom Scale",
        "standard",
        [
          {
            letterGrade: "A",
            numericValue: 5.0,
            minPercentage: 90,
            maxPercentage: 100,
          },
          {
            letterGrade: "B",
            numericValue: 4.0,
            minPercentage: 80,
            maxPercentage: 89,
          },
        ],
      );

      expect(customScale.name).toBe("Custom Scale");
      expect(customScale.type).toBe("standard");
      expect(customScale.entries).toHaveLength(2);
    });
  });

  describe("Passing Grade Validation", () => {
    it("should validate passing grades", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.isPassingGrade(4.0, scale)).toBe(true);
      expect(GradeConversionTable.isPassingGrade(3.0, scale)).toBe(true);
      expect(GradeConversionTable.isPassingGrade(2.0, scale)).toBe(true);
      expect(GradeConversionTable.isPassingGrade(1.0, scale)).toBe(true);
      expect(GradeConversionTable.isPassingGrade(0.0, scale)).toBe(false);
    });

    it("should validate passing percentages", () => {
      const scale = GradeConversionTable.getScale("standard");

      expect(GradeConversionTable.isPassingPercentage(90, scale)).toBe(true);
      expect(GradeConversionTable.isPassingPercentage(70, scale)).toBe(true);
      expect(GradeConversionTable.isPassingPercentage(59, scale)).toBe(false);
    });
  });

  describe("Grade Range Retrieval", () => {
    it("should get grade range", () => {
      const scale = GradeConversionTable.getScale("standard");

      const range = GradeConversionTable.getGradeRange("A", scale);

      expect(range).not.toBeNull();
      expect(range?.minPercentage).toBe(90);
      expect(range?.maxPercentage).toBe(100);
      expect(range?.numericValue).toBe(4.0);
    });

    it("should return null for invalid grade", () => {
      const scale = GradeConversionTable.getScale("standard");

      const range = GradeConversionTable.getGradeRange("E", scale);

      expect(range).toBeNull();
    });
  });

  describe("Get All Grades", () => {
    it("should return all grades from scale", () => {
      const scale = GradeConversionTable.getScale("standard");

      const grades = GradeConversionTable.getAllGrades(scale);

      expect(grades).toContain("A");
      expect(grades).toContain("B");
      expect(grades).toContain("C");
      expect(grades).toContain("D");
      expect(grades).toContain("F");
    });
  });

  describe("Get Passing Grades", () => {
    it("should return passing grades from scale", () => {
      const scale = GradeConversionTable.getScale("standard");

      const grades = GradeConversionTable.getPassingGrades(scale);

      expect(grades).toContain("A");
      expect(grades).toContain("B");
      expect(grades).toContain("C");
      expect(grades).toContain("D");
      expect(grades).not.toContain("F");
    });
  });

  describe("Pass/Fail Handling", () => {
    it("should handle pass grade with default config", () => {
      const config = GradeConversionTable.getDefaultPassFailConfig();
      const result = GradeConversionTable.handlePassFail("P", config);

      expect(result.numericValue).toBe(0.0);
      expect(result.countedForGPA).toBe(false);
      expect(result.countedForCredits).toBe(true);
      expect(result.passed).toBe(true);
    });

    it("should handle fail grade with default config", () => {
      const config = GradeConversionTable.getDefaultPassFailConfig();
      const result = GradeConversionTable.handlePassFail("F", config);

      expect(result.numericValue).toBe(0.0);
      expect(result.countedForGPA).toBe(false);
      expect(result.countedForCredits).toBe(false);
      expect(result.passed).toBe(false);
    });

    it("should use custom pass/fail config", () => {
      const config: PassFailConfig = {
        passGrade: "CR",
        passCredits: true,
        passCountForGPA: true,
        failGrade: "NC",
        failCredits: true,
        failCountForGPA: true,
      };

      const passResult = GradeConversionTable.handlePassFail("CR", config);
      expect(passResult.numericValue).toBe(4.0);
      expect(passResult.countedForGPA).toBe(true);
      expect(passResult.passed).toBe(true);

      const failResult = GradeConversionTable.handlePassFail("NC", config);
      expect(failResult.numericValue).toBe(0.0);
      expect(failResult.countedForGPA).toBe(true);
      expect(failResult.countedForCredits).toBe(true);
      expect(failResult.passed).toBe(false);
    });
  });
});
