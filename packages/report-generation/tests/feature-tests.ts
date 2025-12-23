import { PDFGenerator } from "../src/pdf";
import {
  CourseMapping,
  SignatureData,
  SignatureField,
  CertificateInfo,
  generateCourseMappingSummary,
} from "../src";

export function createSampleCourseMappings(): CourseMapping[] {
  return [
    {
      sourceCourse: "MATH 101",
      sourceTitle: "College Algebra",
      targetCourse: "MAT 101",
      targetTitle: "Introduction to Algebra",
      credits: 3,
      grade: "A",
      status: "ACCEPTED",
      subjectArea: "Mathematics",
      confidenceScore: 95.5,
      conversionNotes: "Direct equivalent",
    },
    {
      sourceCourse: "ENG 101",
      sourceTitle: "English Composition I",
      targetCourse: "ENG 105",
      targetTitle: "English Composition",
      credits: 3,
      grade: "B+",
      status: "ACCEPTED",
      subjectArea: "English",
      confidenceScore: 92.0,
      conversionNotes: "Partial credit awarded",
    },
    {
      sourceCourse: "HIST 201",
      sourceTitle: "American History I",
      targetCourse: "HIS 101",
      targetTitle: "United States History I",
      credits: 3,
      grade: "A-",
      status: "ACCEPTED",
      subjectArea: "History",
      confidenceScore: 98.2,
    },
    {
      sourceCourse: "CHEM 101",
      sourceTitle: "General Chemistry",
      targetCourse: "CHM 110",
      targetTitle: "Principles of Chemistry",
      credits: 4,
      grade: "B",
      status: "PENDING",
      subjectArea: "Chemistry",
      confidenceScore: 75.0,
      conversionNotes: "Requires lab verification",
    },
    {
      sourceCourse: "PSY 101",
      sourceTitle: "Introduction to Psychology",
      targetCourse: "PSY 201",
      targetTitle: "General Psychology",
      credits: 3,
      grade: "C+",
      status: "REJECTED",
      subjectArea: "Psychology",
      confidenceScore: 88.0,
      conversionNotes: "Grade below transfer threshold",
    },
    {
      sourceCourse: "BIO 102",
      sourceTitle: "Biology II",
      targetCourse: "BIO 202",
      targetTitle: "General Biology II",
      credits: 4,
      grade: "A",
      status: "ACCEPTED",
      subjectArea: "Biology",
      confidenceScore: 96.8,
    },
  ];
}

export function createSampleSignatureData(): SignatureData {
  return {
    signerName: "Dr. Sarah Johnson",
    signerTitle: "NCAA Compliance Officer",
    signature: "digital-signature-hash-123456789",
    signatureDate: new Date("2024-01-15T10:30:00Z"),
    certificateInfo: {
      serialNumber: "CN=NCAA-Compliance-CA-2024",
      issuer: "NCAA Compliance Authority",
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2025-12-31"),
      subject: "O=NCAA,OU=Compliance,CN=Official-Cert",
      certificateHash: "a1b2c3d4e5f6g7h8i9j0",
    },
    timestamp: new Date(),
  };
}

export function createSampleSignatureField(): SignatureField {
  return {
    x: 14,
    y: 250,
    width: 182,
    height: 30,
    pageNumber: 1,
    label: "Compliance Officer Signature",
  };
}

export function createSampleCertificateInfo(): CertificateInfo {
  return {
    serialNumber: "CN=NCAA-Compliance-CA-2024",
    issuer: "NCAA Compliance Authority",
    validFrom: new Date("2024-01-01"),
    validTo: new Date("2025-12-31"),
    subject: "O=NCAA,OU=Compliance,CN=Official-Cert",
    certificateHash: "a1b2c3d4e5f6g7h8i9j0",
  };
}

export async function generateCourseMappingVisualizationReport(): Promise<void> {
  console.log("Generating Course Mapping Visualization Report (F1-003)...");

  const courseMappings = createSampleCourseMappings();
  const summary = generateCourseMappingSummary(courseMappings);

  console.log("\n=== Course Mapping Summary ===");
  console.log(`Source Courses: ${summary.sourceCoursesCount}`);
  console.log(`Target Courses: ${summary.targetCoursesCount}`);
  console.log(`Total Credits: ${summary.totalCredits}`);
  console.log(`Accepted: ${summary.acceptedCourses}`);
  console.log(`Rejected: ${summary.rejectedCourses}`);
  console.log(`Pending: ${summary.pendingCourses}`);
  console.log(
    `Average Confidence: ${summary.averageConfidenceScore.toFixed(1)}%`,
  );
  console.log(`Subject Areas: ${summary.subjectAreas.join(", ")}`);

  const generator = new PDFGenerator({ orientation: "portrait" });

  generator.addHeader("Course Mapping Visualization Report");

  generator.addCourseMappingTable(courseMappings, summary);

  const pdfBuffer = await generator.generatePDF({});

  require("fs").writeFileSync(
    "course-mapping-visualization.pdf",
    Buffer.from(pdfBuffer),
  );

  console.log(
    "\n✓ Course Mapping Visualization Report saved as 'course-mapping-visualization.pdf'",
  );
}

export async function generateDigitalSignatureReport(): Promise<void> {
  console.log("Generating Digital Signature Report (F1-004)...");

  const signatureData = createSampleSignatureData();
  const signatureField = createSampleSignatureField();

  console.log("\n=== Digital Signature Data ===");
  console.log(`Signer: ${signatureData.signerName}`);
  console.log(`Title: ${signatureData.signerTitle}`);
  console.log(`Date: ${signatureData.signatureDate.toISOString()}`);
  console.log(`Certificate: ${signatureData.certificateInfo?.serialNumber}`);
  console.log(
    `Valid: ${signatureData.certificateInfo?.validFrom.toDateString()} - ${signatureData.certificateInfo?.validTo.toDateString()}`,
  );

  const generator = new PDFGenerator({ orientation: "portrait" });

  generator.addHeader("Digital Signature Test Report");
  generator.addFooter("Test Document for Digital Signature Feature");

  generator.addSignatureField(signatureField);

  const signedPdfBuffer = await generator.addDigitalSignature(
    signatureData,
    signatureField,
    true,
  );

  require("fs").writeFileSync(
    "digital-signature-test.pdf",
    Buffer.from(signedPdfBuffer),
  );

  console.log(
    "\n✓ Digital Signature Report saved as 'digital-signature-test.pdf'",
  );
  console.log("✓ Document has been locked after signing");
}

export async function validateSampleReportSignature(): Promise<void> {
  console.log("Testing Signature Validation (F1-004)...");

  const pdfBuffer = new Uint8Array(
    await require("fs").promises.readFile("digital-signature-test.pdf"),
  );

  const isValid = await PDFGenerator.validateSignature(pdfBuffer);

  console.log(`\nSignature Validation: ${isValid ? "✓ Valid" : "✗ Invalid"}`);

  return isValid
    ? Promise.resolve()
    : Promise.reject(new Error("Invalid signature"));
}

export async function runAllTests(): Promise<void> {
  console.log("=== F1-003: Course Mapping Visualization Tests ===\n");

  await generateCourseMappingVisualizationReport();

  console.log("\n=== F1-004: Digital Signature Support Tests ===\n");

  await generateDigitalSignatureReport();
  await validateSampleReportSignature();

  console.log("\n=== All Tests Completed Successfully ===\n");
}

if (require.main === module) {
  runAllTests().catch(console.error);
}
