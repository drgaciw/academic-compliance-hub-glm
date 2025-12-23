const OcrService = require("../src/ocr-service");
const sharp = require("sharp");

describe("OcrService", () => {
  let ocrService;

  beforeEach(() => {
    ocrService = new OcrService({ language: "eng" });
  });

  afterEach(async () => {
    if (ocrService) {
      await ocrService.terminate();
    }
  });

  describe("Initialization", () => {
    test("should create service with default language", () => {
      const service = new OcrService();
      expect(service.language).toBe("eng");
      service.terminate();
    });

    test("should create service with custom language", () => {
      const service = new OcrService({ language: "spa" });
      expect(service.language).toBe("spa");
      service.terminate();
    });

    test("should initialize worker", async () => {
      const worker = await ocrService.initialize();
      expect(worker).toBeDefined();
    });

    test("should not initialize worker twice", async () => {
      const worker1 = await ocrService.initialize();
      const worker2 = await ocrService.initialize();
      expect(worker1).toBe(worker2);
    });
  });

  describe("recognizeText - Accuracy Tests", () => {
    test("should extract text from image", async () => {
      const imageBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: "white",
        },
      })
        .png()
        .toBuffer();

      const result = await ocrService.recognizeText(imageBuffer);

      expect(result.success).toBe(true);
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.timeTaken).toBeLessThan(60000);
    });
  });

  describe("recognizeText - Performance Tests", () => {
    test("should complete within 5 minutes for single page", async () => {
      const imageBuffer = await sharp({
        create: { width: 800, height: 1000, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();

      const result = await ocrService.recognizeText(imageBuffer);

      expect(result.success).toBe(true);
      expect(result.timeTaken).toBeLessThan(300000);
    });

    test("should complete within 10 minutes for 3-page document", async () => {
      const images = [];

      for (let i = 0; i < 3; i++) {
        const imageBuffer = await sharp({
          create: {
            width: 800,
            height: 1000,
            channels: 3,
            background: "white",
          },
        })
          .png()
          .toBuffer();
        images.push(imageBuffer);
      }

      const startTime = Date.now();
      const results = await ocrService.recognizeBatch(images);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
      expect(endTime - startTime).toBeLessThan(600000);
    });
  });

  describe("recognizeText - Edge Cases", () => {
    test("should handle very small image", async () => {
      const smallBuffer = await sharp({
        create: { width: 50, height: 50, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();

      const result = await ocrService.recognizeText(smallBuffer);

      expect(result).toBeDefined();
    });

    test("should handle blank image", async () => {
      const blankBuffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: "white" },
      })
        .png()
        .toBuffer();

      const result = await ocrService.recognizeText(blankBuffer);

      expect(result.success).toBe(true);
      expect(result.text.trim()).toBe("");
    });

    test("should handle very dark image", async () => {
      const darkBuffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: "black" },
      })
        .png()
        .toBuffer();

      const result = await ocrService.recognizeText(darkBuffer);

      expect(result).toBeDefined();
    });

    test("should handle rotated image", async () => {
      const buffer = await sharp({
        create: { width: 800, height: 600, channels: 3, background: "white" },
      })
        .rotate(5)
        .png()
        .toBuffer();

      const result = await ocrService.recognizeText(buffer);

      expect(result).toBeDefined();
    });
  });

  describe("recognizeBatch", () => {
    test("should process multiple images", async () => {
      const images = [];

      for (let i = 0; i < 5; i++) {
        const imageBuffer = await sharp({
          create: { width: 800, height: 600, channels: 3, background: "white" },
        })
          .png()
          .toBuffer();
        images.push(imageBuffer);
      }

      const results = await ocrService.recognizeBatch(images);

      expect(results).toHaveLength(5);
      expect(results.every((r) => r.success)).toBe(true);
    });

    test("should handle empty batch", async () => {
      const results = await ocrService.recognizeBatch([]);

      expect(results).toEqual([]);
    });

    test("should handle batch with valid images only", async () => {
      const images = [
        await sharp({
          create: { width: 800, height: 600, channels: 3, background: "white" },
        })
          .png()
          .toBuffer(),
        await sharp({
          create: { width: 800, height: 600, channels: 3, background: "white" },
        })
          .png()
          .toBuffer(),
      ];

      const results = await ocrService.recognizeBatch(images);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  describe("extractTranscriptData", () => {
    test("should extract student name", () => {
      const text = "Student Name: John A. Smith\nID: 12345";
      const extracted = ocrService.extractTranscriptData(text);

      expect(extracted.studentName).toBe("John A. Smith");
    });

    test("should extract student ID", () => {
      const text = "Student ID: 123456789";
      const extracted = ocrService.extractTranscriptData(text);

      expect(extracted.studentId).toBe("123456789");
    });

    test("should extract GPA", () => {
      const text = "GPA: 3.75";
      const extracted = ocrService.extractTranscriptData(text);

      expect(extracted.gpa).toBe(3.75);
    });

    test("should extract total credits", () => {
      const text = "Total Credits: 120";
      const extracted = ocrService.extractTranscriptData(text);

      expect(extracted.totalCredits).toBe(120);
    });

    test("should extract courses", () => {
      const text =
        "CS 1010  Introduction to Programming          A  4.0\nMATH 1200  Calculus I                          B+ 4.0";
      const extracted = ocrService.extractTranscriptData(text);

      expect(extracted.courses.length).toBeGreaterThan(0);
    });

    test("should handle transcript with all fields", () => {
      const extracted = ocrService.extractTranscriptData(
        global.testData.sampleTranscriptText,
      );

      expect(extracted.studentName).toBe("John A. Smith");
      expect(extracted.studentId).toBe("123456789");
      expect(extracted.gpa).toBe(3.75);
      expect(extracted.totalCredits).toBe(120);
      expect(extracted.courses.length).toBeGreaterThan(0);
    });

    test("should handle empty text", () => {
      const extracted = ocrService.extractTranscriptData("");

      expect(extracted.studentName).toBeNull();
      expect(extracted.studentId).toBeNull();
      expect(extracted.gpa).toBeNull();
      expect(extracted.totalCredits).toBeNull();
      expect(extracted.courses).toEqual([]);
    });
  });

  describe("terminate", () => {
    test("should terminate worker", async () => {
      const service = new OcrService({ language: "eng" });
      await service.initialize();
      expect(service.worker).toBeDefined();

      await service.terminate();
      expect(service.worker).toBeNull();
    });

    test("should handle terminate without initialization", async () => {
      const service = new OcrService({ language: "eng" });
      await expect(service.terminate()).resolves.not.toThrow();
    });
  });
});
