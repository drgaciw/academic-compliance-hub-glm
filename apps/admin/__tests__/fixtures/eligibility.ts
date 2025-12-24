/**
 * Eligibility Fixtures
 * 
 * FERPA-Compliant Test Data
 * All test data uses synthetic, non-identifiable information.
 * No real student data is used in testing.
 */

export interface EligibilityStatus {
  studentId: string;
  studentName: string;
  gpa: number;
  credits: number;
  status: 'eligible' | 'ineligible' | 'pending';
  requirements: Requirement[];
  overrideReason?: string;
  updatedAt?: string;
}

export interface Requirement {
  name: string;
  met: boolean;
  value: number;
  required: number;
}

export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  sport: string;
  sourceInstitution: string;
  targetInstitution: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  submittedDate: string;
  creditCount: number;
  violations: number;
}

export interface WhatIfResponse {
  studentId: string;
  currentStatus: 'eligible' | 'ineligible';
  projectedStatus: 'eligible' | 'ineligible';
  currentGPA: number;
  projectedGPA: number;
  currentCredits: number;
  projectedCredits: number;
  requirements: Requirement[];
}

export const mockEligibilityStatuses: EligibilityStatus[] = [
  {
    studentId: 'STU001',
    studentName: 'Alex Testington',
    gpa: 3.7,
    credits: 90,
    status: 'eligible',
    requirements: [
      { name: 'GPA Requirement', met: true, value: 3.7, required: 2.5 },
      { name: 'Credit Requirement', met: true, value: 90, required: 24 },
      { name: 'Progress Requirement', met: true, value: 90, required: 12 }
    ]
  },
  {
    studentId: 'STU002',
    studentName: 'Jordan Testerson',
    gpa: 2.8,
    credits: 45,
    status: 'ineligible',
    requirements: [
      { name: 'GPA Requirement', met: true, value: 2.8, required: 2.5 },
      { name: 'Credit Requirement', met: true, value: 45, required: 24 },
      { name: 'Progress Requirement', met: true, value: 45, required: 12 }
    ]
  },
  {
    studentId: 'STU003',
    studentName: 'Taylor Testwell',
    gpa: 2.3,
    credits: 18,
    status: 'ineligible',
    requirements: [
      { name: 'GPA Requirement', met: false, value: 2.3, required: 2.5 },
      { name: 'Credit Requirement', met: false, value: 18, required: 24 },
      { name: 'Progress Requirement', met: true, value: 18, required: 12 }
    ]
  }
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval-001',
    studentId: 'STU001',
    studentName: 'Alex Testington',
    sport: 'Football',
    sourceInstitution: 'Community College',
    targetInstitution: 'State University',
    status: 'pending',
    priority: 'high',
    submittedDate: '2024-12-20',
    creditCount: 45,
    violations: 2
  },
  {
    id: 'eval-002',
    studentId: 'STU002',
    studentName: 'Jordan Testerson',
    sport: 'Basketball',
    sourceInstitution: 'State University',
    targetInstitution: 'National University',
    status: 'pending',
    priority: 'medium',
    submittedDate: '2024-12-21',
    creditCount: 32,
    violations: 1
  },
  {
    id: 'eval-003',
    studentId: 'STU003',
    studentName: 'Taylor Testwell',
    sport: 'Baseball',
    sourceInstitution: 'Community College',
    targetInstitution: 'State University',
    status: 'in_review',
    priority: 'low',
    submittedDate: '2024-12-19',
    creditCount: 28,
    violations: 0
  },
  {
    id: 'eval-004',
    studentId: 'STU004',
    studentName: 'Morgan Testfield',
    sport: 'Soccer',
    sourceInstitution: 'National University',
    targetInstitution: 'State University',
    status: 'pending',
    priority: 'high',
    submittedDate: '2024-12-22',
    creditCount: 60,
    violations: 3
  },
  {
    id: 'eval-005',
    studentId: 'STU005',
    studentName: 'Casey Testworth',
    sport: 'Track & Field',
    sourceInstitution: 'Community College',
    targetInstitution: 'National University',
    status: 'approved',
    priority: 'low',
    submittedDate: '2024-12-15',
    creditCount: 38,
    violations: 0
  }
];

export const mockWhatIfResponse: WhatIfResponse = {
  studentId: 'STU001',
  currentStatus: 'eligible',
  projectedStatus: 'eligible',
  currentGPA: 3.7,
  projectedGPA: 3.5,
  currentCredits: 90,
  projectedCredits: 96,
  requirements: [
    { name: 'GPA Requirement', met: true, value: 3.5, required: 2.5 },
    { name: 'Credit Requirement', met: true, value: 96, required: 24 },
    { name: 'Progress Requirement', met: true, value: 96, required: 12 }
  ]
};

export const mockWhatIfIneligibleResponse: WhatIfResponse = {
  studentId: 'STU003',
  currentStatus: 'ineligible',
  projectedStatus: 'eligible',
  currentGPA: 2.3,
  projectedGPA: 2.6,
  currentCredits: 18,
  projectedCredits: 30,
  requirements: [
    { name: 'GPA Requirement', met: true, value: 2.6, required: 2.5 },
    { name: 'Credit Requirement', met: true, value: 30, required: 24 },
    { name: 'Progress Requirement', met: true, value: 30, required: 12 }
  ]
};

export const mockApprovalResponse = {
  studentId: 'STU001',
  status: 'approved',
  approvedBy: 'admin@example.com',
  approvedAt: new Date().toISOString(),
  overrideReason: undefined
};

export const mockRejectionResponse = {
  studentId: 'STU002',
  status: 'rejected',
  rejectedBy: 'admin@example.com',
  rejectedAt: new Date().toISOString(),
  reason: 'GPA below threshold'
};

export const mockOverrideResponse = {
  studentId: 'STU003',
  status: 'approved',
  approvedBy: 'admin@example.com',
  approvedAt: new Date().toISOString(),
  overrideReason: 'Student has extenuating circumstances'
};
