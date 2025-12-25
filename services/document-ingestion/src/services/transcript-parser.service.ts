import { z } from "zod";

export interface TranscriptCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
  term?: string;
  year?: number;
}

export interface TranscriptTerm {
  name: string;
  year: number;
  gpa?: number;
  credits: number;
  courses: TranscriptCourse[];
}

export interface ParsedTranscript {
  studentName: string;
  studentId: string;
  institutionName: string;
  cumulativeGpa: number;
  cumulativeCredits: number;
  terms: TranscriptTerm[];
  metadata: {
    parsingDate: Date;
    parserVersion: string;
    confidenceScore: number;
  };
}

export class TranscriptParser {
  private static readonly COURSE_REGEX =
    /([A-Z]{2,4}\s*\d{3,4})\s+(.+?)\s+(\d+\.?\d*)\s+([A-D][+-]?|F|P|NP|W)/g;
  private static readonly GPA_REGEX =
    /(?:cumulative\s*)?(?:gpa|grade\s*point\s*average)[:\s]+(\d+\.?\d*)/i;
  private static readonly CREDITS_REGEX =
    /(?:cumulative\s*)?(?:total\s*)?credits?[:\s]+(\d+\.?\d*)/i;
  private static readonly STUDENT_ID_REGEX =
    /(?:student\s*id|id)[:\s]+([A-Z0-9-]+)/i;
  private static readonly INSTITUTION_REGEX =
    /(?:university|college|institute|school)\s+of\s+([A-Z][a-zA-Z\s]+)/i;
  private static readonly TERM_REGEX =
    /((?:Fall|Spring|Summer|Winter)\s*\d{4})/i;

  static parse(ocrText: string): ParsedTranscript {
    const terms = this.extractTerms(ocrText);
    const courses = this.extractCourses(ocrText);

    return {
      studentName: this.extractStudentName(ocrText),
      studentId: this.extractStudentId(ocrText),
      institutionName: this.extractInstitution(ocrText),
      cumulativeGpa: this.extractGPA(ocrText),
      cumulativeCredits: this.extractCredits(ocrText),
      terms: this.organizeCoursesByTerm(courses, terms),
      metadata: {
        parsingDate: new Date(),
        parserVersion: "1.0.0",
        confidenceScore: this.calculateConfidence(ocrText),
      },
    };
  }

  private static extractTerms(text: string): string[] {
    const terms: string[] = [];
    let match;

    const regex = new RegExp(this.TERM_REGEX, "gi");
    while ((match = regex.exec(text)) !== null) {
      terms.push(match[1].trim());
    }

    return [...new Set(terms)];
  }

  private static extractCourses(text: string): TranscriptCourse[] {
    const courses: TranscriptCourse[] = [];
    let match;

    const regex = new RegExp(this.COURSE_REGEX);
    while ((match = regex.exec(text)) !== null) {
      courses.push({
        code: match[1].trim().replace(/\s+/g, ""),
        name: match[2].trim(),
        credits: parseFloat(match[3]),
        grade: match[4].toUpperCase(),
      });
    }

    return courses;
  }

  private static extractStudentName(text: string): string {
    const nameMatch = text.match(
      /(?:student|name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    );
    return nameMatch ? nameMatch[1].trim() : "Unknown";
  }

  private static extractStudentId(text: string): string {
    const idMatch = text.match(this.STUDENT_ID_REGEX);
    return idMatch ? idMatch[1].trim() : "Unknown";
  }

  private static extractInstitution(text: string): string {
    const instMatch = text.match(this.INSTITUTION_REGEX);
    return instMatch ? instMatch[1].trim() : "Unknown";
  }

  private static extractGPA(text: string): number {
    const gpaMatch = text.match(this.GPA_REGEX);
    return gpaMatch ? parseFloat(gpaMatch[1]) : 0;
  }

  private static extractCredits(text: string): number {
    const creditsMatch = text.match(this.CREDITS_REGEX);
    return creditsMatch ? parseFloat(creditsMatch[1]) : 0;
  }

  private static organizeCoursesByTerm(
    courses: TranscriptCourse[],
    terms: string[],
  ): TranscriptTerm[] {
    const termMap = new Map<string, TranscriptTerm>();

    terms.forEach((term) => {
      const [season, year] = term.split(/\s+/);
      const termYear = parseInt(year);

      termMap.set(term, {
        name: season,
        year: termYear,
        credits: 0,
        courses: [],
      });
    });

    courses.forEach((course) => {
      if (terms.length > 0) {
        const termKey = terms[0];
        const term = termMap.get(termKey);
        if (term) {
          term.courses.push(course);
          term.credits += course.credits;
        }
      } else {
        const defaultTerm: TranscriptTerm = {
          name: "Unknown",
          year: new Date().getFullYear(),
          credits: course.credits,
          courses: [course],
        };

        termMap.set("default", defaultTerm);
      }
    });

    return Array.from(termMap.values()).map((term) => ({
      ...term,
      gpa: this.calculateTermGPA(term.courses),
    }));
  }

  private static calculateTermGPA(courses: TranscriptCourse[]): number {
    if (courses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    const gradePoints: Record<string, number> = {
      A: 4.0,
      "A+": 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      "C-": 1.7,
      "D+": 1.3,
      D: 1.0,
      "D-": 0.7,
      F: 0.0,
      P: 0.0,
      NP: 0.0,
      W: 0.0,
    };

    courses.forEach((course) => {
      const points = gradePoints[course.grade] ?? 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  private static calculateConfidence(text: string): number {
    let confidence = 0.5;

    if (this.COURSE_REGEX.test(text)) confidence += 0.2;
    if (this.GPA_REGEX.test(text)) confidence += 0.1;
    if (this.CREDITS_REGEX.test(text)) confidence += 0.1;
    if (this.STUDENT_ID_REGEX.test(text)) confidence += 0.05;
    if (this.INSTITUTION_REGEX.test(text)) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  static validateParsedData(data: ParsedTranscript): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.studentName === "Unknown") {
      warnings.push("Student name could not be extracted");
    }

    if (data.studentId === "Unknown") {
      warnings.push("Student ID could not be extracted");
    }

    if (data.cumulativeGpa === 0) {
      errors.push("GPA could not be extracted from transcript");
    }

    if (data.cumulativeCredits === 0) {
      errors.push("Total credits could not be extracted from transcript");
    }

    if (
      data.terms.length === 0 ||
      data.terms.every((t) => t.courses.length === 0)
    ) {
      errors.push("No courses found in transcript");
    }

    if (data.cumulativeGpa > 4.0) {
      warnings.push("Cumulative GPA exceeds 4.0, verify grading scale");
    }

    if (data.cumulativeGpa < 0) {
      errors.push("Negative GPA detected, verify data integrity");
    }

    const totalTermCredits = data.terms.reduce(
      (sum, term) => sum + term.credits,
      0,
    );
    if (Math.abs(totalTermCredits - data.cumulativeCredits) > 5) {
      warnings.push(
        `Term credits (${totalTermCredits}) do not match cumulative credits (${data.cumulativeCredits})`,
      );
    }

    const invalidCourses = data.terms.flatMap((term) =>
      term.courses.filter(
        (course) => course.code.length < 5 || course.code.length > 10,
      ),
    );
    if (invalidCourses.length > 0) {
      warnings.push(
        `Found ${invalidCourses.length} courses with invalid course code format`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
