/**
 * Audit Trail Fixtures
 * 
 * FERPA-Compliant Test Data
 * All test data uses synthetic, non-identifiable information.
 * No real student data is used in testing.
 */

export interface AuditLogEntry {
  id: string;
  action: string;
  studentName: string;
  studentId: string;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
  details?: Record<string, any>;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface ExportResponse {
  filename: string;
  contentType: string;
  data: string;
}

export const mockAuditLogEntries: AuditLogEntry[] = [
  {
    id: 'audit-001',
    action: 'Transcript uploaded',
    studentName: 'Alex Testington',
    studentId: '***-**-****',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T10:00:00Z',
    ipAddress: '192.168.1.***',
    details: {
      filename: 'alex-testington-transcript.pdf',
      fileSize: '2.5MB'
    }
  },
  {
    id: 'audit-002',
    action: 'Eligibility approved',
    studentName: 'Jordan Testerson',
    studentId: '***-**-****',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T10:15:00Z',
    ipAddress: '192.168.1.***',
    details: {
      gpa: 3.7,
      credits: 90
    }
  },
  {
    id: 'audit-003',
    action: 'Course mapped',
    studentName: 'Taylor Testwell',
    studentId: '***-**-****',
    userId: 'user-002',
    userName: 'Officer Johnson',
    timestamp: '2024-12-24T10:30:00Z',
    ipAddress: '192.168.1.***',
    details: {
      transferCourse: 'ENGL 101',
      institutionCourse: 'ENG 101'
    }
  },
  {
    id: 'audit-004',
    action: 'Eligibility rejected',
    studentName: 'Morgan Testfield',
    studentId: '***-**-****',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T11:00:00Z',
    ipAddress: '192.168.1.***',
    details: {
      reason: 'GPA below threshold'
    }
  },
  {
    id: 'audit-005',
    action: 'Override added',
    studentName: 'Casey Testworth',
    studentId: '***-**-****',
    userId: 'user-002',
    userName: 'Officer Johnson',
    timestamp: '2024-12-24T11:15:00Z',
    ipAddress: '192.168.1.***',
    details: {
      overrideReason: 'Student has extenuating circumstances'
    }
  },
  {
    id: 'audit-006',
    action: 'Batch upload completed',
    studentName: 'Multiple Students',
    studentId: '***-**-****',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T12:00:00Z',
    ipAddress: '192.168.1.***',
    details: {
      batchId: 'batch-123',
      fileCount: 5,
      successful: 5,
      failed: 0
    }
  },
  {
    id: 'audit-007',
    action: 'Export generated',
    studentName: 'N/A',
    studentId: 'N/A',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T12:30:00Z',
    ipAddress: '192.168.1.***',
    details: {
      exportType: 'CSV',
      dateRange: '2024-12-01 to 2024-12-24'
    }
  },
  {
    id: 'audit-008',
    action: 'Login',
    studentName: 'N/A',
    studentId: 'N/A',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T08:00:00Z',
    ipAddress: '192.168.1.***',
    details: {
      loginMethod: 'password'
    }
  },
  {
    id: 'audit-009',
    action: 'Logout',
    studentName: 'N/A',
    studentId: 'N/A',
    userId: 'user-001',
    userName: 'Officer Smith',
    timestamp: '2024-12-24T17:00:00Z',
    ipAddress: '192.168.1.***',
    details: {
      sessionDuration: '9 hours'
    }
  },
  {
    id: 'audit-010',
    action: 'Manual review requested',
    studentName: 'Riley Testson',
    studentId: '***-**-****',
    userId: 'user-002',
    userName: 'Officer Johnson',
    timestamp: '2024-12-24T13:00:00Z',
    ipAddress: '192.168.1.***',
    details: {
      courseId: 'MATH 999',
      reason: 'Course not in catalog'
    }
  }
];

export const mockAuditLogResponse: AuditLogResponse = {
  entries: mockAuditLogEntries.slice(0, 10),
  total: mockAuditLogEntries.length,
  page: 1,
  limit: 10
};

export const mockFilteredAuditLogResponse: AuditLogResponse = {
  entries: mockAuditLogEntries.filter(e => e.action === 'Transcript uploaded'),
  total: 2,
  page: 1,
  limit: 10
};

export const mockExportCSVResponse: ExportResponse = {
  filename: 'audit-log-2024-12-24.csv',
  contentType: 'text/csv',
  data: 'Action,Student Name,Student ID,User,Timestamp\nTranscript uploaded,Alex Testington,***-**-****,Officer Smith,2024-12-24T10:00:00Z\nEligibility approved,Jordan Testerson,***-**-****,Officer Smith,2024-12-24T10:15:00Z'
};

export const mockExportPDFResponse: ExportResponse = {
  filename: 'audit-log-2024-12-24.pdf',
  contentType: 'application/pdf',
  data: 'PDF binary data'
};

export const mockAuditEntryDetails: AuditLogEntry = {
  id: 'audit-001',
  action: 'Transcript uploaded',
  studentName: 'Alex Testington',
  studentId: '***-**-****',
  userId: 'user-001',
  userName: 'Officer Smith',
  timestamp: '2024-12-24T10:00:00Z',
  ipAddress: '192.168.1.***',
  details: {
    filename: 'alex-testington-transcript.pdf',
    fileSize: '2.5MB',
    uploadDuration: '5.2s',
    validationPassed: true
  }
};
