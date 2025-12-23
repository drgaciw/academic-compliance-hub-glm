const ConfidenceScorer = require("../src/confidence-scorer");

describe("ConfidenceScorer", () => {
  let scorer;

  beforeEach(() => {
    scorer = new ConfidenceScorer();
  });

  afterEach(() => {
    scorer = null;
  });

  describe("calculateOverall", () => {
    test("should calculate overall confidence from OCR result", () => {
      const ocrResult = {
        confidence: 95,
        text: "Sample text with sufficient content for proper extraction",
        words: [{ confidence: 95 }, { confidence: 90 }],
        lines: [{ confidence: 95 }, { confidence: 92 }],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.overall).toBe(95);
      expect(result.wordConfidence).toBe(92.5);
      expect(result.lineConfidence).toBe(93.5);
      expect(result.quality).toBe("high");
      expect(result.issues).toBeDefined();
    });

    test("should handle null OCR result", () => {
      const result = scorer.calculateOverall(null);

      expect(result.overall).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.wordConfidence).toBe(0);
      expect(result.lineConfidence).toBe(0);
      expect(result.quality).toBe("very_low");
      expect(result.issues).toContain("No OCR result provided");
    });

    test("should handle undefined OCR result", () => {
      const result = scorer.calculateOverall(undefined);

      expect(result.overall).toBe(0);
      expect(result.issues).toContain("No OCR result provided");
    });

    test("should handle OCR result with no words", () => {
      const ocrResult = {
        confidence: 70,
        text: "Sample",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.wordConfidence).toBe(0);
      expect(result.lineConfidence).toBe(0);
    });

    test("should handle OCR result with no confidence field", () => {
      const ocrResult = {
        text: "Sample",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.overall).toBe(0);
    });

    test("should identify insufficient text issue", () => {
      const ocrResult = {
        confidence: 50,
        text: "Short",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.issues).toContain("Insufficient text extracted");
    });

    test("should identify very low confidence issue", () => {
      const ocrResult = {
        confidence: 30,
        text: "Sample text here",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.issues).toContain("Very low overall confidence");
    });

    test("should identify high proportion of low-confidence words", () => {
      const ocrResult = {
        confidence: 60,
        text: "Sample text",
        words: [
          { confidence: 45 },
          { confidence: 40 },
          { confidence: 95 },
          { confidence: 40 },
        ],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.issues).toContain(
        "High proportion of low-confidence words",
      );
    });

    test("should identify PDF table extraction artifacts", () => {
      const ocrResult = {
        confidence: 70,
        text: "Sample │ text ┤ with ┤ artifacts ─││││││",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.issues.some((i) => i.includes("PDF table"))).toBe(true);
    });
  });

  describe("calculateFieldConfidence", () => {
    test("should calculate confidence for all fields", () => {
      const extractedData = {
        studentName: "John Smith",
        studentId: "123456",
        gpa: 3.75,
        totalCredits: 120,
        courses: [
          { code: "CS1010", name: "Programming", grade: "A", credits: 4.0 },
        ],
      };

      const ocrText = global.testData.sampleTranscriptText;

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields).toBeDefined();
      expect(result.fields.studentName).toBeGreaterThan(0);
      expect(result.fields.studentId).toBeGreaterThan(0);
      expect(result.fields.gpa).toBeGreaterThan(0);
      expect(result.fields.totalCredits).toBeGreaterThan(0);
      expect(result.fields.courses).toHaveLength(1);
      expect(result.average).toBeGreaterThan(0);
      expect(result.quality).toBeDefined();
    });

    test("should give higher confidence for fields found multiple times", () => {
      const extractedData = {
        studentName: "John Smith",
        studentId: "123456",
        gpa: 3.75,
        totalCredits: 120,
        courses: [],
      };

      const ocrText = `
        Student Name: John Smith
        Student ID: 123456
        GPA: 3.75
        Total Credits: 120
        John Smith appears again
        123456 appears again
      `;

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.studentName).toBe(95);
      expect(result.fields.studentId).toBe(95);
    });

    test("should give lower confidence for derived fields", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: 3.75,
        totalCredits: 120,
        courses: [],
      };

      const ocrText = "GPA: 3.75\nTotal Credits: 120";

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.gpa).toBeLessThan(95);
      expect(result.fields.totalCredits).toBeLessThan(95);
    });

    test("should return zero confidence for null fields", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [],
      };

      const ocrText = "Sample text";

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.studentName).toBe(0);
      expect(result.fields.studentId).toBe(0);
      expect(result.fields.gpa).toBe(0);
      expect(result.fields.totalCredits).toBe(0);
    });

    test("should calculate course confidence", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [
          { code: "CS1010", name: "Programming", grade: "A", credits: 4.0 },
        ],
      };

      const ocrText = "CS1010  Introduction to Programming  A  4.0";

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.courses[0].confidence).toBeGreaterThan(0);
      expect(result.fields.courses[0]).toHaveProperty("confidence");
    });

    test("should give higher confidence for complete course entries", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [
          {
            code: "CS1010",
            name: "Introduction to Programming",
            grade: "A",
            credits: 4.0,
          },
        ],
      };

      const ocrText = `
        CS1010  Introduction to Programming  A  4.0
        CS1010 appears again in another context
        Introduction to Programming appears again
        A grade appears multiple times A
      `;

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.courses[0].confidence).toBeGreaterThan(80);
    });
  });

  describe("calculateFieldConfidence - Edge Cases", () => {
    test("should handle empty extracted data", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [],
      };

      const result = scorer.calculateFieldConfidence(extractedData, "");

      expect(result.fields.studentName).toBe(0);
      expect(result.fields.studentId).toBe(0);
      expect(result.fields.gpa).toBe(0);
      expect(result.fields.totalCredits).toBe(0);
      expect(result.average).toBe(0);
    });

    test("should handle null OCR text", () => {
      const extractedData = {
        studentName: "John",
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [],
      };

      const result = scorer.calculateFieldConfidence(extractedData, null);

      // Should give low confidence when can't verify against OCR text
      expect(result.fields.studentName).toBe(50);
    });

    test("should handle course with missing fields", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [{ code: "CS1010", name: null, grade: null, credits: null }],
      };

      const ocrText = "CS1010";

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.courses[0].confidence).toBeGreaterThan(0);
    });

    test("should handle numeric values correctly", () => {
      const extractedData = {
        studentName: null,
        studentId: null,
        gpa: 3.75,
        totalCredits: 120,
        courses: [],
      };

      const result = scorer.calculateFieldConfidence(
        extractedData,
        "GPA: 3.75\nCredits: 120",
      );

      expect(result.fields.gpa).toBeGreaterThan(0);
      expect(result.fields.totalCredits).toBeGreaterThan(0);
    });
  });

  describe("meetsThreshold", () => {
    test("should return true for high threshold with high confidence", () => {
      expect(scorer.meetsThreshold(95, "high")).toBe(true);
    });

    test("should return false for high threshold with medium confidence", () => {
      expect(scorer.meetsThreshold(80, "high")).toBe(false);
    });

    test("should return true for medium threshold with medium confidence", () => {
      expect(scorer.meetsThreshold(75, "medium")).toBe(true);
    });

    test("should return false for medium threshold with low confidence", () => {
      expect(scorer.meetsThreshold(60, "medium")).toBe(false);
    });

    test("should return true for low threshold with low confidence", () => {
      expect(scorer.meetsThreshold(55, "low")).toBe(true);
    });

    test("should return false for low threshold with very low confidence", () => {
      expect(scorer.meetsThreshold(40, "low")).toBe(false);
    });

    test("should use default medium threshold for invalid type", () => {
      expect(scorer.meetsThreshold(75, "invalid")).toBe(true);
    });

    test("should respect custom thresholds", () => {
      const customScorer = new ConfidenceScorer({
        highThreshold: 95,
        mediumThreshold: 80,
        lowThreshold: 60,
      });

      expect(customScorer.meetsThreshold(90, "high")).toBe(false);
      expect(customScorer.meetsThreshold(85, "medium")).toBe(true);
      expect(customScorer.meetsThreshold(65, "low")).toBe(true);
    });
  });

  describe("getRecommendation", () => {
    test("should recommend accept for high confidence", () => {
      const recommendation = scorer.getRecommendation(95);

      expect(recommendation.action).toBe("accept");
      expect(recommendation.requiresReview).toBe(false);
      expect(recommendation.message).toContain("High confidence");
    });

    test("should recommend accept_with_review for medium confidence", () => {
      const recommendation = scorer.getRecommendation(80);

      expect(recommendation.action).toBe("accept_with_review");
      expect(recommendation.requiresReview).toBe(true);
      expect(recommendation.message).toContain("Medium confidence");
    });

    test("should recommend reject for low confidence", () => {
      const recommendation = scorer.getRecommendation(60);

      expect(recommendation.action).toBe("reject");
      expect(recommendation.requiresReview).toBe(true);
      expect(recommendation.message).toContain("Low confidence");
    });

    test("should recommend reject for very low confidence", () => {
      const recommendation = scorer.getRecommendation(30);

      expect(recommendation.action).toBe("reject");
      expect(recommendation.requiresReview).toBe(true);
      expect(recommendation.message).toContain("Very low confidence");
    });

    test("should respect custom thresholds in recommendations", () => {
      const customScorer = new ConfidenceScorer({
        highThreshold: 95,
        mediumThreshold: 80,
        lowThreshold: 60,
      });

      const rec1 = customScorer.getRecommendation(90);
      const rec2 = customScorer.getRecommendation(85);
      const rec3 = customScorer.getRecommendation(65);

      expect(rec1.action).toBe("accept_with_review");
      expect(rec2.action).toBe("accept_with_review");
      expect(rec3.action).toBe("reject");
    });
  });

  describe("Quality Levels", () => {
    test("should return high quality for high confidence", () => {
      const ocrResult = {
        confidence: 95,
        text: "Sample",
        words: [],
        lines: [],
      };
      const result = scorer.calculateOverall(ocrResult);

      expect(result.quality).toBe("high");
    });

    test("should return medium quality for medium confidence", () => {
      const ocrResult = {
        confidence: 75,
        text: "Sample",
        words: [],
        lines: [],
      };
      const result = scorer.calculateOverall(ocrResult);

      expect(result.quality).toBe("medium");
    });

    test("should return low quality for low confidence", () => {
      const ocrResult = {
        confidence: 55,
        text: "Sample",
        words: [],
        lines: [],
      };
      const result = scorer.calculateOverall(ocrResult);

      expect(result.quality).toBe("low");
    });

    test("should return very_low quality for very low confidence", () => {
      const ocrResult = {
        confidence: 40,
        text: "Sample",
        words: [],
        lines: [],
      };
      const result = scorer.calculateOverall(ocrResult);

      expect(result.quality).toBe("very_low");
    });
  });

  describe("Confidence Calculation Details", () => {
    test("should calculate word confidence correctly", () => {
      const ocrResult = {
        confidence: 80,
        text: "Sample",
        words: [
          { confidence: 90 },
          { confidence: 80 },
          { confidence: 70 },
          { confidence: 80 },
        ],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.wordConfidence).toBe(80);
    });

    test("should calculate line confidence correctly", () => {
      const ocrResult = {
        confidence: 80,
        text: "Sample",
        words: [],
        lines: [{ confidence: 85 }, { confidence: 75 }, { confidence: 80 }],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.lineConfidence).toBe(80);
    });

    test("should handle average confidence calculation", () => {
      const extractedData = {
        studentName: "John",
        studentId: "123",
        gpa: 3.75,
        totalCredits: 120,
        courses: [{ code: "CS101", name: "Test", grade: "A", credits: 4.0 }],
      };

      const result = scorer.calculateFieldConfidence(
        extractedData,
        "John 123 3.75 120 CS101 Test A 4.0",
      );

      expect(result.average).toBeGreaterThan(0);
      expect(result.average).toBeLessThan(100);
    });
  });

  describe("Performance Tests", () => {
    test("should calculate overall confidence quickly", () => {
      const ocrResult = {
        confidence: 85,
        text: global.testData.sampleTranscriptText,
        words: Array(100)
          .fill(null)
          .map(() => ({ confidence: 80 })),
        lines: Array(20)
          .fill(null)
          .map(() => ({ confidence: 85 })),
      };

      const startTime = Date.now();
      const result = scorer.calculateOverall(ocrResult);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100);
    });

    test("should calculate field confidence quickly", () => {
      const extractedData = {
        studentName: "John Smith",
        studentId: "123456",
        gpa: 3.75,
        totalCredits: 120,
        courses: Array(50)
          .fill(null)
          .map((_, i) => ({
            code: `CS${1000 + i}`,
            name: `Course ${i}`,
            grade: "A",
            credits: 4.0,
          })),
      };

      const ocrText = global.testData.sampleTranscriptText;

      const startTime = Date.now();
      const result = scorer.calculateFieldConfidence(extractedData, ocrText);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(500);
    });

    test("should handle large OCR results efficiently", () => {
      const largeOcrResult = {
        confidence: 80,
        text: "Sample ".repeat(10000),
        words: Array(5000)
          .fill(null)
          .map((_, i) => ({
            confidence: 70 + (i % 30),
          })),
        lines: Array(1000)
          .fill(null)
          .map(() => ({ confidence: 80 })),
      };

      const startTime = Date.now();
      const result = scorer.calculateOverall(largeOcrResult);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(2000); // 2 seconds for large result
    });
  });

  describe("Edge Cases", () => {
    test("should handle zero confidence", () => {
      const ocrResult = {
        confidence: 0,
        text: "",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.overall).toBe(0);
      expect(result.quality).toBe("very_low");
    });

    test("should handle one hundred confidence", () => {
      const ocrResult = {
        confidence: 100,
        text: "Perfect",
        words: [{ confidence: 100 }],
        lines: [{ confidence: 100 }],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.overall).toBe(100);
      expect(result.quality).toBe("high");
    });

    test("should handle negative confidence (edge case)", () => {
      const ocrResult = {
        confidence: -10,
        text: "Invalid",
        words: [],
        lines: [],
      };

      const result = scorer.calculateOverall(ocrResult);

      expect(result.overall).toBe(-10);
      expect(result.quality).toBe("very_low");
    });

    test("should handle very long field values", () => {
      const extractedData = {
        studentName: "A".repeat(1000),
        studentId: null,
        gpa: null,
        totalCredits: null,
        courses: [],
      };

      const ocrText = "A".repeat(1000);

      const result = scorer.calculateFieldConfidence(extractedData, ocrText);

      expect(result.fields.studentName).toBeGreaterThan(0);
    });
  });
});
