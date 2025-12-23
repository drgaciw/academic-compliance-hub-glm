export type StudentEligibility = {
  studentId: string;
  gpa: number;
  completedCredits: number;
  currentCredits: number;
  academicStanding: "good" | "warning" | "probation" | "suspension";
};

export type CourseRequirement = {
  courseId: string;
  requiredGPA?: number;
  requiredCredits?: number;
  prerequisites?: string[];
};

export type EligibilityRule = {
  id: string;
  name: string;
  description: string;
  evaluate: (
    student: StudentEligibility,
    requirement: CourseRequirement,
  ) => RuleResult;
};

export type RuleResult = {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
};
