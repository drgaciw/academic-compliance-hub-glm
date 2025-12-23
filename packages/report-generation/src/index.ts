export * from "./pdf";
export * from "./templates";
export * from "./types";
export * from "./audit-logger";

import { PDFGenerator } from "./pdf";
import {
  CourseMapping,
  CourseMappingSummary,
  SignatureData,
  SignatureField,
  ReportData,
} from "./types";

export function generateCourseMappingSummary(
  courseMappings: CourseMapping[],
): CourseMappingSummary {
  const subjectAreas = new Set(courseMappings.map((m) => m.subjectArea));
  const totalConfidence = courseMappings.reduce(
    (sum, m) => sum + m.confidenceScore,
    0,
  );

  return {
    sourceCoursesCount: courseMappings.length,
    targetCoursesCount: new Set(courseMappings.map((m) => m.targetCourse)).size,
    totalCredits: courseMappings.reduce((sum, m) => sum + m.credits, 0),
    acceptedCourses: courseMappings.filter((m) => m.status === "ACCEPTED")
      .length,
    rejectedCourses: courseMappings.filter((m) => m.status === "REJECTED")
      .length,
    pendingCourses: courseMappings.filter((m) => m.status === "PENDING").length,
    averageConfidenceScore:
      courseMappings.length > 0 ? totalConfidence / courseMappings.length : 0,
    subjectAreas: Array.from(subjectAreas),
  };
}

export async function generateCourseMappingReport(
  data: any & {
    courseMapping?: CourseMapping[];
    courseMappingSummary?: CourseMappingSummary;
  },
  templateName?: string,
): Promise<Uint8Array> {
  const generator = new PDFGenerator({ orientation: "portrait" });

  const reportData: ReportData = {
    header: `Course Mapping Report - ${data.studentName || "Unknown"}`,
  };

  if (templateName) {
    await generator.generatePDF(reportData, templateName);
  }

  if (data.courseMapping && data.courseMappingSummary) {
    generator.addCourseMappingTable(
      data.courseMapping,
      data.courseMappingSummary,
    );
  }

  return generator.generatePDF(reportData);
}

export async function generateSignedReport(
  pdfBuffer: Uint8Array,
  signatureData: SignatureData,
  signatureField: SignatureField,
): Promise<Uint8Array> {
  return PDFGenerator.signPDF(pdfBuffer, signatureData, signatureField, true);
}

export async function validateReportSignature(
  pdfBuffer: Uint8Array,
): Promise<boolean> {
  return PDFGenerator.validateSignature(pdfBuffer);
}
