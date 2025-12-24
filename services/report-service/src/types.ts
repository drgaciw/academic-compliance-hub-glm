import { z } from "zod";

export enum ReportStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ReportType {
  ELIGIBILITY = "eligibility",
  TRANSFER_CREDIT = "transfer-credit",
  COMPLIANCE = "compliance",
  PROGRESS = "progress",
  CUSTOM = "custom",
}

export enum ReportFormat {
  PDF = "pdf",
  CSV = "csv",
  JSON = "json",
}

export interface ReportJob {
  id: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  data: any;
  userId?: string;
  studentId?: string;
  templateId?: string;
  outputPath?: string;
  error?: string;
  progress: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  customTemplate?: string;
  signatureFields?: SignatureFieldConfig[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface SignatureFieldConfig {
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  required: boolean;
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

export interface BatchReportRequest {
  reportType: ReportType;
  studentIds: string[];
  format?: ReportFormat;
  templateId?: string;
}

export interface ReportExport {
  format: ReportFormat;
  filters: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    type?: ReportType;
    status?: ReportStatus;
    userId?: string;
  };
}

export const EligibilityReportSchema = z.object({
  studentName: z.string(),
  studentId: z.string(),
  sport: z.string(),
  division: z.string(),
  coreGPA: z.number(),
  testScore: z.string(),
  initialEligibility: z.string(),
  currentGPA: z.number(),
  creditsThisTerm: z.number(),
  cumulativeCredits: z.number(),
  aprProgress: z.number(),
  minCredits: z.number(),
  currentCredits: z.number(),
  enrollmentStatus: z.string(),
  creditsCompleted: z.number(),
  sixHourRule: z.boolean(),
  requirements: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      required: z.number(),
      status: z.string(),
    }),
  ),
  eligibilityStatus: z.enum(["ELIGIBLE", "NOT_ELIGIBLE"]),
  ineligibilityReason: z.string().optional(),
});

export const TransferCreditReportSchema = z.object({
  studentName: z.string(),
  studentId: z.string(),
  previousInstitution: z.string(),
  transferDate: z.string(),
  courses: z.array(
    z.object({
      courseCode: z.string(),
      courseTitle: z.string(),
      credits: z.number(),
      grade: z.string(),
      term: z.string(),
    }),
  ),
  totalCredits: z.number(),
  transferGPA: z.number(),
  transferRule: z.string().optional(),
  creditsRequired: z.number().optional(),
  creditsEarned: z.number().optional(),
  progressPercentage: z.number().optional(),
  compliance: z
    .object({
      status: z.string(),
      eligibilityCredits: z.string(),
      gpa: z.string(),
      progressTowardsDegree: z.string(),
      complianceIssues: z.string(),
    })
    .optional(),
});

export const BatchReportRequestSchema = z.object({
  reportType: z.nativeEnum(ReportType),
  studentIds: z.array(z.string()),
  format: z.nativeEnum(ReportFormat).optional(),
  templateId: z.string().optional(),
});

export const SignatureDataSchema = z.object({
  signerName: z.string(),
  signerTitle: z.string(),
  signature: z.string(),
  signatureDate: z.string(),
  certificateInfo: z
    .object({
      serialNumber: z.string(),
      issuer: z.string(),
      validFrom: z.string(),
      validTo: z.string(),
      subject: z.string(),
      certificateHash: z.string(),
    })
    .optional(),
  timestamp: z.string().optional(),
});

export const ReportTemplateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(ReportType),
  customTemplate: z.string().optional(),
  signatureFields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        pageNumber: z.number(),
        required: z.boolean(),
      }),
    )
    .optional(),
});
