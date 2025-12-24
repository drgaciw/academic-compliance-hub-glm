export interface EvaluationRequest {
  studentId: string;
  season?: string;
  sport?: string;
  term?: string;
}

export interface GPACalculationRequest {
  studentId: string;
  courses?: CourseGradeInput[];
  includeTransfer?: boolean;
  includePassFail?: boolean;
}

export interface CourseGradeInput {
  courseId: string;
  credits: number;
  grade: string | number;
  isPassFail?: boolean;
}

export interface PTDCalculationRequest {
  studentId: string;
  degreeProgram?: string;
  includeTransferCredits?: boolean;
}

export interface WhatIfScenarioRequest {
  studentId: string;
  scenarioName: string;
  assumptions: {
    projectedGrades?: CourseGradeInput[];
    additionalCourses?: CourseGradeInput[];
    repeatCourses?: string[];
    creditsToComplete?: number;
    targetGPA?: number;
  };
}

export interface OverrideRequest {
  studentId: string;
  ruleId: string;
  override: boolean;
  justification: string;
  approvedBy?: string;
  effectiveUntil?: string;
}

export interface EligibilityViolation {
  id: string;
  studentId: string;
  ruleId: string;
  ruleName: string;
  bylawReference: string;
  severity: "critical" | "major" | "minor";
  currentValue: number;
  requiredValue: number;
  remediation: string[];
  createdAt: string;
  status: "active" | "waived" | "resolved";
}

export interface WaiverRequestInput {
  studentId: string;
  waiverType: string;
  scenario: string;
  ruleId?: string;
  violationId?: string;
  justification: string;
  documents?: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
}

export interface WaiverStatusUpdate {
  status: string;
  reviewedBy?: string;
  reviewDecision?: string;
  reviewJustification?: string;
}

export interface EvaluationResult {
  passed: boolean;
  ruleId: string;
  ruleName: string;
  bylawReference: string;
  message: string;
  details: {
    currentValue: number;
    requiredValue: number;
    difference: number;
  };
  remediation?: string[];
}

export interface EligibilityResult {
  passed: boolean;
  ruleId: string;
  ruleName: string;
  bylawReference: string;
  message: string;
  details: {
    currentValue: number;
    requiredValue: number;
    difference: number;
  };
  remediation?: string[];
}

export interface StudentRecord {
  studentId: string;
  name: string;
  gpa: number;
  completedCredits: number;
  currentCredits: number;
  academicYear: number;
  academicStanding: "good" | "warning" | "probation" | "suspension";
  coreCourseCredits?: number;
  transferCredits?: number;
  degreeCredits?: number;
  coreCourses?: string[];
  subjectAreaGPAs?: Record<string, number>;
  termCredits?: number;
  cumulativeGPA?: number;
  transferGPA?: number;
  residencyCredits?: number;
  coreCategories?: Record<string, number>;
}

export interface ProgressTowardDegree {
  percentageComplete: number;
  requiredPercentage: number;
  totalDegreeCredits: number;
  creditsEarned: number;
}

export interface Course {
  courseId: string;
  courseCode: string;
  credits: number;
  grade: number;
  isCore: boolean;
  term: string;
  year: number;
}

export interface GPACalculationResult {
  cumulativeGPA: number;
  termGPA: number;
  attemptedCredits: number;
  earnedCredits: number;
  qualityPoints: number;
}
