export interface PromptContext {
  studentId?: string;
  institutionId?: string;
  academicYear?: string;
  semester?: string;
  sport?: string;
  division?: string;
}

export interface CourseRecommendationInput {
  completedCourses: Array<{
    code: string;
    name: string;
    credits: number;
    grade: string;
  }>;
  currentGPA: number;
  totalCredits: number;
  targetGPA?: number;
  requiredCredits: number;
  concentration?: string;
  electivePreferences?: string[];
}

export interface ComplianceAnalysisInput {
  studentId: string;
  sport: string;
  division: string;
  enrollmentData: {
    creditsEnrolled: number;
    creditsCompleted: number;
    term: string;
  };
  courseHistory: Array<{
    code: string;
    credits: number;
    grade: string;
    term: string;
  }>;
}

export interface TransferCreditInput {
  sourceInstitution: string;
  sourceCourses: Array<{
    code: string;
    name: string;
    credits: number;
    description: string;
  }>;
  destinationInstitution: string;
  targetProgram: string;
}

export const PROMPT_TEMPLATES = {
  courseRecommendation: (
    input: CourseRecommendationInput,
    context?: PromptContext,
  ): string => {
    const {
      completedCourses,
      currentGPA,
      totalCredits,
      targetGPA,
      requiredCredits,
      concentration,
      electivePreferences,
    } = input;

    return `You are an academic advisor helping a student select courses for the upcoming semester.

STUDENT PROFILE:
- Current GPA: ${currentGPA}
- Total Credits Completed: ${totalCredits}
- Credits Required to Graduate: ${requiredCredits}
- Remaining Credits Needed: ${requiredCredits - totalCredits}
${targetGPA ? `- Target GPA: ${targetGPA}` : ""}
${concentration ? `- Concentration/Major: ${concentration}` : ""}
${context?.sport ? `- Athlete: ${context.sport} (${context.division})` : ""}
${electivePreferences ? `- Elective Interests: ${electivePreferences.join(", ")}` : ""}

COMPLETED COURSES:
${completedCourses.map((c) => `  • ${c.code} - ${c.name} (${c.credits} credits): ${c.grade}`).join("\n")}

TASKS:
1. Analyze the student's academic progress and identify areas for improvement
2. Recommend 4-6 courses for the upcoming semester based on:
   - Remaining degree requirements
   - Current academic performance
   - Concentration requirements
   - Elective preferences
3. For each recommendation, provide:
   - Course code and name
   - Credits
   - Reason for recommendation (e.g., fulfills requirement, builds on completed courses, aligns with interests)
   - Expected difficulty level (easy/moderate/challenging)
4. Include a brief academic plan highlighting:
   - Courses to prioritize (critical for graduation timeline)
   - Courses that might need additional support
   - Potential conflicts or scheduling considerations

Please provide recommendations in a clear, structured format. Focus on helping the student stay on track for graduation while considering their academic performance and goals.`;
  },

  complianceAnalysis: (
    input: ComplianceAnalysisInput,
    context?: PromptContext,
  ): string => {
    const { studentId, sport, division, enrollmentData, courseHistory } = input;

    return `You are a compliance officer analyzing a student-athlete's academic eligibility.

STUDENT-ATHLETE PROFILE:
- Student ID: ${studentId}
- Sport: ${sport}
- Division: ${division}
${context?.institutionId ? `- Institution ID: ${context.institutionId}` : ""}
${context?.semester ? `- Current Semester: ${context.semester}` : ""}

CURRENT ENROLLMENT:
- Credits Enrolled: ${enrollmentData.creditsEnrolled}
- Credits Completed: ${enrollmentData.creditsCompleted}
- Term: ${enrollmentData.term}

COURSE HISTORY:
${courseHistory.map((c) => `  • ${c.code} (${c.credits} credits): ${c.grade} - ${c.term}`).join("\n")}

TASKS:
1. Analyze the student's NCAA academic eligibility based on:
   - ${division} requirements
   - ${sport} specific rules (if applicable)
   - Credit hour progression rules
   - GPA requirements for eligibility
   - Satisfactory progress rules

2. Identify potential compliance concerns:
   - Credit hour deficiencies
   - GPA below minimum requirements
   - Failed or withdrawn courses impacting eligibility
   - Transfer credit issues (if applicable)
   - Degree progress concerns

3. Provide specific recommendations:
   - Actions needed to maintain/restore eligibility
   - Academic support recommendations
   - Course registration strategies
   - Documentation requirements

4. Rate compliance status:
   - COMPLIANT: No issues
   - AT RISK: Minor concerns, monitor closely
   - NON-COMPLIANT: Immediate action required

Please provide a thorough analysis with specific references to NCAA requirements and actionable recommendations.`;
  },

  transferCreditEvaluation: (input: TransferCreditInput): string => {
    const {
      sourceInstitution,
      sourceCourses,
      destinationInstitution,
      targetProgram,
    } = input;

    return `You are an admissions officer evaluating transfer credits for a student applicant.

TRANSFER CREDIT EVALUATION:

SOURCE INSTITUTION:
${sourceInstitution}

SOURCE COURSES:
${sourceCourses
  .map(
    (c) => `  • ${c.code} - ${c.name}
    Credits: ${c.credits}
    Description: ${c.description}`,
  )
  .join("\n\n")}

DESTINATION:
- Institution: ${destinationInstitution}
- Target Program: ${targetProgram}

TASKS:
1. For each source course, evaluate:
   - Credit transferability (full/partial/no credit)
   - Course equivalency at destination institution
   - Applicability to general education requirements
   - Applicability to major/program requirements
   - Potential grade impact (if applicable)

2. Provide an overall transfer summary:
   - Total transferable credits
   - Estimated remaining credits for degree
   - Potential impact on graduation timeline
   - Recommended next steps

3. Identify courses requiring additional review:
   - Coursework needing departmental evaluation
   - Courses with unclear equivalencies
   - Credits that may not transfer

Please provide a detailed evaluation with clear recommendations for each course.`;
  },

  academicPerformanceInsight: (data: {
    gpa: number;
    credits: number;
    courses: Array<{ grade: string; credits: number; name: string }>;
    semester: string;
  }): string => {
    const { gpa, credits, courses, semester } = data;

    return `You are an academic advisor providing performance insights for the ${semester} semester.

ACADEMIC PERFORMANCE SUMMARY:
- Semester GPA: ${gpa}
- Total Credits Attempted: ${credits}
- Number of Courses: ${courses.length}

COURSE PERFORMANCE:
${courses.map((c) => `  • ${c.name}: ${c.grade} (${c.credits} credits)`).join("\n")}

TASKS:
1. Analyze overall performance:
   - Compare GPA with institutional averages (if known)
   - Identify performance trends
   - Note any significant achievements or concerns

2. Provide specific insights:
   - Strengths demonstrated this semester
   - Areas needing improvement
   - Patterns in course performance (by subject, difficulty, etc.)

3. Recommendations:
   - Academic strategies for next semester
   - Course selection advice
   - Support resources to consider
   - Study habit adjustments

Please provide constructive, actionable feedback that helps the student understand their performance and plan for improvement.`;
  },

  eligibilityChecklist: (context: PromptContext): string => {
    return `You are creating an eligibility checklist for ${context?.sport || "student-athletes"} in the ${context?.division || "NCAA"} division.

TASKS:
1. Create a comprehensive checklist covering:
   - Academic requirements (GPA, credit hours, degree progress)
   - Enrollment requirements (full-time status, course load)
   - Timeline requirements (progress benchmarks by year)
   - Documentation requirements (transcripts, verification)
   - Deadlines and reporting requirements

2. For each checklist item, include:
   - Clear requirement description
   - Compliance status indicators
   - Reference to NCAA rule/manual section
   - Recommended monitoring frequency

3. Structure the checklist by:
   - Initial eligibility
   - Continuing eligibility (by academic year)
   - Transfer requirements (if applicable)
   - Season-specific requirements

Please provide a clear, actionable checklist that can be used for ongoing compliance monitoring.`;
  },
} as const;

export type PromptTemplateName = keyof typeof PROMPT_TEMPLATES;

export function getPromptTemplate(
  templateName: PromptTemplateName,
): (...args: any[]) => string {
  return PROMPT_TEMPLATES[templateName];
}

export function buildPrompt(
  templateName: PromptTemplateName,
  input: unknown,
  context?: PromptContext,
): string {
  const template = getPromptTemplate(templateName);
  return template(input as any, context);
}
