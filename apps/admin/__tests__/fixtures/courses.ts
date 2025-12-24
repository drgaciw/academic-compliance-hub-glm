/**
 * Course Mapping Fixtures
 * 
 * FERPA-Compliant Test Data
 * All test data uses synthetic, non-identifiable information.
 * No real student data is used in testing.
 */

export interface TransferCourse {
  id: string;
  studentId: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  institution: string;
  mappedTo: string | null;
}

export interface InstitutionCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
}

export interface CourseMapping {
  id: string;
  transferCourseId: string;
  institutionCourseId: string;
  mappedAt: string;
}

export interface BulkMappingResponse {
  mappings: CourseMapping[];
  total: number;
  successful: number;
  failed: number;
}

export const mockTransferCourses: TransferCourse[] = [
  {
    id: 'transfer-001',
    studentId: 'STU001',
    code: 'ENGL 101',
    name: 'English Composition I',
    credits: 3,
    grade: 'A',
    institution: 'Community College',
    mappedTo: null
  },
  {
    id: 'transfer-002',
    studentId: 'STU001',
    code: 'MATH 201',
    name: 'Calculus I',
    credits: 4,
    grade: 'B+',
    institution: 'State University',
    mappedTo: null
  },
  {
    id: 'transfer-003',
    studentId: 'STU001',
    code: 'HIST 101',
    name: 'World History',
    credits: 3,
    grade: 'A-',
    institution: 'Community College',
    mappedTo: null
  },
  {
    id: 'transfer-004',
    studentId: 'STU002',
    code: 'CHEM 101',
    name: 'General Chemistry',
    credits: 4,
    grade: 'B',
    institution: 'State University',
    mappedTo: null
  },
  {
    id: 'transfer-005',
    studentId: 'STU002',
    code: 'PHYS 101',
    name: 'Physics I',
    credits: 4,
    grade: 'A-',
    institution: 'Community College',
    mappedTo: null
  }
];

export const mockInstitutionCourses: InstitutionCourse[] = [
  {
    id: 'inst-001',
    code: 'ENG 101',
    name: 'English Composition I',
    credits: 3,
    department: 'English'
  },
  {
    id: 'inst-002',
    code: 'MAT 201',
    name: 'Calculus I',
    credits: 4,
    department: 'Mathematics'
  },
  {
    id: 'inst-003',
    code: 'HIS 101',
    name: 'World History',
    credits: 3,
    department: 'History'
  },
  {
    id: 'inst-004',
    code: 'CHM 101',
    name: 'General Chemistry',
    credits: 4,
    department: 'Chemistry'
  },
  {
    id: 'inst-005',
    code: 'PHY 101',
    name: 'Physics I',
    credits: 4,
    department: 'Physics'
  },
  {
    id: 'inst-006',
    code: 'BIO 101',
    name: 'Biology I',
    credits: 4,
    department: 'Biology'
  },
  {
    id: 'inst-007',
    code: 'PSY 101',
    name: 'Introduction to Psychology',
    credits: 3,
    department: 'Psychology'
  },
  {
    id: 'inst-008',
    code: 'SOC 101',
    name: 'Introduction to Sociology',
    credits: 3,
    department: 'Sociology'
  }
];

export const mockCourseMapping: CourseMapping = {
  id: 'mapping-' + Date.now(),
  transferCourseId: 'transfer-001',
  institutionCourseId: 'inst-001',
  mappedAt: new Date().toISOString()
};

export const mockBulkMappingResponse: BulkMappingResponse = {
  mappings: [
    {
      id: 'mapping-' + Date.now() + '-1',
      transferCourseId: 'transfer-001',
      institutionCourseId: 'inst-001',
      mappedAt: new Date().toISOString()
    },
    {
      id: 'mapping-' + Date.now() + '-2',
      transferCourseId: 'transfer-002',
      institutionCourseId: 'inst-002',
      mappedAt: new Date().toISOString()
    },
    {
      id: 'mapping-' + Date.now() + '-3',
      transferCourseId: 'transfer-003',
      institutionCourseId: 'inst-003',
      mappedAt: new Date().toISOString()
    }
  ],
  total: 3,
  successful: 3,
  failed: 0
};

export const mockManualReviewRequest = {
  id: 'review-' + Date.now(),
  transferCourseId: 'transfer-004',
  reason: 'Course not in catalog',
  status: 'pending',
  requestedAt: new Date().toISOString()
};

export const mockUnmappableCourse: TransferCourse = {
  id: 'transfer-999',
  studentId: 'STU999',
  code: 'MATH 999',
  name: 'Advanced Calculus',
  credits: 4,
  grade: 'A',
  institution: 'Unknown University',
  mappedTo: null
};
