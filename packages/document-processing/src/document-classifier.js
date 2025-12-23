/**
 * Document Classifier for OCR Pipeline
 * Classifies document types from extracted text
 */
class DocumentClassifier {
  constructor() {
    this.patterns = {
      transcript: [
        /transcript/i,
        /official\s+record/i,
        /cumulative\s+gpa/i,
        /student\s+(id|name)/i,
        /grade\s+point\s+average/i,
        /term\s+gpa/i,
        /academic\s+record/i,
      ],
      transcript_edi: [/STC/i, /ELMT/i, /CRED/i, /GRD/i, /HDR/i, /BAT/i],
      enrollment: [
        /enrollment/i,
        /registration/i,
        /class\s+schedule/i,
        /course\s+registration/i,
      ],
      grade_report: [/grade\s+report/i, /final\s+grades/i, /end\s+of\s+term/i],
      transfer_credit: [
        /transfer\s+credit/i,
        /credit\s+evaluation/i,
        /course\s+equivalency/i,
      ],
    };
  }

  /**
   * Classify document type from text
   * @param {string} text - Extracted OCR text
   * @returns {object} - Classification result with type and confidence
   */
  classify(text) {
    if (!text || typeof text !== "string") {
      return {
        type: "unknown",
        confidence: 0,
        matches: [],
      };
    }

    const results = [];

    for (const [type, patterns] of Object.entries(this.patterns)) {
      const matches = this._findMatches(text, patterns);
      if (matches.length > 0) {
        results.push({
          type,
          matches,
          confidence: this._calculateConfidence(matches, text),
        });
      }
    }

    if (results.length === 0) {
      return {
        type: "unknown",
        confidence: 0,
        matches: [],
      };
    }

    // Sort by confidence and return the highest
    results.sort((a, b) => b.confidence - a.confidence);
    const best = results[0];

    return {
      type: best.type,
      confidence: best.confidence,
      matches: best.matches,
    };
  }

  /**
   * Find pattern matches in text
   * @param {string} text - Text to search
   * @param {Array<RegExp>} patterns - Patterns to match
   * @returns {Array<object>} - Array of match objects
   */
  _findMatches(text, patterns) {
    const matches = [];

    for (const pattern of patterns) {
      const found = text.match(pattern);
      if (found) {
        matches.push({
          pattern: pattern.source,
          match: found[0],
          index: found.index,
        });
      }
    }

    return matches;
  }

  /**
   * Calculate confidence score for classification
   * @param {Array<object>} matches - Pattern matches
   * @param {string} text - Full text
   * @returns {number} - Confidence score (0-100)
   */
  _calculateConfidence(matches, text) {
    if (matches.length === 0) return 0;

    // Base confidence from match count
    let confidence = Math.min(matches.length * 20, 80);

    // Boost for multiple distinct patterns
    const distinctPatterns = new Set(matches.map((m) => m.pattern));
    if (distinctPatterns.size > 2) {
      confidence += 10;
    }

    // Boost for matches near document start (likely headers)
    const firstMatchIndex = Math.min(...matches.map((m) => m.index || 0));
    if (firstMatchIndex < text.length * 0.1) {
      confidence += 10;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Classify multiple documents
   * @param {Array<string>} texts - Array of extracted texts
   * @returns {Array<object>} - Array of classification results
   */
  classifyBatch(texts) {
    return texts.map((text) => this.classify(text));
  }

  /**
   * Add custom classification pattern
   * @param {string} type - Document type name
   * @param {RegExp|Array<RegExp>} patterns - Pattern(s) to match
   */
  addPattern(type, patterns) {
    if (!this.patterns[type]) {
      this.patterns[type] = [];
    }

    if (Array.isArray(patterns)) {
      this.patterns[type].push(...patterns);
    } else {
      this.patterns[type].push(patterns);
    }
  }

  /**
   * Get all registered document types
   * @returns {Array<string>} - Array of type names
   */
  getDocumentTypes() {
    return Object.keys(this.patterns);
  }
}

module.exports = DocumentClassifier;
