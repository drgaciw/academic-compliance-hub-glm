const Tesseract = require("tesseract.js");

/**
 * OCR Service using Tesseract.js
 * Provides transcript image to text conversion
 */
class OcrService {
  constructor(options = {}) {
    this.language = options.language || "eng";
    this.worker = null;
  }

  /**
   * Initialize Tesseract worker
   */
  async initialize() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker(this.language);
    }
    return this.worker;
  }

  /**
   * Perform OCR on an image
   * @param {string|Buffer} imageInput - File path or buffer
   * @param {object} options - Additional options
   * @returns {Promise<object>} - OCR result with text and confidence
   */
  async recognizeText(imageInput, options = {}) {
    const startTime = Date.now();

    try {
      await this.initialize();

      const result = await this.worker.recognize(imageInput);

      const endTime = Date.now();

      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence,
        lines: result.data.lines,
        words: result.data.words,
        timeTaken: endTime - startTime,
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        error: error.message || "Unknown error",
        text: "",
        confidence: 0,
        lines: [],
        words: [],
        timeTaken: endTime - startTime,
      };
    }
  }

  /**
   * Perform OCR on multiple images
   * @param {Array<string|Buffer>} imageInputs - Array of file paths or buffers
   * @returns {Promise<Array>} - Array of OCR results
   */
  async recognizeBatch(imageInputs) {
    const results = [];

    for (const imageInput of imageInputs) {
      const result = await this.recognizeText(imageInput);
      results.push(result);
    }

    return results;
  }

  /**
   * Extract structured data from transcript
   * @param {string} text - OCR text
   * @returns {object} - Extracted fields
   */
  extractTranscriptData(text) {
    const extracted = {
      studentName: null,
      studentId: null,
      gpa: null,
      totalCredits: null,
      courses: [],
    };

    // Extract student name (various patterns)
    const namePatterns = [/Student\s+Name:\s*([^\n]+)/i, /Name:\s*([^\n]+)/i];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.studentName = match[1].trim();
        break;
      }
    }

    // Extract student ID
    const idPatterns = [
      /Student\s+ID:\s*([0-9]+)/i,
      /ID:\s*([0-9]+)/i,
      /Student\s+Number:\s*([0-9]+)/i,
    ];
    for (const pattern of idPatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.studentId = match[1].trim();
        break;
      }
    }

    // Extract GPA
    const gpaPatterns = [
      /GPA:\s*([0-9]\.[0-9]{2})/i,
      /Cumulative\s+GPA:\s*([0-9]\.[0-9]{2})/i,
    ];
    for (const pattern of gpaPatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.gpa = parseFloat(match[1]);
        break;
      }
    }

    // Extract total credits
    const creditsPatterns = [
      /Total\s+Credits:\s*([0-9]+)/i,
      /Credits\s+Earned:\s*([0-9]+)/i,
    ];
    for (const pattern of creditsPatterns) {
      const match = text.match(pattern);
      if (match) {
        extracted.totalCredits = parseInt(match[1], 10);
        break;
      }
    }

    // Extract courses (basic pattern matching)
    const courseLines = text.split("\n");
    for (const line of courseLines) {
      const courseMatch = line.match(
        /^([A-Z]{3,4})\s+(\d{3,4})\s+(.+?)\s+([A-D][+-]?)\s+(\d+\.\d+)/,
      );
      if (courseMatch) {
        extracted.courses.push({
          code: courseMatch[1] + courseMatch[2],
          name: courseMatch[3].trim(),
          grade: courseMatch[4],
          credits: parseFloat(courseMatch[5]),
        });
      }
    }

    return extracted;
  }

  /**
   * Terminate worker and cleanup
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

module.exports = OcrService;
