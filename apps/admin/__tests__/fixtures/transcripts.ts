/**
 * Transcript Fixtures
 * 
 * FERPA-Compliant Test Data
 * All test data uses synthetic, non-identifiable information.
 * No real student data is used in testing.
 */

export interface Transcript {
  id: string;
  studentId: string;
  studentName: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  uploadedAt: string;
  processedAt?: string;
  courses: Course[];
  gpa: number;
  totalCredits: number;
  sourceInstitution: string;
  targetInstitution: string;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  grade: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing';
  createdAt: string;
}

export interface BatchUploadResponse {
  batchId: string;
  results: UploadResponse[];
  total: number;
  successful: number;
  failed: number;
}

export const mockTranscripts: Transcript[] = [
  {
    id: 'transcript-001',
    studentId: 'STU001',
    studentName: 'Alex Testington',
    filename: 'alex-testington-transcript.pdf',
    status: 'processed',
    uploadedAt: '2024-12-01T10:00:00Z',
    processedAt: '2024-12-01T10:05:00Z',
    sourceInstitution: 'Community College',
    targetInstitution: 'State University',
    courses: [
      { code: 'ENGL 101', name: 'English Composition I', credits: 3, grade: 'A' },
      { code: 'MATH 201', name: 'Calculus I', credits: 4, grade: 'B+' },
      { code: 'HIST 101', name: 'World History', credits: 3, grade: 'A-' }
    ],
    gpa: 3.7,
    totalCredits: 10
  },
  {
    id: 'transcript-002',
    studentId: 'STU002',
    studentName: 'Jordan Testerson',
    filename: 'jordan-testerson-transcript.pdf',
    status: 'processed',
    uploadedAt: '2024-12-02T14:30:00Z',
    processedAt: '2024-12-02T14:35:00Z',
    sourceInstitution: 'State University',
    targetInstitution: 'National University',
    courses: [
      { code: 'ENGL 101', name: 'English Composition I', credits: 3, grade: 'B' },
      { code: 'MATH 201', name: 'Calculus I', credits: 4, grade: 'C+' },
      { code: 'CHEM 101', name: 'General Chemistry', credits: 4, grade: 'B-' }
    ],
    gpa: 2.8,
    totalCredits: 11
  },
  {
    id: 'transcript-003',
    studentId: 'STU003',
    studentName: 'Taylor Testwell',
    filename: 'taylor-testwell-transcript.pdf',
    status: 'processing',
    uploadedAt: '2024-12-03T09:15:00Z',
    sourceInstitution: 'Community College',
    targetInstitution: 'State University',
    courses: [
      { code: 'PHYS 101', name: 'Physics I', credits: 4, grade: 'A' },
      { code: 'BIOL 101', name: 'Biology I', credits: 4, grade: 'A-' }
    ],
    gpa: 3.9,
    totalCredits: 8
  }
];

export const mockUploadResponse: UploadResponse = {
  id: 'transcript-' + Date.now(),
  filename: 'test-transcript.pdf',
  status: 'uploaded',
  createdAt: new Date().toISOString()
};

export const mockBatchUploadResponse: BatchUploadResponse = {
  batchId: 'batch-' + Date.now(),
  results: [
    {
      id: 'transcript-' + Date.now() + '-1',
      filename: 'transcript1.pdf',
      status: 'uploaded',
      createdAt: new Date().toISOString()
    },
    {
      id: 'transcript-' + Date.now() + '-2',
      filename: 'transcript2.pdf',
      status: 'uploaded',
      createdAt: new Date().toISOString()
    }
  ],
  total: 2,
  successful: 2,
  failed: 0
};

export const mockUploadErrorResponse = {
  error: 'Invalid file type. Only PDF files are allowed.'
};

export const mockFileSizeErrorResponse = {
  error: 'File size exceeds maximum limit of 10MB.'
};

export const mockProcessingTranscript: Transcript = {
  id: 'transcript-processing',
  studentId: 'STU004',
  studentName: 'Processing Student',
  filename: 'processing-transcript.pdf',
  status: 'processing',
  uploadedAt: '2024-12-04T11:00:00Z',
  sourceInstitution: 'Community College',
  targetInstitution: 'State University',
  courses: [],
  gpa: 0,
  totalCredits: 0
};

export const mockFailedTranscript: Transcript = {
  id: 'transcript-failed',
  studentId: 'STU005',
  studentName: 'Failed Student',
  filename: 'failed-transcript.pdf',
  status: 'failed',
  uploadedAt: '2024-12-05T12:00:00Z',
  sourceInstitution: 'Community College',
  targetInstitution: 'State University',
  courses: [],
  gpa: 0,
  totalCredits: 0
};
