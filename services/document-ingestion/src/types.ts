export type DocumentType = "pdf" | "jpeg" | "png" | "edi";

export type DocumentCategory =
  | "transcript"
  | "course-catalog"
  | "transfer-evaluation"
  | "other";

export interface DocumentMetadata {
  fileName: string;
  fileType: DocumentType;
  fileSize: number;
  category: DocumentCategory;
  pageCount?: number;
  isTranscript: boolean;
  transcriptStructure?: TranscriptStructure;
  uploadedAt: Date;
  ocrData?: {
    text: string;
    confidence: number;
    fields?: any;
    processingTime: number;
  };
}

export interface TranscriptStructure {
  hasStudentInfo: boolean;
  hasCourseList: boolean;
  hasGrades: boolean;
  hasGPA: boolean;
  hasCumulativeCredits: boolean;
  hasTermStructure: boolean;
  layoutType: "standard" | "two-column" | "complex" | "unknown";
  pageBoundaries: number[];
}

export interface UploadResponse {
  success: boolean;
  documentId: string;
  metadata: DocumentMetadata;
  storageUrl: string;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: DocumentType;
}
