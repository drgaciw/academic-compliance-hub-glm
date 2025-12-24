export interface PDFOptions {
  orientation?: "portrait" | "landscape";
  unit?: "pt" | "mm" | "cm" | "in";
  format?: "a3" | "a4" | "letter" | "legal";
  compress?: boolean;
}

export interface TableColumn {
  header: string;
  key: string;
  width?: number;
}

export interface TableRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportData {
  header?: string;
  content?: string;
  tables?: Array<{
    title?: string;
    columns: TableColumn[];
    rows: TableRow[];
  }>;
  footer?: string;
}

export interface TransferCreditData {
  studentName: string;
  studentId: string;
  previousInstitution: string;
  transferDate: string;
  courses: Array<{
    courseCode: string;
    courseTitle: string;
    credits: number;
    grade: string;
    term: string;
  }>;
  totalCredits: number;
  transferGPA: number;
  transferRule?: string;
  creditsRequired?: number;
  creditsEarned?: number;
  progressPercentage?: number;
  compliance?: ComplianceSummary;
}

export interface ComplianceData {
  studentName: string;
  studentId: string;
  sport: string;
  academicYear: string;
  gpa: number;
  totalCredits: number;
  eligibilityCredits: number;
  progressTowardsDegree: number;
  status: string;
  courses: Array<{
    courseCode: string;
    courseTitle: string;
    credits: number;
    status: string;
  }>;
}

export interface EligibilityData {
  studentName: string;
  studentId: string;
  sport: string;
  division: string;
  coreGPA: number;
  testScore: string;
  initialEligibility: string;
  currentGPA: number;
  creditsThisTerm: number;
  cumulativeCredits: number;
  aprProgress: number;
  minCredits: number;
  currentCredits: number;
  enrollmentStatus: string;
  creditsCompleted: number;
  sixHourRule: boolean;
  requirements: Array<{
    name: string;
    value: number;
    required: number;
    status: string;
  }>;
  eligibilityStatus: "ELIGIBLE" | "NOT_ELIGIBLE";
  ineligibilityReason?: string;
}

export interface ComplianceSummary {
  status: string;
  eligibilityCredits: string;
  gpa: string;
  progressTowardsDegree: string;
  complianceIssues: string;
}

export type ReportType =
  | "transfer-credit"
  | "compliance"
  | "eligibility"
  | "progress"
  | "custom";

export interface ReportConfig {
  type: ReportType;
  data:
    | TransferCreditData
    | ComplianceData
    | EligibilityData
    | Record<string, any>;
  template?: string;
  options?: PDFOptions;
  filename?: string;
}

export interface CourseMapping {
  sourceCourse: string;
  sourceTitle: string;
  targetCourse: string;
  targetTitle: string;
  credits: number;
  grade: string;
  status: "ACCEPTED" | "REJECTED" | "PENDING";
  subjectArea: string;
  confidenceScore: number;
  conversionNotes?: string;
}

export interface CourseMappingSummary {
  sourceCoursesCount: number;
  targetCoursesCount: number;
  totalCredits: number;
  acceptedCourses: number;
  rejectedCourses: number;
  pendingCourses: number;
  averageConfidenceScore: number;
  subjectAreas: string[];
}

export interface SignatureData {
  signerName: string;
  signerTitle: string;
  signature: string;
  signatureDate: Date;
  certificateInfo?: CertificateInfo;
  timestamp?: Date;
}

export interface CertificateInfo {
  serialNumber: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  subject: string;
  certificateHash: string;
}

export interface SignatureField {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  label: string;
}

export interface SignedPDFOptions {
  pdfBuffer: Uint8Array;
  signatureData: SignatureData;
  signatureField: SignatureField;
  lockDocument?: boolean;
}

export interface CourseMappingTableData {
  columns: Array<{
    header: string;
    key: string;
    width?: number;
  }>;
  rows: CourseMapping[];
  summary: CourseMappingSummary;
}

export interface AuditLog {
  id: string;
  transferEvaluationId: string;
  agentType: string;
  action: string;
  timestamp: Date;
  duration?: number;
  errorMessage?: string;
}
