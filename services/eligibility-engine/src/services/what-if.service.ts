import { prisma } from "@aah/database";
import {
  CumulativeGPACalculator,
  SubjectAreaGPACalculator,
  type CourseWithSubject,
} from "@aah/compliance-engine";
import { GPAService, PTDService } from "./index.js";
import type {
  WhatIfScenarioRequest,
  EvaluationResult,
  CourseGradeInput,
} from "../types/index.js";

export interface ScenarioResult {
  scenarioName: string;
  scenarioType: ScenarioType;
  studentId: string;
  assumptions: WhatIfScenarioRequest["assumptions"];
  projected: {
    gpa: number;
    credits: number;
    eligibilityStatus: "eligible" | "ineligible" | "conditional";
    violations: EvaluationResult[];
    subjectAreaGPAs: SubjectAreaGPAProjection[];
    progressTowardDegree: {
      percentageComplete: number;
      creditsEarned: number;
      creditsRemaining: number;
      onTrack: boolean;
    };
  };
  comparison: {
    currentGPA: number;
    projectedGPA: number;
    gpaChange: number;
    currentCredits: number;
    projectedCredits: number;
    creditChange: number;
    riskFactors: RiskFactor[];
  };
  recommendations: InterventionRecommendation[];
  criticalPathCourses: string[];
}

export type ScenarioType =
  | "add_course"
  | "change_grade"
  | "drop_course"
  | "retake_course"
  | "change_major"
  | "custom";

export interface SubjectAreaGPAProjection {
  subjectCode: string;
  currentGPA: number;
  projectedGPA: number;
  change: number;
  meetsMinimum: boolean;
  minimumRequired: number | null;
}

export interface RiskFactor {
  category: "gpa" | "credits" | "progress" | "subject_area";
  severity: "critical" | "major" | "minor";
  description: string;
  currentValue: number;
  requiredValue: number;
  difference: number;
}

export interface InterventionRecommendation {
  priority: "high" | "medium" | "low";
  action: string;
  rationale: string;
  timeline?: string;
  impact: string;
}

export interface ScenarioComparisonResult {
  studentId: string;
  baseScenario: ScenarioResult;
  comparedScenarios: ScenarioResult[];
  bestScenario: {
    name: string;
    reason: string;
    result: ScenarioResult;
  };
  rankings: ScenarioRanking[];
  criticalPathCourses: string[];
}

export interface ScenarioRanking {
  scenarioName: string;
  scenarioType: ScenarioType;
  overallScore: number;
  gpaScore: number;
  creditScore: number;
  riskScore: number;
  eligibilityScore: number;
}

export class WhatIfService {
  static async runScenario(
    request: WhatIfScenarioRequest,
  ): Promise<ScenarioResult> {
    const { studentId, scenarioName, assumptions } = request;

    const currentGPA = await GPAService.calculateGPA({ studentId });
    const currentPTD = await PTDService.calculateProgressTowardDegree({
      studentId,
    });

    let projectedCourses = [...(assumptions.projectedGrades || [])];
    if (assumptions.additionalCourses) {
      projectedCourses = [
        ...projectedCourses,
        ...assumptions.additionalCourses,
      ];
    }

    if (assumptions.repeatCourses && assumptions.repeatCourses.length > 0) {
      projectedCourses = this.applyCourseRetakes(
        projectedCourses,
        assumptions.repeatCourses,
      );
    }

    const projectedGPA = await GPAService.predictGPA(
      studentId,
      projectedCourses,
      assumptions.targetGPA || 2.0,
    );

    const additionalCredits = projectedCourses.reduce(
      (sum, c) => sum + c.credits,
      0,
    );
    const projectedCredits =
      currentPTD.breakdown.totalEarned + additionalCredits;

    const eligibilityStatus = this.determineEligibilityStatus(
      projectedGPA.projectedGPA,
      projectedCredits,
      currentPTD.progress.totalDegreeCredits,
    );

    const violations = await this.identifyPotentialViolations(
      projectedGPA,
      projectedCredits,
      currentPTD,
    );

    const subjectAreaGPAs = await this.projectSubjectAreaGPAs(
      studentId,
      projectedCourses,
    );

    const progressTowardDegree = this.projectProgressTowardDegree(
      currentPTD,
      projectedCredits,
    );

    const riskFactors = this.analyzeRiskFactors(
      currentGPA.result.gpa,
      projectedGPA.projectedGPA,
      currentPTD.breakdown.totalEarned,
      projectedCredits,
      subjectAreaGPAs,
    );

    const recommendations = this.generateRecommendations(
      projectedGPA,
      eligibilityStatus,
      violations,
      riskFactors,
      subjectAreaGPAs,
    );

    const criticalPathCourses = await this.identifyCriticalPathCourses(
      studentId,
      projectedCourses,
    );

    const scenarioType = this.determineScenarioType(assumptions);

    return {
      scenarioName,
      scenarioType,
      studentId,
      assumptions,
      projected: {
        gpa: projectedGPA.projectedGPA,
        credits: projectedCredits,
        eligibilityStatus,
        violations,
        subjectAreaGPAs,
        progressTowardDegree,
      },
      comparison: {
        currentGPA: currentGPA.result.gpa,
        projectedGPA: projectedGPA.projectedGPA,
        gpaChange: projectedGPA.projectedGPA - currentGPA.result.gpa,
        currentCredits: currentPTD.breakdown.totalEarned,
        projectedCredits,
        creditChange: additionalCredits,
        riskFactors,
      },
      recommendations,
      criticalPathCourses,
    };
  }

  static async compareScenarios(
    studentId: string,
    scenarios: WhatIfScenarioRequest[],
  ): Promise<ScenarioComparisonResult> {
    const results = await Promise.all(
      scenarios.map((scenario) => this.runScenario({ ...scenario, studentId })),
    );

    const baseScenario = results[0];
    const comparedScenarios = results.slice(1);

    const rankings = this.rankScenarios(results);

    const bestScenarioData = rankings[0];
    const bestScenario = {
      name: bestScenarioData.scenarioName,
      reason: this.getBestScenarioReason(bestScenarioData),
      result: results.find(
        (r) => r.scenarioName === bestScenarioData.scenarioName,
      )!,
    };

    const criticalPathCourses = this.extractCriticalPaths(results);

    return {
      studentId,
      baseScenario,
      comparedScenarios,
      bestScenario,
      rankings,
      criticalPathCourses,
    };
  }

  static async runAddCourseScenario(
    studentId: string,
    courseToAdd: CourseGradeInput,
  ): Promise<ScenarioResult> {
    return this.runScenario({
      studentId,
      scenarioName: `Add ${courseToAdd.courseId}`,
      assumptions: {
        additionalCourses: [courseToAdd],
      },
    });
  }

  static async runChangeGradeScenario(
    studentId: string,
    courseId: string,
    newGrade: string | number,
  ): Promise<ScenarioResult> {
    return this.runScenario({
      studentId,
      scenarioName: `Change grade in ${courseId}`,
      assumptions: {
        projectedGrades: [
          {
            courseId,
            credits: 3,
            grade: newGrade,
          },
        ],
      },
    });
  }

  static async runDropCourseScenario(
    studentId: string,
    courseId: string,
  ): Promise<ScenarioResult> {
    const currentCourses = await this.getCurrentStudentCourses(studentId);
    const remainingCourses = currentCourses.filter(
      (c) => c.courseId !== courseId,
    );

    return this.runScenario({
      studentId,
      scenarioName: `Drop ${courseId}`,
      assumptions: {
        additionalCourses: [],
        projectedGrades: remainingCourses,
      },
    });
  }

  static async runRetakeCourseScenario(
    studentId: string,
    courseId: string,
    newGrade: string | number,
  ): Promise<ScenarioResult> {
    return this.runScenario({
      studentId,
      scenarioName: `Retake ${courseId}`,
      assumptions: {
        repeatCourses: [courseId],
        additionalCourses: [
          {
            courseId,
            credits: 3,
            grade: newGrade,
          },
        ],
      },
    });
  }

  static async runChangeMajorScenario(
    studentId: string,
    newMajor: string,
    requiredCourses: CourseGradeInput[],
  ): Promise<ScenarioResult> {
    return this.runScenario({
      studentId,
      scenarioName: `Change major to ${newMajor}`,
      assumptions: {
        additionalCourses: requiredCourses,
      },
    });
  }

  static async calculateRequiredPerformance(
    studentId: string,
    targetGPA: number,
    creditsToComplete: number,
  ) {
    const current = await GPAService.calculateGPA({ studentId });

    const totalQualityPointsNeeded =
      targetGPA * (current.result.totalCredits + creditsToComplete);
    const currentQualityPoints =
      current.result.gpa * current.result.totalCredits;
    const neededQualityPoints = totalQualityPointsNeeded - currentQualityPoints;
    const neededGPA = neededQualityPoints / creditsToComplete;

    return {
      targetGPA,
      currentGPA: current.result.gpa,
      creditsToComplete,
      requiredGPA: Math.round(neededGPA * 1000) / 1000,
      achievable: neededGPA <= 4.0,
      recommendedGrades: this.generateRecommendedGrades(neededGPA),
    };
  }

  static async analyzeAtRiskScenarios(
    studentId: string,
    scenarioCount: number = 5,
  ): Promise<ScenarioResult[]> {
    const currentGPA = await GPAService.calculateGPA({ studentId });
    const currentPTD = await PTDService.calculateProgressTowardDegree({
      studentId,
    });

    const atRiskScenarios: WhatIfScenarioRequest[] = [];

    const riskThresholds = [
      { grade: "F", label: "All F's" },
      { grade: "D", label: "All D's" },
      { grade: "C", label: "All C's" },
      { grade: "C-", label: "All C-'s" },
      { grade: "B-", label: "All B-'s" },
    ];

    for (const threshold of riskThresholds) {
      atRiskScenarios.push({
        studentId,
        scenarioName: `Risk Scenario: ${threshold.label}`,
        assumptions: {
          projectedGrades: [
            {
              courseId: "MATH201",
              credits: 3,
              grade: threshold.grade,
            },
            {
              courseId: "ENGL201",
              credits: 3,
              grade: threshold.grade,
            },
          ],
        },
      });
    }

    const results = await Promise.all(
      atRiskScenarios
        .slice(0, scenarioCount)
        .map((scenario) => this.runScenario(scenario)),
    );

    return results.filter(
      (r) => r.projected.eligibilityStatus === "ineligible",
    );
  }

  private static async getCurrentStudentCourses(
    studentId: string,
  ): Promise<CourseGradeInput[]> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        courses: {
          where: { status: "COMPLETED" },
          include: { course: true },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return student.courses.map((enrollment: any) => ({
      courseId: enrollment.courseId,
      credits: enrollment.course.credits,
      grade: enrollment.grade || "F",
    }));
  }

  private static applyCourseRetakes(
    projectedCourses: CourseGradeInput[],
    repeatCourses: string[],
  ): CourseGradeInput[] {
    return projectedCourses.filter(
      (course) => !repeatCourses.includes(course.courseId),
    );
  }

  private static determineScenarioType(
    assumptions: WhatIfScenarioRequest["assumptions"],
  ): ScenarioType {
    if (assumptions.additionalCourses?.length === 1) {
      return "add_course";
    }
    if (
      assumptions.projectedGrades?.length === 1 &&
      !assumptions.additionalCourses
    ) {
      return "change_grade";
    }
    if (assumptions.repeatCourses && assumptions.repeatCourses.length > 0) {
      return "retake_course";
    }
    if (assumptions.creditsToComplete) {
      return "change_major";
    }
    return "custom";
  }

  private static determineEligibilityStatus(
    projectedGPA: number,
    projectedCredits: number,
    totalDegreeCredits: number,
  ): "eligible" | "ineligible" | "conditional" {
    const gpaRequirement = 2.0;
    const ptdRequirement = totalDegreeCredits * 0.4;

    if (
      projectedGPA < gpaRequirement * 0.9 ||
      projectedCredits < ptdRequirement * 0.9
    ) {
      return "ineligible";
    }
    if (projectedGPA < gpaRequirement || projectedCredits < ptdRequirement) {
      return "conditional";
    }
    return "eligible";
  }

  private static async identifyPotentialViolations(
    projectedGPA: any,
    projectedCredits: number,
    currentPTD: any,
  ): Promise<EvaluationResult[]> {
    const violations: EvaluationResult[] = [];
    const gpaRequirement = 2.0;
    const ptdRequirement = currentPTD.progress.totalDegreeCredits * 0.4;

    if (projectedGPA.projectedGPA < gpaRequirement) {
      violations.push({
        passed: false,
        ruleId: "gpa-requirement",
        ruleName: "GPA Requirement",
        bylawReference: "NCAA Bylaw 14.3.1",
        message: `Projected GPA of ${projectedGPA.projectedGPA} is below required ${gpaRequirement}`,
        details: {
          currentValue: projectedGPA.projectedGPA,
          requiredValue: gpaRequirement,
          difference: projectedGPA.projectedGPA - gpaRequirement,
        },
      });
    }

    if (projectedCredits < ptdRequirement) {
      violations.push({
        passed: false,
        ruleId: "ptd-requirement",
        ruleName: "Progress Toward Degree",
        bylawReference: "NCAA Bylaw 14.3.2",
        message: `Projected credits of ${projectedCredits} is below required ${ptdRequirement}`,
        details: {
          currentValue: projectedCredits,
          requiredValue: ptdRequirement,
          difference: projectedCredits - ptdRequirement,
        },
      });
    }

    return violations;
  }

  private static async projectSubjectAreaGPAs(
    studentId: string,
    projectedCourses: CourseGradeInput[],
  ): Promise<SubjectAreaGPAProjection[]> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        courses: {
          where: { status: "COMPLETED" },
          include: { course: true },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const completedCourses: CourseWithSubject[] = student.courses.map(
      (c: any) => ({
        courseId: c.courseId,
        credits: c.course.credits,
        grade: c.grade ? CumulativeGPACalculator.letterToNumeric(c.grade) : 0,
        subjectCode: c.course.department,
        subjectName: c.course.department,
        isCore: false,
      }),
    );

    const projectedWithSubject: CourseWithSubject[] = [];
    for (const course of projectedCourses) {
      const courseInfo = await prisma.course.findUnique({
        where: { id: course.courseId },
      });

      if (courseInfo) {
        projectedWithSubject.push({
          courseId: course.courseId,
          credits: course.credits,
          grade:
            typeof course.grade === "string"
              ? CumulativeGPACalculator.letterToNumeric(course.grade)
              : course.grade,
          subjectCode: courseInfo.department,
          subjectName: courseInfo.department,
          isCore: false,
        });
      }
    }

    const allCourses = [...completedCourses, ...projectedWithSubject];

    const currentSubjects =
      SubjectAreaGPACalculator.calculateAllSubjects(completedCourses);

    const projectedSubjects =
      SubjectAreaGPACalculator.calculateAllSubjects(allCourses);

    const projections: SubjectAreaGPAProjection[] = [];

    for (const current of currentSubjects) {
      const projected = projectedSubjects.find(
        (s) => s.subjectCode === current.subjectCode,
      );

      if (projected) {
        projections.push({
          subjectCode: current.subjectCode,
          currentGPA: current.gpa,
          projectedGPA: projected.gpa,
          change: projected.gpa - current.gpa,
          meetsMinimum: current.meetsMinimum || projected.meetsMinimum,
          minimumRequired: current.minimumRequired ?? null,
        });
      }
    }

    for (const projected of projectedSubjects) {
      if (!projections.find((p) => p.subjectCode === projected.subjectCode)) {
        projections.push({
          subjectCode: projected.subjectCode,
          currentGPA: 0,
          projectedGPA: projected.gpa,
          change: projected.gpa,
          meetsMinimum: projected.meetsMinimum,
          minimumRequired: projected.minimumRequired ?? null,
        });
      }
    }

    return projections.sort((a, b) =>
      a.subjectCode.localeCompare(b.subjectCode),
    );
  }

  private static projectProgressTowardDegree(
    currentPTD: any,
    projectedCredits: number,
  ): {
    percentageComplete: number;
    creditsEarned: number;
    creditsRemaining: number;
    onTrack: boolean;
  } {
    const totalDegreeCredits = currentPTD.progress.totalDegreeCredits;
    const percentageComplete =
      totalDegreeCredits > 0 ? projectedCredits / totalDegreeCredits : 0;
    const requiredPercentage = 0.4;

    return {
      percentageComplete,
      creditsEarned: projectedCredits,
      creditsRemaining: Math.max(0, totalDegreeCredits - projectedCredits),
      onTrack: percentageComplete >= requiredPercentage,
    };
  }

  private static analyzeRiskFactors(
    currentGPA: number,
    projectedGPA: number,
    currentCredits: number,
    projectedCredits: number,
    subjectAreaGPAs: SubjectAreaGPAProjection[],
  ): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    const gpaChange = projectedGPA - currentGPA;
    if (gpaChange < -0.3) {
      riskFactors.push({
        category: "gpa",
        severity: "critical",
        description: `Significant GPA decline projected (${gpaChange.toFixed(2)})`,
        currentValue: projectedGPA,
        requiredValue: 2.0,
        difference: projectedGPA - 2.0,
      });
    } else if (gpaChange < -0.1) {
      riskFactors.push({
        category: "gpa",
        severity: "major",
        description: `GPA decline projected (${gpaChange.toFixed(2)})`,
        currentValue: projectedGPA,
        requiredValue: 2.0,
        difference: projectedGPA - 2.0,
      });
    }

    for (const subject of subjectAreaGPAs) {
      if (
        subject.minimumRequired &&
        subject.projectedGPA < subject.minimumRequired
      ) {
        riskFactors.push({
          category: "subject_area",
          severity:
            subject.projectedGPA < subject.minimumRequired - 0.5
              ? "critical"
              : "major",
          description: `${subject.subjectCode} GPA below minimum requirement`,
          currentValue: subject.projectedGPA,
          requiredValue: subject.minimumRequired,
          difference: subject.projectedGPA - subject.minimumRequired,
        });
      }
    }

    return riskFactors;
  }

  private static generateRecommendations(
    projectedGPA: any,
    eligibilityStatus: "eligible" | "ineligible" | "conditional",
    violations: EvaluationResult[],
    riskFactors: RiskFactor[],
    subjectAreaGPAs: SubjectAreaGPAProjection[],
  ): InterventionRecommendation[] {
    const recommendations: InterventionRecommendation[] = [];

    if (eligibilityStatus === "ineligible") {
      recommendations.push({
        priority: "high",
        action: "Immediate intervention required to maintain eligibility",
        rationale: "Projected status is ineligible based on current trajectory",
        timeline: "This term",
        impact: "Prevents loss of eligibility",
      });
      recommendations.push({
        priority: "high",
        action: "Consider repeating courses with low grades",
        rationale: "Retaking failed courses can significantly improve GPA",
        timeline: "Next term",
        impact: "High impact on GPA recovery",
      });
    }

    if (eligibilityStatus === "conditional") {
      recommendations.push({
        priority: "medium",
        action: "Close monitoring required",
        rationale: "Student is at risk of becoming ineligible",
        timeline: "Ongoing",
        impact: "Early intervention prevents eligibility loss",
      });
    }

    if (riskFactors.length > 0) {
      for (const risk of riskFactors) {
        if (risk.category === "gpa" && risk.severity === "critical") {
          recommendations.push({
            priority: "high",
            action: "Academic coaching and tutoring recommended",
            rationale: "Significant GPA decline projected",
            timeline: "Immediate",
            impact: "Prevents further GPA decline",
          });
        }
        if (risk.category === "subject_area" && risk.severity === "critical") {
          recommendations.push({
            priority: "high",
            action: `Focus on ${risk.description.split(" ")[0]} coursework`,
            rationale: "Subject area GPA below minimum requirement",
            timeline: "This term",
            impact: "Improves subject area GPA",
          });
        }
      }
    }

    const failingSubjects = subjectAreaGPAs.filter(
      (s) => s.minimumRequired && s.projectedGPA < s.minimumRequired,
    );
    if (failingSubjects.length > 0) {
      recommendations.push({
        priority: "medium",
        action: `Address subject area deficiencies: ${failingSubjects.map((s) => s.subjectCode).join(", ")}`,
        rationale: "Multiple subject areas below minimum requirements",
        timeline: "Next 2 terms",
        impact: "Meets subject area requirements",
      });
    }

    if (violations.length > 0) {
      recommendations.push({
        priority: "high",
        action: `Address ${violations.length} violation(s) for eligibility`,
        rationale: "Violations must be resolved to maintain eligibility",
        timeline: "As soon as possible",
        impact: "Restores full eligibility",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: "low",
        action: "Continue current academic trajectory",
        rationale: "Student is on track for eligibility",
        timeline: "Ongoing",
        impact: "Maintains current status",
      });
    }

    return recommendations;
  }

  private static async identifyCriticalPathCourses(
    studentId: string,
    projectedCourses: CourseGradeInput[],
  ): Promise<string[]> {
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: {
        courses: {
          include: { course: true },
        },
      },
    });

    if (!student) {
      return [];
    }

    const criticalCourses: string[] = [];

    for (const enrollment of student.courses) {
      if ((enrollment.course as any).isCore && enrollment.grade === "F") {
        criticalCourses.push(enrollment.courseId);
      }
    }

    for (const course of projectedCourses) {
      if (course.grade === "F") {
        criticalCourses.push(course.courseId);
      }
    }

    return [...new Set(criticalCourses)];
  }

  private static rankScenarios(results: ScenarioResult[]): ScenarioRanking[] {
    const rankings: ScenarioRanking[] = results.map((result) => {
      const gpaScore = Math.min((result.projected.gpa / 4.0) * 100, 100);
      const creditScore = Math.min((result.projected.credits / 120) * 100, 100);
      const riskScore = Math.max(
        0,
        100 - result.comparison.riskFactors.length * 20,
      );
      const eligibilityScore =
        result.projected.eligibilityStatus === "eligible"
          ? 100
          : result.projected.eligibilityStatus === "conditional"
            ? 50
            : 0;

      const overallScore =
        gpaScore * 0.3 +
        creditScore * 0.3 +
        riskScore * 0.2 +
        eligibilityScore * 0.2;

      return {
        scenarioName: result.scenarioName,
        scenarioType: result.scenarioType,
        overallScore,
        gpaScore,
        creditScore,
        riskScore,
        eligibilityScore,
      };
    });

    return rankings.sort((a, b) => b.overallScore - a.overallScore);
  }

  private static getBestScenarioReason(ranking: ScenarioRanking): string {
    const reasons: string[] = [];
    if (ranking.eligibilityScore === 100) {
      reasons.push("maintains eligibility");
    }
    if (ranking.gpaScore > 75) {
      reasons.push("maximizes GPA");
    }
    if (ranking.riskScore > 80) {
      reasons.push("minimizes risk");
    }
    if (ranking.creditScore > 75) {
      reasons.push("optimizes progress");
    }
    return reasons.join(", ");
  }

  private static extractCriticalPaths(results: ScenarioResult[]): string[] {
    const allCriticalCourses = new Set<string>();
    for (const result of results) {
      for (const courseId of result.criticalPathCourses) {
        allCriticalCourses.add(courseId);
      }
    }
    return Array.from(allCriticalCourses);
  }

  private static generateRecommendedGrades(requiredGPA: number): string[] {
    if (requiredGPA >= 3.7) return ["A", "A-"];
    if (requiredGPA >= 3.3) return ["A-", "B+"];
    if (requiredGPA >= 3.0) return ["B+", "B"];
    if (requiredGPA >= 2.7) return ["B", "B-"];
    if (requiredGPA >= 2.3) return ["B-", "C+"];
    if (requiredGPA >= 2.0) return ["C+", "C"];
    return ["C", "C+"];
  }
}
