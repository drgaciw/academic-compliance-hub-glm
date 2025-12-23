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

export interface Course {
  courseId: string;
  courseCode: string;
  credits: number;
  grade: number;
  isCore: boolean;
  term: string;
  year: number;
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

export interface ProgressTowardDegree {
  percentageComplete: number;
  requiredPercentage: number;
  totalDegreeCredits: number;
  creditsEarned: number;
}

export interface Transcript {
  studentId: string;
  courses: Course[];
  cumulativeGPA: number;
  transferGPA?: number;
}

export interface RuleConfig {
  ruleId: string;
  version: string;
  enabled: boolean;
  parameters?: Record<string, unknown> | undefined;
  institutionOverrides?: Record<string, Record<string, unknown>> | undefined;
}

export interface RuleEvaluationContext {
  institutionId?: string;
  season?: string;
  sport?: string;
  term?: string;
}
