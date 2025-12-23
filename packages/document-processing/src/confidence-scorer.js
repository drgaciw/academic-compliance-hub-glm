/**
 * Confidence Scorer for OCR Pipeline
 * Calculates confidence scores for OCR output and extracted data
 */
class ConfidenceScorer {
  constructor(options = {}) {
    this.thresholds = {
      high: options.highThreshold || 90,
      medium: options.mediumThreshold || 70,
      low: options.lowThreshold || 50,
    };
  }

  /**
   * Calculate overall confidence from OCR result
   * @param {object} ocrResult - Result from Tesseract
   * @returns {object} - Confidence breakdown
   */
  calculateOverall(ocrResult) {
    if (!ocrResult) {
      return {
        overall: 0,
        confidence: 0,
        wordConfidence: 0,
        lineConfidence: 0,
        quality: "very_low",
        issues: ["No OCR result provided"],
      };
    }

    const overall = ocrResult.confidence || 0;
    const wordConfidence = this._calculateWordConfidence(ocrResult.words);
    const lineConfidence = this._calculateLineConfidence(ocrResult.lines);

    return {
      overall,
      wordConfidence,
      lineConfidence,
      quality: this._getQualityLevel(overall),
      issues: this._identifyIssues(ocrResult),
    };
  }

  /**
   * Calculate confidence for extracted transcript data
   * @param {object} extractedData - Data extracted from transcript
   * @param {string} ocrText - Raw OCR text
   * @returns {object} - Field-wise confidence scores
   */
  calculateFieldConfidence(extractedData, ocrText) {
    const fields = {
      studentName: this._calculateFieldConfidence(
        extractedData.studentName,
        ocrText,
      ),
      studentId: this._calculateFieldConfidence(
        extractedData.studentId,
        ocrText,
      ),
      gpa: this._calculateFieldConfidence(extractedData.gpa, ocrText),
      totalCredits: this._calculateFieldConfidence(
        extractedData.totalCredits,
        ocrText,
      ),
      courses: extractedData.courses.map((course) => ({
        ...course,
        confidence: this._calculateCourseConfidence(course, ocrText),
      })),
    };

    const avgFieldConfidence = this._averageConfidence([
      fields.studentName,
      fields.studentId,
      fields.gpa,
      fields.totalCredits,
    ]);

    const avgCourseConfidence =
      fields.courses.length > 0
        ? this._averageConfidence(fields.courses.map((c) => c.confidence))
        : 0;

    return {
      fields,
      average: (avgFieldConfidence + avgCourseConfidence) / 2,
      quality: this._getQualityLevel(
        (avgFieldConfidence + avgCourseConfidence) / 2,
      ),
    };
  }

  /**
   * Calculate word-level confidence
   * @param {Array<object>} words - Word objects from Tesseract
   * @returns {number} - Average word confidence
   */
  _calculateWordConfidence(words) {
    if (!words || words.length === 0) return 0;

    const confidences = words.map((w) => w.confidence || 0);
    return this._averageConfidence(confidences);
  }

  /**
   * Calculate line-level confidence
   * @param {Array<object>} lines - Line objects from Tesseract
   * @returns {number} - Average line confidence
   */
  _calculateLineConfidence(lines) {
    if (!lines || lines.length === 0) return 0;

    const confidences = lines.map((l) => l.confidence || 0);
    return this._averageConfidence(confidences);
  }

  /**
   * Calculate confidence for a single field
   * @param {*} value - Field value
   * @param {string} ocrText - Full OCR text
   * @returns {number} - Confidence score
   */
  _calculateFieldConfidence(value, ocrText) {
    if (!value) return 0;

    // Find where value appears in text
    const valueStr = String(value);
    if (!ocrText || typeof ocrText !== "string") return 50; // Low confidence if can't verify
    const occurrences = (ocrText.match(new RegExp(valueStr, "gi")) || [])
      .length;

    // High confidence if found multiple times
    if (occurrences >= 2) return 95;

    // Medium confidence if found once
    if (occurrences === 1) return 85;

    // Low confidence if derived via pattern
    return 70;
  }

  /**
   * Calculate confidence for a course entry
   * @param {object} course - Course object
   * @param {string} ocrText - Full OCR text
   * @returns {number} - Confidence score
   */
  _calculateCourseConfidence(course, ocrText) {
    const parts = [course.code, course.name, course.grade, course.credits];
    let totalConfidence = 0;
    let foundParts = 0;

    for (const part of parts) {
      if (part) {
        const occurrences = (
          ocrText.match(new RegExp(String(part), "gi")) || []
        ).length;
        if (occurrences > 0) {
          totalConfidence += 80 + Math.min(occurrences * 5, 20);
          foundParts++;
        }
      }
    }

    return foundParts > 0 ? totalConfidence / foundParts : 0;
  }

  /**
   * Calculate average confidence
   * @param {Array<number>} confidences - Array of confidence values
   * @returns {number} - Average confidence
   */
  _averageConfidence(confidences) {
    if (confidences.length === 0) return 0;
    const sum = confidences.reduce((a, b) => a + b, 0);
    return sum / confidences.length;
  }

  /**
   * Get quality level from confidence score
   * @param {number} confidence - Confidence score
   * @returns {string} - Quality level
   */
  _getQualityLevel(confidence) {
    if (confidence >= this.thresholds.high) return "high";
    if (confidence >= this.thresholds.medium) return "medium";
    if (confidence >= this.thresholds.low) return "low";
    return "very_low";
  }

  /**
   * Identify potential issues with OCR result
   * @param {object} ocrResult - OCR result
   * @returns {Array<string>} - Array of issues
   */
  _identifyIssues(ocrResult) {
    const issues = [];
    const confidence = ocrResult.confidence || 0;

    if (confidence < this.thresholds.low) {
      issues.push("Very low overall confidence");
    }

    // Check for empty or very short text
    if (!ocrResult.text || ocrResult.text.trim().length < 50) {
      issues.push("Insufficient text extracted");
    }

    // Check word confidence distribution
    if (ocrResult.words && ocrResult.words.length > 0) {
      const lowConfWords = ocrResult.words.filter(
        (w) => w.confidence < 50,
      ).length;
      const lowConfRatio = lowConfWords / ocrResult.words.length;

      if (lowConfRatio > 0.3) {
        issues.push("High proportion of low-confidence words");
      }
    }

    // Check for suspicious characters
    if (ocrResult.text) {
      const suspiciousChars = /[│┤┐└┴┬├─┼┘┌║►]/g;
      const suspicious = ocrResult.text.match(suspiciousChars);
      if (suspicious && suspicious.length > 5) {
        issues.push("Possible PDF table extraction artifacts");
      }
    }

    return issues;
  }

  /**
   * Validate confidence meets minimum threshold
   * @param {number} confidence - Confidence score
   * @param {string} thresholdType - Threshold type (high/medium/low)
   * @returns {boolean} - Whether threshold is met
   */
  meetsThreshold(confidence, thresholdType = "medium") {
    const threshold = this.thresholds[thresholdType] || this.thresholds.medium;
    return confidence >= threshold;
  }

  /**
   * Get recommended action based on confidence
   * @param {number} confidence - Confidence score
   * @returns {object} - Recommendation
   */
  getRecommendation(confidence) {
    if (confidence >= this.thresholds.high) {
      return {
        action: "accept",
        message: "High confidence - can process automatically",
        requiresReview: false,
      };
    }

    if (confidence >= this.thresholds.medium) {
      return {
        action: "accept_with_review",
        message: "Medium confidence - recommend human verification",
        requiresReview: true,
      };
    }

    if (confidence >= this.thresholds.low) {
      return {
        action: "reject",
        message: "Low confidence - requires manual review",
        requiresReview: true,
      };
    }

    return {
      action: "reject",
      message: "Very low confidence - document may need re-scanning",
      requiresReview: true,
    };
  }
}

module.exports = ConfidenceScorer;
