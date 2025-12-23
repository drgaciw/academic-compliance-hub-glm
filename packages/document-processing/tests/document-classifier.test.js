const DocumentClassifier = require("../src/document-classifier");

describe("DocumentClassifier", () => {
  let classifier;

  beforeEach(() => {
    classifier = new DocumentClassifier();
  });

  describe("classify - Document Type Detection", () => {
    test("should classify official transcript", () => {
      const result = classifier.classify(global.testData.sampleTranscriptText);

      expect(result.type).toBe("transcript");
      expect(result.confidence).toBeGreaterThan(50);
      expect(result.matches).toBeDefined();
      expect(Array.isArray(result.matches)).toBe(true);
    });

    test("should classify EDI transcript", () => {
      const result = classifier.classify(global.testData.sampleEdiText);

      expect(result.type).toBe("transcript_edi");
      expect(result.confidence).toBeGreaterThan(50);
    });

    test("should classify enrollment document", () => {
      const text = "Enrollment Verification\nClass Schedule for Fall 2024";
      const result = classifier.classify(text);

      expect(result.type).toBe("enrollment");
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should classify grade report", () => {
      const text = "Grade Report\nFinal Grades for Fall 2024";
      const result = classifier.classify(text);

      expect(result.type).toBe("grade_report");
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should classify transfer credit document", () => {
      const text = "Transfer Credit Evaluation\nCourse Equivalency Report";
      const result = classifier.classify(text);

      expect(result.type).toBe("transfer_credit");
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should return unknown for unrecognized document", () => {
      const text = "Some random document content\nNo specific patterns";
      const result = classifier.classify(text);

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
      expect(result.matches).toEqual([]);
    });
  });

  describe("classify - Accuracy Tests", () => {
    test("should detect transcript with high confidence for complete headers", () => {
      const text = `
        OFFICIAL TRANSCRIPT
        Student Name: John Doe
        Student ID: 123456
        Cumulative GPA: 3.75
        Term GPA: 3.90
        Academic Record
      `;

      const result = classifier.classify(text);

      expect(result.type).toBe("transcript");
      expect(result.confidence).toBeGreaterThan(80);
    });

    test("should detect EDI format with element markers", () => {
      const text = `
        HDR*12345*OFFICIAL*
        ELMT*CS101**Intro*A*4.0*
        STC*1*4.0*4.0*
      `;

      const result = classifier.classify(text);

      expect(result.type).toBe("transcript_edi");
      expect(result.confidence).toBeGreaterThan(50);
    });

    test("should handle transcript with GPA variations", () => {
      const variations = [
        "OFFICIAL TRANSCRIPT\nGPA: 3.5",
        "OFFICIAL TRANSCRIPT\nGrade Point Average: 3.50",
        "OFFICIAL TRANSCRIPT\nCum. GPA: 3.75",
        "OFFICIAL TRANSCRIPT\nTerm GPA: 4.0",
      ];

      variations.forEach((variation) => {
        const result = classifier.classify(variation);
        expect(result.type).toBe("transcript");
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    test("should handle transcript with student ID variations", () => {
      const variations = [
        "OFFICIAL TRANSCRIPT\nStudent ID: 123456",
        "OFFICIAL TRANSCRIPT\nID: 123456",
        "OFFICIAL TRANSCRIPT\nStudent Number: 123456",
        "OFFICIAL TRANSCRIPT\nStudent No.: 123456",
      ];

      variations.forEach((variation) => {
        const result = classifier.classify(variation);
        expect(result.type).toBe("transcript");
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    test("should match multiple patterns for higher confidence", () => {
      const text = `
        OFFICIAL TRANSCRIPT
        Student Name: Jane Smith
        Student ID: 987654
        Cumulative GPA: 3.85
        Term GPA: 4.00
        Academic Record for Fall 2024
      `;

      const result = classifier.classify(text);

      expect(result.type).toBe("transcript");
      expect(result.confidence).toBeGreaterThan(70);
      expect(result.matches.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("classify - Edge Cases", () => {
    test("should handle empty string", () => {
      const result = classifier.classify("");

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
      expect(result.matches).toEqual([]);
    });

    test("should handle null input", () => {
      const result = classifier.classify(null);

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
      expect(result.matches).toEqual([]);
    });

    test("should handle undefined input", () => {
      const result = classifier.classify(undefined);

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
      expect(result.matches).toEqual([]);
    });

    test("should handle very short text", () => {
      const result = classifier.classify("ABC");

      expect(result).toBeDefined();
    });

    test("should handle very long text", () => {
      const longText = "OFFICIAL TRANSCRIPT\n" + "Sample text. ".repeat(1000);
      const result = classifier.classify(longText);

      expect(result.type).toBe("transcript");
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should handle mixed case patterns", () => {
      const variations = [
        "official transcript",
        "OFFICIAL TRANSCRIPT",
        "Official Transcript",
        "oFfIcIaL tRaNsCrIpT",
      ];

      variations.forEach((variation) => {
        const result = classifier.classify(variation);
        expect(result.type).toBe("transcript");
      });
    });

    test("should handle special characters", () => {
      const text =
        "OFFICIAL TRANSCRIPT©\nStudent Name: John O'Brien\nGPA: 3.75";
      const result = classifier.classify(text);

      expect(result.type).toBe("transcript");
    });

    test("should handle whitespace variations", () => {
      const variations = [
        "Student Name: John",
        "Student  Name:  John",
        "Student\tName:\tJohn",
      ];

      variations.forEach((variation) => {
        const result = classifier.classify(variation);
        expect(result.type).toBe("transcript");
      });
    });

    test("should handle malformed patterns", () => {
      const text = "StudentNameJohn ID123 GPA3.75 NoColonsHere";
      const result = classifier.classify(text);

      expect(result).toBeDefined();
    });
  });

  describe("classify - Error Handling", () => {
    test("should handle invalid string input", () => {
      const result = classifier.classify(12345);

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    test("should handle object input", () => {
      const result = classifier.classify({ text: "test" });

      expect(result.type).toBe("unknown");
    });

    test("should handle array input", () => {
      const result = classifier.classify(["OFFICIAL TRANSCRIPT"]);

      expect(result.type).toBe("unknown");
    });
  });

  describe("classifyBatch", () => {
    test("should classify multiple documents", () => {
      const texts = [
        global.testData.sampleTranscriptText,
        global.testData.sampleEdiText,
        "Enrollment Verification",
        "Grade Report",
        "Random Document",
      ];

      const results = classifier.classifyBatch(texts);

      expect(results).toHaveLength(5);
      expect(results[0].type).toBe("transcript");
      expect(results[1].type).toBe("transcript_edi");
      expect(results[2].type).toBe("enrollment");
      expect(results[3].type).toBe("grade_report");
      expect(results[4].type).toBe("unknown");
    });

    test("should handle empty array", () => {
      const results = classifier.classifyBatch([]);

      expect(results).toEqual([]);
    });

    test("should handle array with mixed valid and invalid inputs", () => {
      const texts = [
        "OFFICIAL TRANSCRIPT",
        "",
        null,
        undefined,
        "Enrollment Verification",
      ];

      const results = classifier.classifyBatch(texts);

      expect(results).toHaveLength(5);
      expect(results[0].type).toBe("transcript");
      expect(results[1].type).toBe("unknown");
      expect(results[2].type).toBe("unknown");
      expect(results[3].type).toBe("unknown");
      expect(results[4].type).toBe("enrollment");
    });
  });

  describe("addPattern", () => {
    test("should add new pattern for existing type", () => {
      const initialResult = classifier.classify("CUSTOM PATTERN");
      expect(initialResult.type).toBe("unknown");

      classifier.addPattern("transcript", /CUSTOM PATTERN/);

      const newResult = classifier.classify("CUSTOM PATTERN");
      expect(newResult.type).toBe("transcript");
    });

    test("should add new document type", () => {
      classifier.addPattern("diploma", /Diploma Certificate/i);

      const result = classifier.classify("Diploma Certificate");
      expect(result.type).toBe("diploma");
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should add multiple patterns at once", () => {
      classifier.addPattern("certificate", /Certificate/i);
      classifier.addPattern("certificate", /Award/i);
      classifier.addPattern("certificate", /Achievement/i);

      const result1 = classifier.classify("Certificate");
      const result2 = classifier.classify("Award");
      const result3 = classifier.classify("Achievement");

      expect(result1.type).toBe("certificate");
      expect(result2.type).toBe("certificate");
      expect(result3.type).toBe("certificate");
    });

    test("should add pattern array", () => {
      classifier.addPattern("test", [/pattern1/i, /pattern2/i, /pattern3/i]);

      const result1 = classifier.classify("Pattern1");
      const result2 = classifier.classify("Pattern2");
      const result3 = classifier.classify("Pattern3");

      expect(result1.type).toBe("test");
      expect(result2.type).toBe("test");
      expect(result3.type).toBe("test");
    });
  });

  describe("getDocumentTypes", () => {
    test("should return all registered document types", () => {
      const types = classifier.getDocumentTypes();

      expect(types).toContain("transcript");
      expect(types).toContain("transcript_edi");
      expect(types).toContain("enrollment");
      expect(types).toContain("grade_report");
      expect(types).toContain("transfer_credit");
    });

    test("should include custom added types", () => {
      classifier.addPattern("custom_type", /Custom Pattern/i);

      const types = classifier.getDocumentTypes();
      expect(types).toContain("custom_type");
    });

    test("should return array of strings", () => {
      const types = classifier.getDocumentTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.every((t) => typeof t === "string")).toBe(true);
    });
  });

  describe("Confidence Calculation", () => {
    test("should increase confidence with more matches", () => {
      const lowMatches = "OFFICIAL TRANSCRIPT";
      const highMatches = `
        OFFICIAL TRANSCRIPT
        Student Name: Test
        Student ID: 123
        Cumulative GPA: 3.5
        Academic Record
      `;

      const lowResult = classifier.classify(lowMatches);
      const highResult = classifier.classify(highMatches);

      expect(highResult.confidence).toBeGreaterThan(lowResult.confidence);
    });

    test("should boost confidence for header patterns", () => {
      const headerText = "OFFICIAL TRANSCRIPT\n" + "content".repeat(20);
      const footerText = "content".repeat(20) + "\nOFFICIAL TRANSCRIPT";

      const headerResult = classifier.classify(headerText);
      const footerResult = classifier.classify(footerText);

      expect(headerResult.confidence).toBeGreaterThanOrEqual(
        footerResult.confidence,
      );
    });

    test("should cap confidence at 100", () => {
      const text = `
        OFFICIAL TRANSCRIPT
        Student Name: Test
        Student ID: 123
        Cumulative GPA: 3.5
        Term GPA: 4.0
        Academic Record
        Official Record
        Grade Point Average
      `;

      const result = classifier.classify(text);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe("Match Details", () => {
    test("should return match details", () => {
      const result = classifier.classify("OFFICIAL TRANSCRIPT");

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0]).toHaveProperty("pattern");
      expect(result.matches[0]).toHaveProperty("match");
      expect(result.matches[0]).toHaveProperty("index");
    });

    test("should include pattern source in match details", () => {
      const result = classifier.classify("OFFICIAL TRANSCRIPT");

      expect(result.matches[0].pattern).toBeDefined();
      expect(typeof result.matches[0].pattern).toBe("string");
    });

    test("should include matched text in match details", () => {
      const text = "OFFICIAL TRANSCRIPT";
      const result = classifier.classify(text);

      expect(result.matches[0].match).toBeDefined();
      expect(result.matches[0].match).toContain("TRANSCRIPT");
    });
  });

  describe("Performance Tests", () => {
    test("should classify quickly for small documents", () => {
      const text = "OFFICIAL TRANSCRIPT";

      const startTime = Date.now();
      const result = classifier.classify(text);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100);
    });

    test("should classify quickly for medium documents", () => {
      const text = global.testData.sampleTranscriptText;

      const startTime = Date.now();
      const result = classifier.classify(text);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(200);
    });

    test("should classify quickly for large documents", () => {
      const text = "OFFICIAL TRANSCRIPT\n" + "Sample text. ".repeat(5000);

      const startTime = Date.now();
      const result = classifier.classify(text);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000);
    });

    test("should handle batch classification efficiently", () => {
      const texts = Array(100).fill("OFFICIAL TRANSCRIPT\nStudent Name: Test");

      const startTime = Date.now();
      const results = classifier.classifyBatch(texts);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(5000);
    });
  });
});
